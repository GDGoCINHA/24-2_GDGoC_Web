'use client';

import {useEffect, useMemo, useState} from 'react';
import {Button, Card, CardBody, Checkbox, Divider, Input, Select, SelectItem} from '@nextui-org/react';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';

/** ===== 유틸 ===== */
const ymd = (d = new Date()) => d.toISOString().slice(0, 10);
const getQS = (k) => (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get(k) || '' : '');
const setQS = (entries) => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    Object.entries(entries).forEach(([k, v]) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k)));
    window.history.replaceState({}, '', u.toString());
};

export default function AttendancePage() {
    const {apiClient} = useAuthenticatedApi(); // ✅ 인증 포함 Axios 인스턴스

    // URL state
    const [date, setDate] = useState(typeof window !== 'undefined' ? getQS('date') || ymd() : ymd());

    // data
    const [dates, setDates] = useState([]);
    const [teams, setTeams] = useState([]);     // [{ id, name, lead? }]
    const [members, setMembers] = useState([]); // [{userId,name,team(=라벨),present,...}]
    const [summary, setSummary] = useState(null);

    // UI
    const [filter, setFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState(''); // 팀 라벨 기준 필터 (''=전체)
    const [presentSet, setPresentSet] = useState(new Set()); // Set<string(userId)>
    const [dirty, setDirty] = useState(false);

    /** ===== API 래퍼 ===== */
    const api = {
        getDates: async () => (await apiClient.get('/core-attendance/meetings')).data.data, // { dates: [...] }
        addDate: async (d) => (await apiClient.post('/core-attendance/meetings', {date: d})).data.data,
        deleteDate: async (d) => (await apiClient.delete(`/core-attendance/meetings/${d}`)).data.data,

        getTeams: async () => (await apiClient.get('/core-attendance/meetings/teams')).data.data,
        getMembers: async (d) => (await apiClient.get(`/core-attendance/meetings/${d}/members`)).data.data,

        saveAttendance: async (d, userIds, present) => (await apiClient.put(`/core-attendance/meetings/${d}/attendance`, {
            userIds,
            present
        })).data.data,

        summary: async (d) => (await apiClient.get(`/core-attendance/meetings/${d}/summary`)).data.data,
    };

    /** URL 동기화 */
    useEffect(() => {
        setQS({date});
    }, [date]);

    /** 날짜 로드 */
    useEffect(() => {
        (async () => {
            try {
                const dl = await api.getDates();
                setDates(dl.dates);
                if (!dl.dates.includes(date) && dl.dates.length > 0) setDate(dl.dates[0]);
            } catch {
                alert('날짜 목록을 불러오지 못했습니다.');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 팀 로드 (리드=본인 팀만 / 관리자=전체) */
    useEffect(() => {
        (async () => {
            try {
                const list = await api.getTeams();
                setTeams(Array.isArray(list) ? list : []);
                // 자동 선택 UX(리드 등 팀 1개만 내려오면 자동 선택)
                if (!teamFilter && list?.length === 1) setTeamFilter(list[0].name);
            } catch {
                setTeams([]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 선택 날짜 → 멤버/출석 로드 */
    useEffect(() => {
        (async () => {
            if (!date) return;
            try {
                const rows = await api.getMembers(date);
                setMembers(rows);
                const init = new Set();
                rows.forEach((r) => r.present && init.add(String(r.userId)));
                setPresentSet(init);
                setDirty(false);
            } catch {
                setMembers([]);
                setPresentSet(new Set());
                setDirty(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    /** 요약 로드 */
    useEffect(() => {
        (async () => {
            if (!date) return;
            try {
                const s = await api.summary(date);
                setSummary(s);
            } catch {
                setSummary(null);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    /** 팀 옵션(라벨) */
    const teamOptions = useMemo(() => Array.from(new Set(teams.map((t) => t.name))).filter(Boolean), [teams]);

    /** 필터 적용된 멤버 */
    const filteredMembers = useMemo(() => {
        let base = members;
        if (teamFilter) base = base.filter((m) => m.team === teamFilter);
        const q = filter.trim();
        if (!q) return base;
        return base.filter((m) => m.name.includes(q));
    }, [members, filter, teamFilter]);

    /** 날짜 조작 */
    const addToday = async () => {
        try {
            const d = ymd();
            await api.addDate(d);
            const dl = await api.getDates();
            setDates(dl.dates);
            setDate(d);
        } catch {
            alert('날짜 추가에 실패했습니다.');
        }
    };

    const removeDate = async (d) => {
        try {
            await api.deleteDate(d);
            const dl = await api.getDates();
            setDates(dl.dates);
            if (d === date) setDate(dl.dates[0] ?? ymd());
        } catch {
            alert('날짜 삭제에 실패했습니다.');
        }
    };

    /** 체크 토글(로컬 상태만 변경; 서버 전송 없음) */
    const toggleMember = (m) => {
        const id = String(m.userId);
        const next = !presentSet.has(id);
        setPresentSet((prev) => {
            const n = new Set(prev);
            next ? n.add(id) : n.delete(id);
            return n;
        });
        setDirty(true);
    };

    /** (필터된) 전체 체크/해제(로컬) */
    const checkAll = (value) => {
        const baseIds = filteredMembers.map((m) => String(m.userId));
        setPresentSet((prev) => {
            const n = new Set(prev);
            if (value) baseIds.forEach((id) => n.add(id)); else baseIds.forEach((id) => n.delete(id));
            return n;
        });
        setDirty(true);
    };

    /** 저장(스냅샷) – present=true & present=false 두 번 호출 (서버는 List<Long> 기대 → 숫자로 전송) */
    const saveSnapshot = async () => {
        const allIdsStr = members.map((m) => String(m.userId));
        const presentIdsStr = allIdsStr.filter((id) => presentSet.has(id));
        const absentIdsStr = allIdsStr.filter((id) => !presentSet.has(id));
        const presentIds = presentIdsStr.map((s) => Number(s));
        const absentIds = absentIdsStr.map((s) => Number(s));

        try {
            if (presentIds.length) await api.saveAttendance(date, presentIds, true);
            if (absentIds.length) await api.saveAttendance(date, absentIds, false);
            setDirty(false);
            await refreshSummary();
            alert('저장되었습니다.');
        } catch {
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const refreshSummary = async () => {
        try {
            setSummary(await api.summary(date));
        } catch {
            setSummary(null);
        }
    };

    return (<div className="dark flex flex-col max-w-[1100px] mx-auto min-h-[100svh] py-16 px-6">
            <h1 className="font-bold mb-6 text-4xl tablet:text-3xl mobile:text-2xl text-white">출석 관리</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 날짜 */}
                <Card className="bg-default-100 dark:bg-default-50">
                    <CardBody className="gap-3 text-white">
                        <div className="flex items-center justify-between">
                            <b>날짜</b>
                            <Button size="sm" color="primary" onPress={addToday}>
                                오늘 추가
                            </Button>
                        </div>

                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            classNames={{
                                input: 'bg-transparent text-black/90 dark:text-white/90',
                                inputWrapper: 'shadow-xl bg-default-200/50 dark:bg-default/60 hover:bg-default-200/70 dark:hover:bg-default/70',
                            }}
                        />

                        <Divider/>
                        <div className="max-h-[180px] overflow-auto space-y-2">
                            {dates.map((d) => (<div key={d} className="flex items-center justify-between">
                                    <Button size="sm" variant="light" onPress={() => setDate(d)} className="text-white">
                                        {d === date ? <b>{d}</b> : d}
                                    </Button>
                                    <Button size="sm" color="danger" variant="flat" onPress={() => removeDate(d)}>
                                        삭제
                                    </Button>
                                </div>))}
                            {dates.length === 0 && <div className="text-sm text-foreground-500">등록된 날짜가 없습니다.</div>}
                        </div>
                    </CardBody>
                </Card>

                {/* 필터 & 저장 */}
                <Card className="bg-default-100 dark:bg-default-50">
                    <CardBody className="gap-3 text-white">
                        <div className="flex items-center justify-between">
                            <b>필터 / 저장</b>
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={saveSnapshot}
                                isDisabled={!dirty || !members.length}
                            >
                                저장{dirty ? ' *' : ''}
                            </Button>
                        </div>

                        {/* 팀 선택(“전체” 포함) */}
                        <Select
                            label="팀(클라이언트 필터)"
                            selectedKeys={teamFilter ? new Set([teamFilter]) : new Set(['전체'])}
                            onSelectionChange={(keys) => {
                                const first = String(Array.from(keys || [])[0] ?? '');
                                setTeamFilter(first === '전체' ? '' : first);
                            }}
                            variant="bordered"
                            classNames={{
                                trigger: 'bg-default-200/50 dark:bg-default/60',
                                label: 'text-black/50 dark:text-white/90',
                                value: 'text-black/90 dark:text-white/90',
                                popoverContent: 'bg-default-100 dark:bg-default-50',
                            }}
                        >
                            <SelectItem key="전체" value="전체" className="text-white">
                                전체
                            </SelectItem>
                            {teamOptions.map((name) => (<SelectItem key={name} value={name} className="text-white">
                                    {name}
                                </SelectItem>))}
                        </Select>

                        {/* 이름 검색 */}
                        <Input
                            placeholder="이름 검색"
                            value={filter}
                            onValueChange={setFilter}
                            size="sm"
                            isClearable
                            classNames={{
                                label: 'text-black/50 dark:text-white/90',
                                input: ['bg-transparent', 'text-black/90 dark:text-white/90', 'placeholder:text-default-700/50 dark:placeholder:text-white/60',],
                                innerWrapper: 'bg-transparent',
                                inputWrapper: ['shadow-xl', 'bg-default-200/50', 'dark:bg-default/60', 'backdrop-blur-xl', 'backdrop-saturate-200', 'hover:bg-default-200/70', 'dark:hover:bg-default/70', 'group-data-[focus=true]:bg-default-200/50', 'dark:group-data-[focus=true]:bg-default/60', '!cursor-text',].join(' '),
                            }}
                            onClear={() => setFilter('')}
                        />

                        <div className="flex gap-2">
                            <Button size="sm" onPress={() => checkAll(true)} color="success" variant="flat">
                                (필터된) 전체 체크
                            </Button>
                            <Button size="sm" onPress={() => checkAll(false)} color="warning" variant="flat">
                                (필터된) 전체 해제
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* 요약 */}
                <Card className="bg-default-100 dark:bg-default-50">
                    <CardBody className="gap-3 text-white">
                        <b>요약</b>
                        {summary ? (<div className="text-sm">
                                <div className="mb-2">전체 {summary.present} / {summary.total}</div>
                                <Divider/>
                                <div className="mt-2 space-y-1">
                                    {summary.perTeam.map((ts) => (
                                        <div key={ts.teamId} className="flex items-center justify-between">
                                            <span>{ts.teamName}</span>
                                            <span>{ts.present} / {ts.total}</span>
                                        </div>))}
                                </div>
                            </div>) : (<div className="text-foreground-500 text-sm">로딩...</div>)}
                    </CardBody>
                </Card>
            </div>

            {/* 팀원 목록 */}
            <Card className="mt-6 bg-default-100 dark:bg-default-50">
                <CardBody className="gap-3 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <b>팀원</b>
                            <div className="text-xs text-foreground-500">
                                {date} · {teamFilter || '전체 팀'}
                            </div>
                        </div>
                    </div>

                    <Divider/>

                    <div className="max-h-[460px] overflow-auto">
                        {filteredMembers.map((m) => {
                            const id = String(m.userId);
                            const checked = presentSet.has(id);
                            return (<div key={id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            isSelected={checked}
                                            onValueChange={() => toggleMember(m)}
                                            classNames={{label: 'text-white'}}
                                        >
                                            {m.name}{' '}
                                            <span className="text-xs text-foreground-500 ml-2">({m.team})</span>
                                        </Checkbox>
                                    </div>
                                </div>);
                        })}
                        {filteredMembers.length === 0 && (
                            <div className="text-sm text-foreground-500 py-3">표시할 팀원이 없습니다.</div>)}
                    </div>
                </CardBody>
            </Card>
        </div>);
}