'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
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

import AdminTableTopContent from '@/components/admin/AdminTableTopContent';
import AdminTableBottomContent from '@/components/admin/AdminTableBottomContent';

const ROLE_OPTIONS = ['GUEST', 'MEMBER', 'CORE', 'LEAD', 'ORGANIZER', 'ADMIN'];
const TEAM_OPTIONS = ['BD', 'HR', 'TECH', 'PR/DESIGN'];

const roleColor = (r) => ({
    ADMIN: 'danger', ORGANIZER: 'warning', LEAD: 'secondary', CORE: 'success', MEMBER: 'primary',
}[r] || 'default');

export default function AdminUsersPage() {
    const {apiClient} = useAuthenticatedApi();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // 검색/정렬/페이지
    const [searchValue, setSearchValue] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 20;
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [sortDescriptor, setSortDescriptor] = useState({column: 'name', direction: 'ascending'});

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

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setErr('');
        try {
            const sort = sortColMap[sortDescriptor.column] || 'name';
            const dir = sortDescriptor.direction === 'descending' ? 'DESC' : 'ASC';
            const params = {page: page - 1, size: rowsPerPage, sort, dir, q: query || undefined};

            const res = await apiClient.get('/admin/users', {params});
            const pageData = res?.data?.data; // Page<UserSummaryResponse>
            const meta = res?.data?.meta;

            const content = Array.isArray(pageData?.content) ? pageData.content : [];
            setRows(content);

            const total = meta?.totalElements ?? pageData?.totalElements ?? content.length;
            setTotalUsers(total);
            setTotalPages(Math.max(1, Math.ceil(total / rowsPerPage)));
        } catch (e) {
            setErr(e?.message || '사용자 목록을 불러오지 못했습니다.');
            setRows([]);
            setTotalUsers(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [apiClient, page, rowsPerPage, query, sortDescriptor, sortColMap]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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

    // ✅ 6개 컬럼 (id 제외)
    const columns = useMemo(() => [{name: 'NAME', uid: 'name', sortable: true}, {
        name: 'MAJOR',
        uid: 'major',
        sortable: true
    }, {name: 'STUDENT ID', uid: 'studentId', sortable: true}, {
        name: 'EMAIL',
        uid: 'email',
        sortable: true
    }, {name: 'ROLE', uid: 'userRole', sortable: true}, {name: 'TEAM', uid: 'team', sortable: true},], []);

    return (<div className="dark text-white py-[30px] px-[96px] mobile:px-[10px]">
            <h1 className="text-3xl font-bold mb-6">사용자 관리</h1>

            <div className="mb-4">
                <AdminTableTopContent searchValue={searchValue} setSearchValue={setSearchValue} onSearch={onSearch}/>
            </div>

            <Table
                aria-label="Users table"
                className="dark"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                bottomContent={<AdminTableBottomContent
                    page={page}
                    totalPages={totalPages}
                    totalUsers={totalUsers}
                    onChangePage={setPage}
                />}
            >
                <TableHeader columns={columns}>
                    {(col) => (<TableColumn
                            key={col.uid}
                            allowsSorting={col.sortable}
                            className={col.uid === 'userRole' || col.uid === 'team' ? 'w-[220px]' : col.uid === 'email' ? 'w-[260px]' : ''}
                        >
                            {col.name}
                        </TableColumn>)}
                </TableHeader>

                <TableBody
                    items={rows}
                    isLoading={loading}
                    loadingContent={<Spinner label="불러오는 중..."/>}
                    emptyContent={err || '데이터가 없습니다.'}
                >
                    {(user) => (<TableRow key={user.id} className="hover:bg-[#35353b99]">
                            {/* NAME */}
                            <TableCell>
                                <span className="font-medium">{user.name}</span>
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
                                    <Chip size="sm" variant="flat" color={roleColor(user.userRole)}>
                                        {user.userRole}
                                    </Chip>
                                    <Select
                                        aria-label="역할 수정"
                                        selectedKeys={new Set([user.userRole || ''])}
                                        onSelectionChange={(keys) => {
                                            const nextRole = String(Array.from(keys)[0] || user.userRole);
                                            if (nextRole !== user.userRole) {
                                                const ok = confirm(`역할을 '${user.userRole}' → '${nextRole}' 로 변경할까요?`);
                                                if (ok) patchSmart({user, nextRole, nextTeam: user.team ?? null});
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
                                        const nextTeam = k === '' ? null : k;
                                        if ((nextTeam ?? null) !== (user.team ?? null)) {
                                            const old = user.team ?? '(없음)';
                                            const neu = nextTeam ?? '(없음)';
                                            const ok = confirm(`팀을 '${old}' → '${neu}' 로 변경할까요?`);
                                            if (ok) patchSmart({user, nextRole: user.userRole, nextTeam});
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
                                    {TEAM_OPTIONS.map((t) => (<SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>))}
                                </Select>
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
        </div>);
}