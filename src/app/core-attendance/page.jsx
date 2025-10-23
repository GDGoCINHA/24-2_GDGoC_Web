'use client';

import {useEffect, useMemo, useState} from 'react';
import {Button, Card, CardBody, Checkbox, Divider, Input, Select, SelectItem} from '@nextui-org/react';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';

/** ===== 유틸 ===== */
const ymd = (d = new Date()) => d.toISOString().slice(0, 10);
const getQS = (k) => typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get(k) || '' : '';
const setQS = (entries) => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    Object.entries(entries).forEach(([k, v]) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
    window.history.replaceState({}, '', u.toString());
};

export default function AttendancePage() {
    const {apiClient} = useAuthenticatedApi(); // ✅ 인증 포함 Axios 인스턴스

    // URL state
    const [date, setDate] = useState(typeof window !== 'undefined' ? getQS('date') || ymd() : ymd());

    // data
    const [dates, setDates] = useState([]);
    const [teams, setTeams] = useState([]);           // [{ id, name, lead? }]
    const [members, setMembers] = useState([]);       // [{userId,name,team(=라벨),present,...}]
    const [summary, setSummary] = useState(null);

    // UI
    const [filter, setFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState(''); // 팀 라벨(=members[].team) 기준 필터
    const [presentSet, setPresentSet] = useState(new Set());
    const [dirty, setDirty] = useState(false);

    /** ===== API 래퍼 (인증 포함) ===== */
    const api = {
        // Dates
        getDates: async () => (await apiClient.get('/core-attendance/meetings')).data.data, // { dates: [...] }
        addDate: async (d) => (await apiClient.post('/core-attendance/meetings', {date: d})).data.data,
        deleteDate: async (d) => (await apiClient.delete(`/core-attendance/meetings/${d}`)).data.data,

        // Teams
        getTeams: async () => (await apiClient.get('/core-attendance/meetings/teams')).data.data,

        // Members (전체 팀 포함)
        getMembers: async (d) => (await apiClient.get(`/core-attendance/meetings/${d}/members`)).data.data,

        // Batch save
        saveAttendance: async (d, userIds, present) => (await apiClient.put(`/core-attendance/meetings/${d}/attendance`, {
            userIds,
            present
        })).data.data,

        // Summary(옵션)
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
                const dl = await api.getDates(); // { dates: [...] }
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
                // 선택된 필터가 없고, 서버가 1개만 보내줬다면 자동 선택(리드인 경우 UX)
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
    }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

    /** 요약 로드(옵션) */
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
    }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

    // 팀 옵션: 서버에서 내려준 팀 라벨(name) 사용 (members[].team과 동일한 라벨로 필터링)
    const teamOptions = useMemo(() => Array.from(new Set(teams.map((t) => t.name))).filter(Boolean), [teams]);

    // 클라 필터링
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

    /** 개별 토글(낙관적) */
    const toggleMember = async (m) => {
        const id = String(m.userId);
        const next = !presentSet.has(id);

        setPresentSet((prev) => {
            const n = new Set(prev);
            next ? n.add(id) : n.delete(id);
            return n;
        });
        setDirty(true);

        try {
            await api.saveAttendance(date, [id], next);
            await refreshSummary();
        } catch {
            alert('출석 변경에 실패했습니다.');
            // 롤백
            setPresentSet((prev) => {
                const n = new Set(prev);
                next ? n.delete(id) : n.add(id);
                return n;
            });
        }
    };

    /** 전체 체크/해제(로컬) */
    const checkAll = (value) => {
        const baseIds = filteredMembers.map((m) => String(m.userId)); // 현재 필터된 목록 기준
        setPresentSet((prev) => {
            const n = new Set(prev);
            if (value) baseIds.forEach((id) => n.add(id)); else baseIds.forEach((id) => n.delete(id));
            return n;
        });
        setDirty(true);
    };

    /** 저장(스냅샷) – present=true & present=false 두 번 호출 */
    const saveSnapshot = async () => {
        const allIds = members.map((m) => String(m.userId));
        const presentIds = allIds.filter((id) => presentSet.has(id));
        const absentIds = allIds.filter((id) => !presentSet.has(id));

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

    return (<div className="flex flex-col max-w-[1100px] mx-auto min-h-[100svh] py-16 px-6">
            <h1 className="font-bold mb-6 text-4xl tablet:text-3xl mobile:text-2xl">출석 관리</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 날짜 */}
                <Card>
                    <CardBody className="gap-3">
                        <div className="flex items-center justify-between">
                            <b>날짜</b>
                            <Button size="sm" color="primary" onPress={addToday}>
                                오늘 추가
                            </Button>
                        </div>

                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                        <Divider/>
                        <div className="max-h-[180px] overflow-auto space-y-2">
                            {dates.map((d) => (<div key={d} className="flex items-center justify-between">
                                    <Button size="sm" variant="light" onPress={() => setDate(d)}>
                                        {d === date ? <b>{d}</b> : d}
                                    </Button>
                                    <Button size="sm" color="danger" variant="flat" onPress={() => removeDate(d)}>
                                        삭제
                                    </Button>
                                </div>))}
                            {dates.length === 0 && (<div className="text-sm text-foreground-500">등록된 날짜가 없습니다.</div>)}
                        </div>
                    </CardBody>
                </Card>

                {/* 필터 & 저장 */}
                <Card>
                    <CardBody className="gap-3">
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

                        <Select
                            label="팀(클라이언트 필터)"
                            selectedKeys={teamFilter ? new Set([teamFilter]) : new Set()}
                            onSelectionChange={(keys) => {
                                const first = String(Array.from(keys || [])[0] ?? '');
                                setTeamFilter(first || '');
                            }}
                            variant="bordered"
                        >
                            {teamOptions.map((name) => (<SelectItem key={name} value={name}>
                                    {name}
                                </SelectItem>))}
                        </Select>

                        <Input placeholder="이름 검색" value={filter} onValueChange={setFilter} size="sm"/>

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
                <Card>
                    <CardBody className="gap-3">
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
            <Card className="mt-6">
                <CardBody className="gap-3">
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
                                        <Checkbox isSelected={checked} onValueChange={() => toggleMember(m)}>
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