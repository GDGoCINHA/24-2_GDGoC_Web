'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Button,
    Chip,
    Select,
    SelectItem,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@nextui-org/react';

import {useAuthenticatedApi} from '@/hooks/useAuthenticatedApi';
import {useAuth} from '@/hooks/useAuth';

import AdminTableTopContent from '@/components/admin/AdminTableTopContent';
import AdminTableBottomContent from '@/components/admin/AdminTableBottomContent';

/** 백엔드 enum과 일치하는 값(전송용) */
const ROLE_OPTIONS = ['GUEST', 'MEMBER', 'CORE', 'LEAD', 'ORGANIZER', 'ADMIN'];
const TEAM_ENUM_VALUES = ['BD', 'HR', 'TECH', 'PR_DESIGN'];

/** 화면 표시용 라벨 */
const TEAM_LABEL = {
    BD: 'BD', HR: 'HR', TECH: 'TECH', PR_DESIGN: 'PR/DESIGN',
};

const roleColor = (r) => ({
    ADMIN: 'danger', ORGANIZER: 'warning', LEAD: 'secondary', CORE: 'success', MEMBER: 'primary',
}[r] || 'default');

const ROLE_RANK = {GUEST: 0, MEMBER: 1, CORE: 2, LEAD: 3, ORGANIZER: 4, ADMIN: 5};
const getRoleRank = (r) => ROLE_RANK[r] ?? -1;

export default function AdminUsersPage() {
    const {apiClient} = useAuthenticatedApi();
    const {accessToken} = useAuth();

    const [rows, setRows] = useState([]); // [{id,name,major,studentId,email,userRole,team}]
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // 검색/정렬/페이지
    const [searchValue, setSearchValue] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 20;
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // 정렬
    const [sortDescriptor, setSortDescriptor] = useState({column: 'name', direction: 'ascending'});
    const [pendingSort, setPendingSort] = useState(sortDescriptor);
    const sortTimerRef = useRef(null);

    // 서버 연동용 필터 (선택 시에만 전송)
    const [roleFilter, setRoleFilter] = useState(''); // '' = 전체
    const [teamFilter, setTeamFilter] = useState(''); // '' = 전체

    // 중복 요청 방지 키
    const lastQueryRef = useRef(null); // string key

    /** 내 정보(자기 자신 삭제/변경 방지용) */
    const me = useMemo(() => {
        if (!accessToken) return null;
        try {
            const p = JSON.parse(atob(accessToken.split('.')[1]));
            return {id: Number(p.id) || null};
        } catch {
            return null;
        }
    }, [accessToken]);

    /** 삭제 버튼 렌더링 권한(서버로 체크: LEAD 이상) */
    const [canRenderDelete, setCanRenderDelete] = useState(false);
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await apiClient.get('/auth/LEAD', {
                    validateStatus: (s) => s === 200 || s === 204 || s === 401 || s === 403,
                    headers: {Accept: 'application/json'},
                });
                const okHttp = res?.status === 200 || res?.status === 204;
                const okBody = (res?.data?.code ?? 200) === 200;
                if (alive) setCanRenderDelete(okHttp && okBody);
            } catch {
                if (alive) setCanRenderDelete(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [apiClient]);

    // 프론트 → 백엔드 정렬 필드 매핑
    const sortColMap = useMemo(() => ({
        name: 'name',
        major: 'major',
        studentId: 'studentId',
        email: 'email',
        userRole: 'userRole',
        team: 'team',
        createdAt: 'createdAt', // 백업
    }), []);

    const fetchUsers = useCallback(async (force = false) => {
        setErr('');
        const keyNow = JSON.stringify({
            page, q: query, sort: sortDescriptor, role: roleFilter, team: teamFilter,
        });
        if (!force && lastQueryRef.current === keyNow) return;

        setLoading(true);
        try {
            const sort = sortColMap[sortDescriptor.column] || 'name';
            const dir = sortDescriptor.direction === 'descending' ? 'DESC' : 'ASC';

            const params = {
                page: page - 1,
                size: rowsPerPage,
                sort,
                dir,
                q: query || undefined,
                role: roleFilter || undefined,
                team: teamFilter || undefined,
            };

            const res = await apiClient.get('/admin/users', {params});
            const pageData = res?.data?.data;
            const meta = res?.data?.meta;

            let content = Array.isArray(pageData?.content) ? pageData.content : [];

            // ROLE 정렬일 때, 알파벳 대신 권한 서열로 보정 (페이지 내 안정화)
            if (sortDescriptor.column === 'userRole') {
                const asc = sortDescriptor.direction !== 'descending';
                content = content.slice().sort((a, b) => {
                    const diff = getRoleRank(a.userRole) - getRoleRank(b.userRole);
                    return asc ? diff : -diff;
                });
            }

            setRows(content);

            const total = meta?.totalElements ?? pageData?.totalElements ?? content.length;
            setTotalUsers(total);
            setTotalPages(Math.max(1, Math.ceil(total / rowsPerPage)));
            lastQueryRef.current = keyNow;
        } catch (e) {
            setErr(e?.message || '사용자 목록을 불러오지 못했습니다.');
            setRows([]);
            setTotalUsers(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [apiClient, page, rowsPerPage, query, sortDescriptor, sortColMap, roleFilter, teamFilter]);

    // 최초 1회 강제 호출
    useEffect(() => {
        fetchUsers(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 의존성 변경 시, 캐시키 달라지면 요청
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 테이블 정렬 디바운스 -> 실제 sortDescriptor 적용
    useEffect(() => {
        if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
        sortTimerRef.current = setTimeout(() => {
            setSortDescriptor(pendingSort);
        }, 250);
        return () => clearTimeout(sortTimerRef.current);
    }, [pendingSort]);

    const onSearch = useCallback(() => {
        setPage(1);
        setQuery((searchValue || '').trim());
    }, [searchValue]);

    useEffect(() => {
        if (searchValue === '' && query !== '') {
            setPage(1);
            setQuery('');
        }
    }, [searchValue, query]);

    // 역할/팀 패치: role만 → /role, 팀만/둘다 → /role-team
    const patchSmart = useCallback(async ({user, nextRole, nextTeam}) => {
        const prev = rows;
        setRows((old) => old.map((u) => (u.id === user.id ? {...u, userRole: nextRole, team: nextTeam} : u)));
        try {
            const roleChanged = nextRole !== user.userRole;
            const teamChanged = (nextTeam ?? null) !== (user.team ?? null);

            if (teamChanged) {
                await apiClient.patch(`/admin/users/${user.id}/role-team`, {role: nextRole, team: nextTeam ?? null});
            } else if (roleChanged) {
                await apiClient.patch(`/admin/users/${user.id}/role`, {role: nextRole});
            }
        } catch (e) {
            setRows(prev); // 롤백
            alert(e?.response?.data?.message || '변경 실패');
        }
    }, [apiClient, rows]);

    // 삭제
    const handleDelete = useCallback(async (user) => {
        const confirmed = window.confirm(`{${user.name}}을(를) 삭제하시겠습니까?`);
        if (!confirmed) return;

        const prev = rows;
        // 낙관적 제거
        setRows((old) => old.filter((u) => u.id !== user.id));

        try {
            await apiClient.delete(`/admin/users/${user.id}`);
        } catch (e) {
            // 롤백
            setRows(prev);
            alert(e?.response?.data?.message || '삭제 실패');
        }
    }, [apiClient, rows]);

    // 6개 데이터 컬럼 + ACTIONS
    const columns = useMemo(() => {
        const base = [{name: 'NAME', uid: 'name', sortable: true}, {
            name: 'MAJOR',
            uid: 'major',
            sortable: true
        }, {name: 'STUDENT ID', uid: 'studentId', sortable: true}, {
            name: 'EMAIL',
            uid: 'email',
            sortable: true
        }, {name: 'ROLE', uid: 'userRole', sortable: true}, {name: 'TEAM', uid: 'team', sortable: true},];
        if (canRenderDelete) {
            base.push({name: 'ACTIONS', uid: 'actions', sortable: false});
        }
        return base;
    }, [canRenderDelete]);

    return (<div className="dark text-white py-[30px] px-[96px] mobile:px-[10px]">
            <h1 className="text-3xl font-bold mb-6">사용자 관리</h1>

            {/* 검색바 */}
            <div className="mb-3">
                <AdminTableTopContent searchValue={searchValue} setSearchValue={setSearchValue} onSearch={onSearch}/>
            </div>

            {/* 서버와 맞춘 필터(옵션): role/team */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Select
                    aria-label="역할 필터"
                    size="sm"
                    className="min-w-[160px]"
                    selectedKeys={new Set([roleFilter])}
                    onSelectionChange={(keys) => {
                        const v = String(Array.from(keys)[0] ?? '');
                        setPage(1);
                        setRoleFilter(v === '' ? '' : v);
                    }}
                    classNames={{
                        trigger: 'bg-zinc-900 text-white border border-zinc-700 data-[hover=true]:bg-zinc-800',
                        value: 'text-white',
                        popoverContent: 'bg-zinc-900 border border-zinc-700',
                        listbox: 'text-white',
                        selectorIcon: 'text-zinc-400',
                    }}
                    itemClasses={{
                        base: 'rounded-md data-[hover=true]:bg-zinc-800 data-[focus=true]:bg-zinc-800',
                        title: 'text-white',
                    }}
                >
                    <SelectItem key="" value="">
                        (전체 역할)
                    </SelectItem>
                    {ROLE_OPTIONS.map((r) => (<SelectItem key={r} value={r}>
                            {r}
                        </SelectItem>))}
                </Select>

                <Select
                    aria-label="팀 필터"
                    size="sm"
                    className="min-w-[160px]"
                    selectedKeys={new Set([teamFilter])}
                    onSelectionChange={(keys) => {
                        const v = String(Array.from(keys)[0] ?? '');
                        setPage(1);
                        setTeamFilter(v === '' ? '' : v);
                    }}
                    classNames={{
                        trigger: 'bg-zinc-900 text-white border border-zinc-700 data-[hover=true]:bg-zinc-800',
                        value: 'text-white',
                        popoverContent: 'bg-zinc-900 border border-zinc-700',
                        listbox: 'text-white',
                        selectorIcon: 'text-zinc-400',
                    }}
                    itemClasses={{
                        base: 'rounded-md data-[hover=true]:bg-zinc-800 data-[focus=true]:bg-zinc-800',
                        title: 'text-white',
                    }}
                >
                    <SelectItem key="" value="">
                        (전체 팀)
                    </SelectItem>
                    {TEAM_ENUM_VALUES.map((t) => (<SelectItem key={t} value={t}>
                            {TEAM_LABEL[t]}
                        </SelectItem>))}
                </Select>
            </div>

            <Table
                aria-label="Users table"
                className="dark"
                sortDescriptor={pendingSort}
                onSortChange={setPendingSort}
                bottomContent={<AdminTableBottomContent page={page} totalPages={totalPages} totalUsers={totalUsers}
                                                        onChangePage={setPage}/>}
            >
                <TableHeader columns={columns}>
                    {(col) => (<TableColumn
                            key={col.uid}
                            allowsSorting={col.sortable}
                            className={col.uid === 'userRole' || col.uid === 'team' ? 'w-[220px]' : col.uid === 'email' ? 'w-[260px]' : col.uid === 'actions' ? 'w-[120px] text-right' : ''}
                            align={col.uid === 'actions' ? 'end' : 'start'}
                        >
                            {col.name}
                        </TableColumn>)}
                </TableHeader>

                <TableBody items={rows} isLoading={loading} loadingContent={<Spinner label="불러오는 중..."/>}
                           emptyContent={err || '데이터가 없습니다.'}>
                    {(user) => (<TableRow key={user.id} className="hover:bg-[#35353b99]">
                            {/* NAME */}
                            <TableCell>
                                <span className="font-medium mr-2">{user.name}</span>
                                <Chip size="sm" variant="flat" color={roleColor(user.userRole)}>
                                    {user.userRole}
                                </Chip>
                            </TableCell>

                            {/* MAJOR */}
                            <TableCell>{user.major}</TableCell>

                            {/* STUDENT ID */}
                            <TableCell>{user.studentId}</TableCell>

                            {/* EMAIL */}
                            <TableCell>
                                <span className="text-sm">{user.email}</span>
                            </TableCell>

                            {/* ROLE */}
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Select
                                        aria-label="역할 수정"
                                        selectedKeys={new Set([user.userRole || ''])}
                                        onSelectionChange={(keys) => {
                                            const nextRole = String(Array.from(keys)[0] || user.userRole);
                                            if (nextRole !== user.userRole) {
                                                const ok = confirm(`역할을 '${user.userRole}' → '${nextRole}' 로 변경할까요?`);
                                                if (ok) void patchSmart({user, nextRole, nextTeam: user.team ?? null});
                                            }
                                        }}
                                        size="sm"
                                        className="min-w-[140px]"
                                        classNames={{
                                            trigger: 'bg-zinc-900 text-white border border-zinc-700 data-[hover=true]:bg-zinc-800',
                                            value: 'text-white',
                                            popoverContent: 'bg-zinc-900 border border-zinc-700',
                                            listbox: 'text-white',
                                            selectorIcon: 'text-zinc-400',
                                        }}
                                        itemClasses={{
                                            base: 'rounded-md data-[hover=true]:bg-zinc-800 data-[focus=true]:bg-zinc-800',
                                            title: 'text-white',
                                        }}
                                    >
                                        {ROLE_OPTIONS.map((r) => (<SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>))}
                                    </Select>
                                </div>
                            </TableCell>

                            {/* TEAM */}
                            <TableCell>
                                <Select
                                    aria-label="팀 수정"
                                    selectedKeys={new Set([user.team || ''])}
                                    onSelectionChange={(keys) => {
                                        const k = String(Array.from(keys)[0] ?? '');
                                        const nextTeam = k === '' ? null : k; // 서버에는 enum name로 전송
                                        if ((nextTeam ?? null) !== (user.team ?? null)) {
                                            const old = user.team ? TEAM_LABEL[user.team] || user.team : '(없음)';
                                            const neu = nextTeam ? TEAM_LABEL[nextTeam] || nextTeam : '(없음)';
                                            const ok = confirm(`팀을 '${old}' → '${neu}' 로 변경할까요?`);
                                            if (ok) void patchSmart({user, nextRole: user.userRole, nextTeam});
                                        }
                                    }}
                                    size="sm"
                                    className="min-w-[160px]"
                                    classNames={{
                                        trigger: 'bg-zinc-900 text-white border border-zinc-700 data-[hover=true]:bg-zinc-800',
                                        value: 'text-white',
                                        popoverContent: 'bg-zinc-900 border border-zinc-700',
                                        listbox: 'text-white',
                                        selectorIcon: 'text-zinc-400',
                                    }}
                                    itemClasses={{
                                        base: 'rounded-md data-[hover=true]:bg-zinc-800 data-[focus=true]:bg-zinc-800',
                                        title: 'text-white',
                                    }}
                                >
                                    <SelectItem key="" value="">
                                        (없음)
                                    </SelectItem>
                                    {TEAM_ENUM_VALUES.map((t) => (<SelectItem key={t} value={t}>
                                            {TEAM_LABEL[t]}
                                        </SelectItem>))}
                                </Select>
                            </TableCell>

                            {/* ACTIONS (Delete) */}
                            {canRenderDelete ? (<TableCell>
                                    <div className="flex justify-end">
                                        {user.id !== me?.id ? (<Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void handleDelete(user);
                                                }}
                                            >
                                                삭제
                                            </Button>) : null}
                                    </div>
                                </TableCell>) : null}
                        </TableRow>)}
                </TableBody>
            </Table>
        </div>);
}