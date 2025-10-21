'use client';

import {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {Button, Card, CardBody, Checkbox, Divider, Input, Select, SelectItem} from '@nextui-org/react';

/** ===== API 클라이언트 ===== */
const API = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, '') || 'http://localhost:8080') + '/api/v1/core-attendance/meetings',
    timeout: 15000,
    withCredentials: true,
});

const api = {
    // Dates
    getDates: async () => (await API.get(`/`)).data.data, // { dates: [...] }
    addDate: async (date) => (await API.post(`/`, {date})).data.data,
    deleteDate: async (date) => (await API.delete(`/${date}`)).data.data,

    // Teams
    getTeams: async () => (await API.get(`/teams`)).data.data,

    // Members with presence
    getMembers: async (date, teamId) => (await API.get(`/${date}/members`, {params: teamId ? {team: teamId} : {}})).data.data,

    // Batch save attendance
    saveAttendance: async (date, userIds, present, teamId) => (await API.put(`/${date}/attendance`, {
        userIds,
        present
    }, {params: teamId ? {team: teamId} : {}})).data.data,

    // Summary
    summary: async (date, teamId) => (await API.get(`/${date}/summary`, {params: teamId ? {team: teamId} : {}})).data.data,
};

/** ===== 유틸 ===== */
const ymd = (d = new Date()) => d.toISOString().slice(0, 10);
const getQS = (k) => typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get(k) || '' : '';
const setQS = (entries) => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    Object.entries(entries).forEach(([k, v]) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k)));
    window.history.replaceState({}, '', u.toString());
};

export default function AttendancePage() {
    // URL state
    const [date, setDate] = useState(typeof window !== 'undefined' ? getQS('date') || ymd() : ymd());
    const [teamId, setTeamId] = useState(typeof window !== 'undefined' ? getQS('teamId') : '');

    // data
    const [dates, setDates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState('');

    // UI
    const [presentSet, setPresentSet] = useState(new Set());
    const [dirty, setDirty] = useState(false);

    const selectedTeam = useMemo(() => teams.find((t) => t.id === teamId) ?? teams[0], [teams, teamId]);

    const filteredMembers = useMemo(() => {
        const base = members;
        const q = filter.trim();
        if (!q) return base;
        return base.filter((m) => m.name.includes(q));
    }, [members, filter]);

    /** URL 동기화 */
    useEffect(() => {
        setQS({date, teamId: teamId || undefined});
    }, [date, teamId]);

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

    /** 팀 로드 */
    useEffect(() => {
        (async () => {
            try {
                const list = await api.getTeams();
                setTeams(list);
                if (list.length && !list.find((t) => t.id === teamId)) setTeamId(list[0].id);
            } catch {
                alert('팀 목록을 불러오지 못했습니다.');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 특정 날짜의 팀원 + 출석 로드 */
    useEffect(() => {
        (async () => {
            if (!date || !selectedTeam) return;
            try {
                const rows = await api.getMembers(date, selectedTeam.id);
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
    }, [date, selectedTeam?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    /** 요약 로드 */
    useEffect(() => {
        (async () => {
            if (!date) return;
            try {
                const s = await api.summary(date, selectedTeam?.id);
                setSummary(s);
            } catch {
                setSummary(null);
            }
        })();
    }, [date, selectedTeam?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

    /** 개별 토글: 배치 API로 “단건” 반영 */
    const toggleMember = async (m) => {
        if (!selectedTeam) return;
        const id = String(m.id ?? m.userId);
        const next = !presentSet.has(id);

        // UI 낙관적 업데이트
        setPresentSet((prev) => {
            const n = new Set(prev);
            next ? n.add(id) : n.delete(id);
            return n;
        });
        setDirty(true);

        try {
            await api.saveAttendance(date, [id], next, selectedTeam.id);
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
        if (!selectedTeam) return;
        if (value) {
            setPresentSet(new Set(members.map((m) => String(m.userId))));
        } else {
            setPresentSet(new Set());
        }
        setDirty(true);
    };

    /** 저장(스냅샷) – present=true & present=false 두 번 호출 */
    const saveSnapshot = async () => {
        if (!selectedTeam) return;
        const allIds = members.map((m) => String(m.userId));
        const presentIds = allIds.filter((id) => presentSet.has(id));
        const absentIds = allIds.filter((id) => !presentSet.has(id));

        try {
            if (presentIds.length) {
                await api.saveAttendance(date, presentIds, true, selectedTeam.id);
            }
            if (absentIds.length) {
                await api.saveAttendance(date, absentIds, false, selectedTeam.id);
            }
            setDirty(false);
            await refreshSummary();
            alert('저장되었습니다.');
        } catch {
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const refreshSummary = async () => {
        try {
            setSummary(await api.summary(date, selectedTeam?.id));
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

                {/* 팀 선택 */}
                <Card>
                    <CardBody className="gap-3">
                        <div className="flex items-center justify-between">
                            <b>팀 선택</b>
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
                            label="팀"
                            selectedKeys={selectedTeam?.id ? new Set([selectedTeam.id]) : new Set()}
                            onSelectionChange={(keys) => {
                                const first = Array.from(keys || [])[0] ?? '';
                                setTeamId(String(first));
                                setQS({teamId: first ? String(first) : undefined});
                            }}
                            variant="bordered"
                        >
                            {teams.map((t) => (<SelectItem key={t.id} value={t.id}>
                                    {t.name} {t.lead ? `(리드: ${t.lead})` : ''}
                                </SelectItem>))}
                        </Select>

                        <div className="flex gap-2">
                            <Button size="sm" onPress={() => checkAll(true)} color="success" variant="flat">
                                전체 체크
                            </Button>
                            <Button size="sm" onPress={() => checkAll(false)} color="warning" variant="flat">
                                전체 해제
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* 요약 */}
                <Card>
                    <CardBody className="gap-3">
                        <b>요약</b>
                        {summary ? (<div className="text-sm">
                                <div className="mb-2">
                                    전체 {summary.present} / {summary.total}
                                </div>
                                <Divider/>
                                <div className="mt-2 space-y-1">
                                    {summary.perTeam.map((ts) => (
                                        <div key={ts.teamId} className="flex items-center justify-between">
                                            <span>{ts.teamName}</span>
                                            <span>
                        {ts.present} / {ts.total}
                      </span>
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
                                {date} · {selectedTeam?.name ?? '-'}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Input placeholder="팀원 검색" value={filter} onValueChange={setFilter} size="sm"/>
                        </div>
                    </div>

                    <Divider/>

                    <div className="max-h-[420px] overflow-auto">
                        {filteredMembers.map((m) => {
                            const id = String(m.userId);
                            const checked = presentSet.has(id);
                            return (<div key={id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox isSelected={checked} onValueChange={() => toggleMember({userId: id})}>
                                            {m.name}
                                        </Checkbox>
                                    </div>
                                </div>);
                        })}
                        {filteredMembers.length === 0 && (
                            <div className="text-sm text-foreground-500 py-3">팀원이 없습니다.</div>)}
                    </div>
                </CardBody>
            </Card>
        </div>);
}