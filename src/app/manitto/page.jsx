'use client';

import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Button, Card, CardBody, CardHeader, Divider, Input} from '@nextui-org/react';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';

export default function ManitoVerifyPage() {
    const searchParams = useSearchParams();
    const {apiClient} = useAuthenticatedApi();

    const [sessionCode, setSessionCode] = useState('');
    const [studentId, setStudentId] = useState('');
    const [hash, setHash] = useState('');

    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cipher, setCipher] = useState('');
    const [plain, setPlain] = useState(null); // 복호화 결과(JSON 등)

    useEffect(() => {
        if (!searchParams) return;
        const sCode = searchParams.get('sessionCode') || '';
        const sId = searchParams.get('studentId') || '';
        const h = searchParams.get('hash') || '';

        setSessionCode(sCode);
        setStudentId(sId);
        setHash(h);
    }, [searchParams]);

    /** ========= Base64URL → Uint8Array ========= */
    const base64UrlToBytes = (str) => {
        if (!str) return new Uint8Array();
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) base64 += '=';
        const binary = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    };

    /** ========= 실제 복호화 로직 (AES-256-GCM) =========
     * encrypted: base64url(nonce(12) + ciphertext+tag)
     * hashKey:  base64url(32바이트 랜덤) → 그대로 AES 키
     */
    const tryDecrypt = async (encrypted, hashKey) => {
        if (!encrypted || !hashKey) return null;
        if (typeof window === 'undefined' || !window.crypto?.subtle) return null;

        try {
            const combined = base64UrlToBytes(encrypted);
            if (combined.length <= 12) return null;

            const nonce = combined.slice(0, 12);
            const ciphertext = combined.slice(12);

            const keyBytes = base64UrlToBytes(hashKey);
            if (keyBytes.length !== 32) {
                console.warn('Unexpected key length:', keyBytes.length);
                return null;
            }

            const key = await window.crypto.subtle.importKey('raw', keyBytes, {name: 'AES-GCM'}, false, ['decrypt'],);

            const plainBuffer = await window.crypto.subtle.decrypt({name: 'AES-GCM', iv: nonce}, key, ciphertext,);

            const dec = new TextDecoder();
            const jsonStr = dec.decode(plainBuffer);
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Manito decrypt error:', e);
            return null;
        }
    };

    /** 🔥 encrypted(cipher) 값이 세팅되면 hash로 자동 복호화 */
    useEffect(() => {
        if (!cipher || !hash) {
            setPlain(null);
            return;
        }

        let cancelled = false;

        (async () => {
            const decoded = await tryDecrypt(cipher, hash);
            if (cancelled) return;

            if (decoded) {
                setPlain(decoded);
            } else {
                setError((prev) => (prev ? prev + '\n' : '') + '복호화에 실패했습니다. 해시 값이 올바른지 확인해 주세요.',);
                setPlain(null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cipher, hash]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCipher('');
        setPlain(null);

        if (!sessionCode || !studentId) {
            setError('세션 코드 또는 학번 정보가 잘못되었습니다. 링크를 다시 확인해 주세요.');
            return;
        }

        if (!/^\d{4}$/.test(pin)) {
            setError('PIN은 숫자 4자리여야 합니다.');
            return;
        }

        try {
            setLoading(true);

            const res = await apiClient.post('/manito/verify', {sessionCode, studentId, pin}, {},);

            const body = res.data;

            // ✅ 서버 응답 키 이름에 맞게 수정 (encryptedManito)
            const encrypted = body?.data?.encryptedManito || '';

            setCipher(encrypted); // 🔥 cipher가 바뀌면 위 useEffect가 hash로 복호화
        } catch (err) {
            const res = err?.response;
            const msg = res?.data?.message || res?.data?.error || err?.message || '알 수 없는 오류가 발생했습니다.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const disabled = !sessionCode || !studentId;

    return (<div className="dark min-h-[100svh] flex items-center justify-center bg-black px-4">
            <Card className="max-w-md w-full bg-zinc-900 border border-zinc-800">
                <CardHeader className="flex flex-col items-start gap-2">
                    <h1 className="text-2xl font-bold text-white">마니또 확인</h1>
                    <p className="text-sm text-zinc-400">
                        전달받은 링크로 접속한 뒤, 본인이 설정한 PIN 4자리를 입력해 주세요.
                    </p>
                </CardHeader>
                <Divider className="border-zinc-800"/>
                <CardBody className="flex flex-col gap-4 text-white">
                    {/* 세션/학번 정보 표시 (읽기 전용) */}
                    <div className="text-xs text-zinc-400 space-y-1">
                        <div>
                            <span className="font-semibold text-zinc-300">세션 코드: </span>
                            <span>{sessionCode || '(없음)'}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-zinc-300">학번: </span>
                            <span>{studentId || '(없음)'}</span>
                        </div>
                        {hash && (<div>
                                <span className="font-semibold text-zinc-300">해시: </span>
                                <span className="break-all">{hash}</span>
                            </div>)}
                    </div>

                    {disabled && (<p className="text-xs text-red-400">
                            세션 코드 또는 학번 정보가 누락되었습니다. 링크를 다시 확인해 주세요.
                        </p>)}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                        <Input
                            label="PIN (숫자 4자리)"
                            type="password"
                            variant="bordered"
                            value={pin}
                            maxLength={4}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                            classNames={{
                                label: 'text-zinc-300',
                                input: 'text-white',
                                inputWrapper: 'bg-zinc-900 border-zinc-700 group-data-[focus=true]:border-zinc-400',
                            }}
                            isDisabled={disabled || loading}
                        />

                        {error && (<p className="text-xs text-red-400 whitespace-pre-line">
                                {error}
                            </p>)}

                        <Button
                            type="submit"
                            color="primary"
                            isLoading={loading}
                            isDisabled={disabled || loading || !pin}
                            className="font-semibold"
                        >
                            마니또 확인하기
                        </Button>
                    </form>

                    {/* 결과 영역 */}
                    {(cipher || plain) && (<>
                            <Divider className="border-zinc-800 my-2"/>
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-zinc-200">결과</p>

                                {plain ? (<>
                                        <pre
                                            className="text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-x-auto">
                                            {JSON.stringify(plain, null, 2)}
                                        </pre>
                                        <p className="text-xs text-zinc-400">
                                            위 내용은 클라이언트에서 hash를 이용해 복호화한 결과입니다.
                                        </p>
                                    </>) : (<>
                                        <p className="text-xs text-zinc-400 mb-1">
                                            서버에서 받은 암호문(encryptedManito)입니다.
                                        </p>
                                        <pre
                                            className="text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-3 break-all">
                                            {cipher}
                                        </pre>
                                    </>)}
                            </div>
                        </>)}
                </CardBody>
            </Card>
        </div>);
}