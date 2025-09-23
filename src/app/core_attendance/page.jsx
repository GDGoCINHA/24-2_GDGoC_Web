'use client';

import {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {Button, Card, CardBody, Checkbox, Divider, Input, Select, SelectItem} from '@nextui-org/react';

/** ===== API 클라이언트 ===== */
const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, '') || 'http://localhost:8080/api/v1/core-attendance',
    timeout: 15000,
});

const api = {
    getDates: async () => (await API.get(`/dates`)).data.data,
    addDate: async (date) => (await API.post(`/dates`, {date})).data.data,
    deleteDate: async (date) => (await API.delete(`/dates/${date}`)).data.data,
    getTeams: async (leadName, teamId) => (await API.get(`/teams`, {params: {leadName, teamId}})).data.data,
    addMember: async (teamId, name) => (await API.post(`/members`, null, {params: {teamId, name}})).data.data,
    renameMember: async (teamId, memberId, name) => (await API.put(`/members`, null, {
        params: {
            teamId,
            memberId,
            name
        }
    })).data.data,
    deleteMember: async (teamId, memberId) => (await API.delete(`/members`, {params: {teamId, memberId}})).data.data,
    setAttendance: async (date, teamId, memberId, present) => (await API.put(`/records/one`, null, {
        params: {
            date,
            teamId,
            memberId,
            present
        }
    })).data.data,
    setAll: async (date, teamId, present) => (await API.put(`/records/all`, null, {
        params: {
            date,
            teamId,
            present
        }
    })).data.data,
    summary: async (date, leadName, teamId) => (await API.get(`/summary`, {
        params: {
            date,
            leadName,
            teamId
        }
    })).data.data,
};

/** ===== 유틸 ===== */
const ymd = (d = new Date()) => d.toISOString().slice(0, 10);
const getQS = (k) => typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get(k) || '' : '';
const setQS = (entries) => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    Object.entries(entries).forEach(([k, v]) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k),);
    window.history.replaceState({}, '', u.toString());
};

/** ===== Page Component ===== */
export default function AttendancePage() {
    const [leadName, setLeadName] = useState(typeof window !== 'undefined' ? getQS('leadName') : '',);
    const [teamId, setTeamId] = useState(typeof window !== 'undefined' ? getQS('teamId') : '',);
    const [date, setDate] = useState(typeof window !== 'undefined' ? getQS('date') || ymd() : ymd(),);

    const [dates, setDates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState('');

    // 서버에 per-member 조회가 없어서, 프론트에서 토글 상태를 임시 보관
    const [presentSet, setPresentSet] = useState(new Set());

    const selectedTeam = useMemo(() => teams.find((t) => t.id === teamId) ?? teams[0], [teams, teamId],);

    const filteredMembers = useMemo(() => {
        if (!selectedTeam) return [];
        const q = filter.trim();
        return q ? selectedTeam.members.filter((m) => m.name.includes(q)) : selectedTeam.members;
    }, [selectedTeam, filter]);

    /** URL 동기화 */
    useEffect(() => {
        setQS({
            date, leadName: leadName || undefined, teamId: teamId || undefined,
        });
    }, [date, leadName, teamId]);

    /** 날짜 로드 */
    useEffect(() => {
        (async () => {
            try {
                const dl = await api.getDates();
                setDates(dl.dates);
                if (!dl.dates.includes(date) && dl.dates.length > 0) setDate(dl.dates[0]);
            } catch (e) {
                alert('날짜 목록을 불러오지 못했습니다.');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 팀 로드 (leadName 변경 시) */
    useEffect(() => {
        (async () => {
            try {
                const list = await api.getTeams(leadName || undefined, undefined);
                setTeams(list);
                if (list.length && !list.find((t) => t.id === teamId)) setTeamId(list[0].id);
                setPresentSet(new Set());
            } catch (e) {
                alert('팀 목록을 불러오지 못했습니다.');
            }
        })();
    }, [leadName]); // teamId는 선택 결과이므로 의존 X

    /** 요약 로드 */
    useEffect(() => {
        if (!date) return;
        (async () => {
            try {
                setSummary(await api.summary(date, leadName || undefined, teamId || undefined));
            } catch (e) {
                setSummary(null);
                alert('요약 정보를 불러오지 못했습니다.');
            }
        })();
    }, [date, leadName, teamId, teams.length]);

    /** 날짜 조작 */
    const addToday = async () => {
        try {
            const d = ymd();
            await api.addDate(d);
            const dl = await api.getDates();
            setDates(dl.dates);
            setDate(d);
        } catch (e) {
            alert('날짜 추가에 실패했습니다.');
        }
    };
    const removeDate = async (d) => {
        try {
            await api.deleteDate(d);
            const dl = await api.getDates();
            setDates(dl.dates);
            if (d === date) setDate(dl.dates[0] ?? ymd());
        } catch (e) {
            alert('날짜 삭제에 실패했습니다.');
        }
    };

    /** 멤버 조작 */
    const addMember = async () => {
        if (!selectedTeam) return;
        const name = window.prompt('팀원 이름 입력')?.trim();
        if (!name) return;
        try {
            await api.addMember(selectedTeam.id, name);
            setTeams(await api.getTeams(leadName || undefined));
            setPresentSet(new Set());
            await refreshSummary();
        } catch (e) {
            alert('팀원 추가에 실패했습니다.');
        }
    };

    const renameMember = async (m) => {
        if (!selectedTeam) return;
        const name = window.prompt('이름 수정', m.name)?.trim();
        if (!name) return;
        try {
            await api.renameMember(selectedTeam.id, m.id, name);
            setTeams(await api.getTeams(leadName || undefined));
            await refreshSummary();
        } catch (e) {
            alert('팀원 이름 수정에 실패했습니다.');
        }
    };

    const deleteMember = async (m) => {
        if (!selectedTeam) return;
        if (!confirm('삭제할까요?')) return;
        try {
            await api.deleteMember(selectedTeam.id, m.id);
            setTeams(await api.getTeams(leadName || undefined));
            setPresentSet((prev) => {
                const n = new Set(prev);
                n.delete(m.id);
                return n;
            });
            await refreshSummary();
        } catch (e) {
            alert('팀원 삭제에 실패했습니다.');
        }
    };

    /** 출석 체크 */
    const toggleMember = async (m) => {
        if (!selectedTeam) return;
        const next = !presentSet.has(m.id);
        try {
            await api.setAttendance(date, selectedTeam.id, m.id, next);
            setPresentSet((prev) => {
                const n = new Set(prev);
                next ? n.add(m.id) : n.delete(m.id);
                return n;
            });
            await refreshSummary();
        } catch (e) {
            alert('출석 변경에 실패했습니다.');
        }
    };

    const setAll = async (value) => {
        if (!selectedTeam) return;
        try {
            await api.setAll(date, selectedTeam.id, value);
            setPresentSet(value ? new Set(selectedTeam.members.map((m) => m.id)) : new Set());
            await refreshSummary();
        } catch (e) {
            alert('전체 출석 변경에 실패했습니다.');
        }
    };

    const refreshSummary = async () => {
        try {
            setSummary(await api.summary(date, leadName || undefined, teamId || undefined));
        } catch (e) {
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
                        <b>팀 선택</b>
                        <Input
                            label="리드 이름(옵션)"
                            value={leadName}
                            onValueChange={(v) => setLeadName(v)}
                            onBlur={() => setQS({leadName: leadName || undefined})}
                            variant="bordered"
                        />

                        {/* ✅ NextUI v2 권장 컨트롤 패턴: onSelectionChange / selectedKeys(Set) */}
                        <Select
                            label="팀"
                            selectedKeys={selectedTeam?.id ? new Set([selectedTeam.id]) : new Set()}
                            onSelectionChange={(keys) => {
                                const first = Array.from(keys || [])[0] ?? '';
                                setTeamId(first);
                                setQS({teamId: first || undefined});
                                setPresentSet(new Set());
                            }}
                            variant="bordered"
                        >
                            {teams.map((t) => (<SelectItem key={t.id} value={t.id}>
                                    {t.name} {t.lead ? `(리드: ${t.lead})` : ''}
                                </SelectItem>))}
                        </Select>

                        <div className="flex gap-2">
                            <Button size="sm" onPress={() => setAll(true)} color="success" variant="flat">
                                전체 체크
                            </Button>
                            <Button size="sm" onPress={() => setAll(false)} color="warning" variant="flat">
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
                            <Button size="sm" color="primary" onPress={addMember}>
                                팀원 추가
                            </Button>
                        </div>
                    </div>

                    <Divider/>

                    <div className="max-h-[420px] overflow-auto">
                        {filteredMembers.map((m) => {
                            const checked = presentSet.has(m.id);
                            return (<div key={m.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox isSelected={checked} onValueChange={() => toggleMember(m)}>
                                            {m.name}
                                        </Checkbox>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="flat" onPress={() => renameMember(m)}>
                                            수정
                                        </Button>
                                        <Button size="sm" color="danger" variant="flat" onPress={() => deleteMember(m)}>
                                            삭제
                                        </Button>
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