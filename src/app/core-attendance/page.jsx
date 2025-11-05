'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Card, CardBody, Checkbox, Divider, Input, Select, SelectItem} from '@nextui-org/react';
import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';

/** ===== 유틸 ===== */
const ymd = (d = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(d);
const getQS = (k) => (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get(k) || '' : '');
const setQS = (entries) => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    Object.entries(entries).forEach(([k, v]) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k)));
    window.history.replaceState({}, '', u.toString());
};

// ===== CSV 저장 공통 헬퍼 =====
const saveResponseAsFile = (res, fallbackName) => {
    // Excel 한글 깨짐 방지용 BOM
    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([BOM, res.data], { type: 'text/csv;charset=utf-8' });

    // 서버가 파일명 내려주면 우선 사용
    let filename = fallbackName;
    const cd = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition']);
    if (cd) {
        const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        const decoded = m && decodeURIComponent((m[1] || m[2] || '').trim());
        if (decoded) filename = decoded;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};


export default function AttendancePage() {
    const {apiClient} = useAuthenticatedApi();

    // URL state
    const [date, setDate] = useState(typeof window !== 'undefined' ? getQS('date') || ymd() : ymd());

    // data
    const [dates, setDates] = useState([]);
    const [teams, setTeams] = useState([]);     // [{ id, name, lead? }]
    const [members, setMembers] = useState([]); // [{userId,name,team(=라벨),present,...}]
    const [summary, setSummary] = useState(null);

    // UI
    const [filter, setFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState(''); // 팀 라벨 기준 (''=전체)
    const [presentSet, setPresentSet] = useState(new Set()); // Set<string(userId)>
    const [dirty, setDirty] = useState(false);

    // 초기 상태(서버 로드 직후 present 사용자들) → Δ 저장용
    const initialPresentSetRef = useRef(new Set());

    /** ===== API 래퍼 ===== */
    const api = {
        getDates: async () => (await apiClient.get('/core-attendance/meetings')).data.data, // { dates: [...] }
        addDate: async (d) => (await apiClient.post('/core-attendance/meetings', {date: d})).data.data,
        deleteDate: async (d) => (await apiClient.delete(`/core-attendance/meetings/${d}`)).data.data,

        getTeams: async () => (await apiClient.get('/core-attendance/meetings/teams')).data.data,
        getMembers: async (d) => (await apiClient.get(`/core-attendance/meetings/${d}/members`)).data.data,

        saveAttendance: async (d, userIds, present) => (await apiClient.put(`/core-attendance/meetings/${d}/attendance`, {
            userIds, present
        })).data.data,

        summary: async (d) => (await apiClient.get(`/core-attendance/meetings/${d}/summary`)).data.data,

        downloadSummaryCsvForDateAndSave: async (d) => {
            const res = await apiClient.get(`/core-attendance/meetings/${d}/summary.csv`, { responseType: 'blob' });
            saveResponseAsFile(res, `attendance-${d}.csv`);
        },

        downloadSummaryCsvAllAndSave: async () => {
            const res = await apiClient.get('/core-attendance/meetings/summary.csv', { responseType: 'blob' });
            saveResponseAsFile(res, 'attendance-summary.csv');
        },

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

    /** 팀 로드 (리드=본인 팀만 / 오거나이저·어드민=전체) */
    useEffect(() => {
        (async () => {
            try {
                const list = await api.getTeams();
                setTeams(Array.isArray(list) ? list : []);
                // 리드(팀 1개만 내려올 때) 자동 선택
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
                initialPresentSetRef.current = new Set(init); // 초기 상태 보관
                setDirty(false);
            } catch {
                setMembers([]);
                setPresentSet(new Set());
                initialPresentSetRef.current = new Set();
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

    /** “전체” 옵션은 팀이 2개 이상 전달될 때(= 오거나이저/어드민)만 노출 */
    const showAllOption = teams.length > 1;

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

    const addSelectedDate = async () => {
        try {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                alert('날짜 형식이 올바르지 않습니다. YYYY-MM-DD');
                return;
            }
            await api.addDate(date);
            const dl = await api.getDates();
            setDates(dl.dates);
            alert(`"${date}"가 추가되었습니다.`);
        } catch {
            alert('선택 날짜 추가에 실패했습니다.');
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

    /** 저장(Δ만 전송) */
    const saveSnapshot = async () => {
        // 현재/초기 출석 집합
        const now = presentSet;
        const init = initialPresentSetRef.current;

        // Δ 계산
        const added = [];   // now ∖ init → present=true
        const removed = []; // init ∖ now → present=false

        const allIdsStr = members.map((m) => String(m.userId));
        // members에 있는 대상들만 비교 (안전)
        for (const id of allIdsStr) {
            const inNow = now.has(id);
            const inInit = init.has(id);
            if (inNow && !inInit) added.push(Number(id));
            if (!inNow && inInit) removed.push(Number(id));
        }

        if (!added.length && !removed.length) {
            setDirty(false);
            alert('변경된 내용이 없습니다.');
            return;
        }

        try {
            if (added.length) await api.saveAttendance(date, added, true);
            if (removed.length) await api.saveAttendance(date, removed, false);
            // 저장 성공 → 초기 상태 갱신
            initialPresentSetRef.current = new Set(presentSet);
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
                        <div className="flex gap-2">
                            <Button size="sm" color="primary" onPress={addToday}>오늘 추가</Button>
                            <Button size="sm" color="secondary" variant="flat" onPress={addSelectedDate}>선택 날짜
                                추가</Button>
                        </div>
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

                    {/* 팀 선택(오거나이저/어드민만 “전체” 노출) */}
                    <Select
                        label="팀(클라이언트 필터)"
                        selectedKeys={showAllOption ? (teamFilter ? new Set([teamFilter]) : new Set(['__ALL__'])) : (teamFilter ? new Set([teamFilter]) : new Set())}
                        onSelectionChange={(keys) => {
                            const first = String(Array.from(keys || [])[0] ?? '');
                            if (showAllOption && first === '__ALL__') setTeamFilter(''); else setTeamFilter(first || '');
                        }}
                        variant="bordered"
                        classNames={{
                            base: "text-white",
                            label: "text-zinc-300",
                            trigger: ["bg-zinc-900", "text-white", "border", "border-zinc-700", "data-[hover=true]:bg-zinc-800", "data-[focus=true]:ring-2", "data-[focus=true]:ring-zinc-600", "aria-expanded:ring-2", "aria-expanded:ring-zinc-600"].join(" "),
                            value: "text-white",
                            popoverContent: ["bg-zinc-900", "border", "border-zinc-700", "backdrop-blur-xl", "shadow-xl"].join(" "),
                            listbox: "text-white",
                            selectorIcon: "text-zinc-400"
                        }}
                        // 항목 스타일(전역)
                        itemClasses={{
                            base: ["rounded-md", "data-[hover=true]:bg-zinc-800", "data-[focus=true]:bg-zinc-800", "data-[selectable=true]:focus:bg-zinc-800"].join(" "),
                            title: "text-white",
                            description: "text-zinc-400",
                            selectedIcon: "text-primary"
                        }}
                    >
                        {showAllOption && (<SelectItem key="__ALL__" value="__ALL__" className="text-white">
                            전체
                        </SelectItem>)}
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
                    <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => api.downloadSummaryCsvForDateAndSave(date)}
                        isDisabled={!date}
                    >
                        날짜 CSV
                    </Button>

                    <Button
                        size="sm"
                        variant="flat"
                        color="secondary"
                        onPress={() => api.downloadSummaryCsvAllAndSave()}
                    >
                        전체 CSV
                    </Button>

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
                            {date} · {teamFilter || (showAllOption ? '전체 팀' : (teams[0]?.name ?? ''))}
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