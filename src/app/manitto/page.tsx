'use client';

import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Button, Card, CardBody, CardHeader, Divider} from '@nextui-org/react';
import { GdgInput } from '@/components/ui/input/GdgInput';
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
    const [plain, setPlain] = useState(null);      // { receiverStudentId, receiverName }
    const [ownerName, setOwnerName] = useState(''); // 요청자 이름 (API에서 내려주는 값 가정)

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
                // 여기서도 error 세팅
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
        setOwnerName('');

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

            // ✅ 서버 응답 키 이름 맞춰서 사용
            const encrypted = body?.data?.encryptedManito || '';
            const owner = body?.data?.ownerName || ''; // 백엔드에서 내려준다고 가정

            setOwnerName(owner);
            setCipher(encrypted); // 🔥 cipher가 바뀌면 useEffect가 hash로 복호화
        } catch (err) {
            const res = err?.response;
            const msg = res?.data?.message || res?.data?.error || err?.message || '알 수 없는 오류가 발생했습니다.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const disabled = !sessionCode || !studentId;

    // 결과 문구 구성
    const receiverName = plain?.receiverName;
    const ownerLabel = ownerName || '당신';

    return (<div
            className="dark min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-zinc-950 via-black to-zinc-900 px-4"
        >
            <Card className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 shadow-2xl">
                <CardHeader className="flex flex-col gap-2 items-start">
                    <span className="text-xs text-zinc-400">🎁 GDGoC INHA · 마니또</span>
                    <h1 className="text-2xl font-bold text-white">
                        마니또 확인하기
                    </h1>
                    <p className="text-xs text-zinc-400">
                        전달받은 링크로 접속한 뒤,<br/>
                        본인이 설정한 PIN 4자리를 입력해 주세요.
                    </p>
                </CardHeader>

                <Divider className="border-zinc-800"/>

                <CardBody className="flex flex-col gap-4 text-white">
                    {disabled && (<p className="text-xs text-red-400">
                            필수 정보가 누락되었습니다. 링크를 다시 확인해 주세요.
                        </p>)}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
                        <GdgInput
                            label="PIN (숫자 4자리)"
                            type="password"
                            value={pin}
                            maxLength={4}
                            placeholder="ex) 0420"
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4),)}
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
                            className="font-semibold bg-gradient-to-r from-sky-500 to-cyan-400 text-black"
                        >
                            마니또 확인하기 ✨
                        </Button>
                    </form>

                    {/* 결과 영역 */}
                    {(cipher || plain) && (<>
                            <Divider className="border-zinc-800 my-2"/>
                            <div className="space-y-3 text-sm">
                                <p className="text-xs text-zinc-400">
                                    결과
                                </p>

                                {plain ? (<div
                                        className="rounded-lg bg-zinc-950/80 border border-zinc-800 px-4 py-3 space-y-2"
                                    >
                                        <p className="text-base font-semibold">
                                            {ownerLabel}
                                            <span className="text-zinc-300">님의 마니또는 </span>
                                            <span className="text-sky-400">
                                                {receiverName || '알 수 없음'}
                                            </span>
                                            <span className="text-zinc-300"> 님입니다! 🎉</span>
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mt-2">
                                            이 정보는 브라우저에서 해시값을 사용해 복호화한 결과이며,
                                            서버에는 평문으로 저장되지 않습니다.
                                        </p>
                                    </div>) : (<div
                                        className="rounded-lg bg-zinc-950/80 border border-red-500/40 px-4 py-3 space-y-1"
                                    >
                                        <p className="text-sm font-semibold text-red-400">
                                            복호화에 실패하였습니다.
                                        </p>
                                        <p className="text-[11px] text-zinc-500">
                                            해시 값이 올바른지, 전달받은 링크가 정확한지 다시 한 번
                                            확인해 주세요. 문제가 계속되면 운영진에게 문의해 주세요.
                                        </p>
                                    </div>)}
                            </div>
                        </>)}
                </CardBody>
            </Card>
        </div>);
}