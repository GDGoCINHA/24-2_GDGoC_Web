'use client';

import {useEffect, useState} from 'react';
import {Button, Card, CardBody, CardHeader, Divider} from '@nextui-org/react';
import { GdgInput } from '@/components/ui/input/GdgInput';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';

export default function ManitoAdminPage() {
    const {apiClient} = useAuthenticatedApi();

    // 공통
    const [sessionCode, setSessionCode] = useState('');

    // 세션 관리용
    const [sessions, setSessions] = useState([]); // [{id, code, name, createdAt,...}]
    const [newSessionCode, setNewSessionCode] = useState('');
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [loadingSessions, setLoadingSessions] = useState(false);

    // 파일
    const [participantsFile, setParticipantsFile] = useState(null);
    const [encryptedFile, setEncryptedFile] = useState(null);

    // 로딩
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [loadingEncrypted, setLoadingEncrypted] = useState(false);

    // 메시지
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const resetMessages = () => {
        setMessage('');
        setError('');
    };

    /** ====== 세션 목록 불러오기 ====== */
    const fetchSessions = async () => {
        try {
            setLoadingSessions(true);
            const res = await apiClient.get('/admin/manito/sessions');
            // ApiResponse 가정: { data: [ ... ] }
            const list = res.data?.data ?? [];
            setSessions(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
            setError('세션 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** ====== 세션 생성 ====== */
    const handleCreateSession = async () => {
        resetMessages();
        const code = newSessionCode.trim();
        const title = newSessionTitle.trim();

        if (!code) {
            setError('세션 코드를 입력해 주세요.');
            return;
        }
        if (!title) {
            setError('세션 이름을 입력해 주세요.');
            return;
        }

        try {
            setLoadingSessions(true);
            await apiClient.post('/admin/manito/sessions', {code, title});

            // 세션 목록 갱신
            await fetchSessions();
            // 공통 sessionCode 에도 세팅
            setSessionCode(code);
            setNewSessionCode('');
            setNewSessionTitle('');
            setMessage(`세션이 생성되었습니다. (code: ${code})`);
        } catch (e) {
            console.error(e);
            setError('세션 생성 중 오류가 발생했습니다.');
        } finally {
            setLoadingSessions(false);
        }
    };

    /** ===== 파일 핸들러 ===== */
    const handleParticipantsFileChange = (e) => {
        resetMessages();
        const file = e.target.files?.[0] ?? null;
        setParticipantsFile(file);
    };

    const handleEncryptedFileChange = (e) => {
        resetMessages();
        const file = e.target.files?.[0] ?? null;
        setEncryptedFile(file);
    };

    /** ===== 다운로드 공통 util ===== */
    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    /** ===== 1단계: 참가자 CSV 업로드 → 매칭 CSV 다운로드 ===== */
    const handleUploadParticipants = async () => {
        resetMessages();

        if (!sessionCode.trim()) {
            setError('세션 코드를 선택하거나 입력해 주세요.');
            return;
        }
        if (!participantsFile) {
            setError('참가자 CSV 파일을 선택해 주세요.');
            return;
        }

        try {
            setLoadingParticipants(true);

            const formData = new FormData();
            formData.append('sessionCode', sessionCode.trim());
            formData.append('file', participantsFile);

            const res = await apiClient.post('/admin/manito/upload', formData, {
                responseType: 'blob',
            });

            const blob = res.data;
            const disposition = res.headers?.['content-disposition'] || '';
            let filename = `manito-${sessionCode.trim()}.csv`;
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
                filename = match[1];
            }

            downloadBlob(blob, filename);
            setMessage('참가자 CSV 업로드 및 매칭 CSV 다운로드가 완료되었습니다.');
        } catch (e) {
            console.error(e);
            setError('참가자 CSV 업로드 또는 매칭 CSV 다운로드 중 오류가 발생했습니다.');
        } finally {
            setLoadingParticipants(false);
        }
    };

    /** ===== 2단계: 암호문 CSV 업로드 ===== */
    const handleUploadEncrypted = async () => {
        resetMessages();

        if (!sessionCode.trim()) {
            setError('세션 코드를 선택하거나 입력해 주세요.');
            return;
        }
        if (!encryptedFile) {
            setError('암호문 CSV 파일을 선택해 주세요.');
            return;
        }

        try {
            setLoadingEncrypted(true);

            const formData = new FormData();
            formData.append('sessionCode', sessionCode.trim());
            formData.append('file', encryptedFile);

            const res = await apiClient.post('/admin/manito/upload-encrypted', formData);
            const body = res.data;
            setMessage(body?.message || '암호문 CSV 업로드가 완료되었습니다.');
        } catch (e) {
            console.error(e);
            setError('암호문 CSV 업로드 중 오류가 발생했습니다.');
        } finally {
            setLoadingEncrypted(false);
        }
    };

    return (<div className="dark flex flex-col max-w-3xl mx-auto min-h-[100svh] py-16 px-6">
        <h1 className="font-bold mb-6 text-3xl text-white">마니또 관리(Admin)</h1>

        {/* 공통 설정 + 세션 등록/선택 */}
        <Card className="mb-6 bg-default-100 dark:bg-zinc-900 border border-zinc-800">
            <CardHeader className="flex flex-col items-start gap-1">
                <h2 className="text-xl font-semibold text-white">공통 설정 · 세션 관리</h2>
                <p className="text-xs text-zinc-400">
                    세션 단위로 참가자/매칭/암호문을 관리합니다.
                    <br/>
                    먼저 세션을 생성한 뒤, 해당 세션을 선택하고 아래 단계를 진행하세요.
                </p>
            </CardHeader>
            <Divider className="border-zinc-800"/>
            <CardBody className="gap-4 text-white">
                {/* 현재 사용 세션 코드 (직접 입력/수정 가능) */}
                <GdgInput
                    label="현재 사용 중인 세션 코드"
                    placeholder="예: WINTER_2025"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                />

                <Divider className="border-zinc-800"/>

                {/* 새 세션 생성 */}
                <div className="space-y-2">
                    <p className="text-sm text-zinc-300 font-semibold">새 세션 등록</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <GdgInput
                            label="세션 코드"
                            placeholder="예: WINTER_2025"
                            value={newSessionCode}
                            onChange={(e) => setNewSessionCode(e.target.value)}
                        />
                        <GdgInput
                            label="세션 이름"
                            placeholder="예: 2025 겨울 마니또"
                            value={newSessionTitle}
                            onChange={(e) => setNewSessionTitle(e.target.value)}
                        />
                    </div>
                    <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        onPress={handleCreateSession}
                        isLoading={loadingSessions}
                        className="mt-1"
                    >
                        새 세션 생성
                    </Button>
                </div>

                {/* 세션 목록 */}
                <Divider className="border-zinc-800 my-4"/>
                <div className="space-y-2">
                    <p className="text-sm text-zinc-300 font-semibold">세션 목록</p>
                    <div className="max-h-40 overflow-auto space-y-1 text-sm">
                        {loadingSessions && (<p className="text-xs text-zinc-400">세션 목록을 불러오는 중...</p>)}
                        {!loadingSessions && sessions.length === 0 && (<p className="text-xs text-zinc-500">
                            등록된 세션이 없습니다. 위에서 새 세션을 생성해 주세요.
                        </p>)}
                        {sessions.map((s) => (<div
                            key={s.id ?? s.code}
                            className="flex items-center justify-between py-1 border-b border-zinc-800/40"
                        >
                            <div className="flex flex-col">
                                        <span className="font-medium text-zinc-100">
                                            {s.title || '(이름 없음)'}
                                        </span>
                                <span className="text-xs text-zinc-400">
                                            code: {s.code}
                                        </span>
                            </div>
                            <Button
                                size="sm"
                                variant={sessionCode === s.code ? 'solid' : 'flat'}
                                color="secondary"
                                onPress={() => setSessionCode(s.code)}
                            >
                                사용
                            </Button>
                        </div>))}
                    </div>
                </div>
            </CardBody>
        </Card>

        {/* 1단계: 참가자 CSV 업로드 */}
        <Card className="mb-6 bg-default-100 dark:bg-zinc-900 border border-zinc-800">
            <CardHeader className="flex flex-col items-start gap-1">
                <h2 className="text-lg font-semibold text-white">
                    1단계 · 참가자 CSV 업로드 & 매칭 생성
                </h2>
                <p className="text-xs text-zinc-400">
                    CSV 헤더: <code>studentId,name,pin</code> · 업로드 후, 서버에서 매칭을 생성하고
                    <br/>
                    <code>giverStudentId,giverName,receiverStudentId,receiverName</code> CSV를
                    바로 다운로드합니다.
                </p>
            </CardHeader>
            <Divider className="border-zinc-800"/>
            <CardBody className="gap-4 text-white">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleParticipantsFileChange}
                    className="text-sm text-zinc-300"
                />
                <Button
                    color="primary"
                    variant="flat"
                    onPress={handleUploadParticipants}
                    isLoading={loadingParticipants}
                    isDisabled={!sessionCode.trim() || !participantsFile || loadingParticipants}
                    className="mt-2"
                >
                    참가자 CSV 업로드 & 매칭 CSV 다운로드
                </Button>
            </CardBody>
        </Card>

        {/* 2단계: 암호문 CSV 업로드 */}
        <Card className="mb-6 bg-default-100 dark:bg-zinc-900 border border-zinc-800">
            <CardHeader className="flex flex-col items-start gap-1">
                <h2 className="text-lg font-semibold text-white">
                    2단계 · 암호문(encryptedManitto) CSV 업로드
                </h2>
                <p className="text-xs text-zinc-400">
                    클라이언트에서 매칭 CSV를 기반으로 암호화한 결과를 업로드합니다.
                    <br/>
                    CSV 헤더 예시: <code>studentId,encryptedManitto</code>
                </p>
            </CardHeader>
            <Divider className="border-zinc-800"/>
            <CardBody className="gap-4 text-white">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleEncryptedFileChange}
                    className="text-sm text-zinc-300"
                />
                <Button
                    color="secondary"
                    variant="flat"
                    onPress={handleUploadEncrypted}
                    isLoading={loadingEncrypted}
                    isDisabled={!sessionCode.trim() || !encryptedFile || loadingEncrypted}
                    className="mt-2"
                >
                    암호문 CSV 업로드
                </Button>
            </CardBody>
        </Card>

        {(message || error) && (<Card className="bg-default-100 dark:bg-zinc-900 border border-zinc-800">
            <CardBody className="text-sm">
                {message && (<p className="text-emerald-400 whitespace-pre-line">{message}</p>)}
                {error && <p className="text-red-400 whitespace-pre-line">{error}</p>}
            </CardBody>
        </Card>)}
    </div>);
}