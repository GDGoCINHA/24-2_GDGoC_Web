"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@nextui-org/react';

import UserDetailsModal from '@/components/admin/UserDetailsModal';
import AdminTableTopContent from '@/components/admin/AdminTableTopContent';
import AdminTableBottomContent from '@/components/admin/AdminTableBottomContent';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { getTeamLabel } from '@/constant/team';
import { cn } from '@/utils/cn';

const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'MAJOR / ID', uid: 'major' },
  { name: 'TEAM', uid: 'team' },
  { name: 'EMAIL', uid: 'email' },
  { name: 'PHONE', uid: 'phone' },
];

export default function CoreAdminPage() {
  const { apiClient } = useAuthenticatedApi();

  const [page, setPage] = React.useState(1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const modalClosing = useRef(false);

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [currentUsers, setCurrentUsers] = React.useState([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  const rowsPerPage = 10;

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: page - 1,
        size: rowsPerPage,
        sort: 'createdAt',
        dir: 'DESC',
        question: query || undefined,
      };
      const res = await apiClient.get('/core-recruit/applicants', { params });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      const total = res?.data?.meta?.totalElements ?? list.length;
      const computedTotalPages = Math.max(1, Math.ceil(total / rowsPerPage));

      setCurrentUsers(list);
      setTotalUsers(total);
      setTotalPages(computedTotalPages);
    } catch (err) {
      setError(String(err?.message || 'failed to load applicants'));
      setCurrentUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [apiClient, page, rowsPerPage, query]);

  const renderCell = useCallback((user, columnKey) => {
    const value = user[columnKey];
    switch (columnKey) {
      case 'name':
        return <span className='text-white'>{user?.name ?? ''}</span>;
      case 'major':
        return (
          <div className='flex flex-col'>
            <p className='text-white text-bold text-sm capitalize'>{user?.major ?? ''}</p>
            <p className='text-bold text-sm capitalize text-default-400'>{user?.studentId ?? ''}</p>
          </div>
        );
      case 'team': {
        const teamName = user?.team ?? '';
        const teamClassMap = {
          HR: 'border-red text-red',
          BD: 'border-green text-green',
          TECH: 'border-blue text-blue',
          PR_DESIGN: 'border-yellow text-yellow',
        };
        const colorClass = teamClassMap[teamName] || 'border-gray-700 text-gray-700';
        return (
          <Chip
            size='sm'
            variant='bordered'
            className={cn('border text-xs font-semibold', colorClass)}
          >
            {getTeamLabel(teamName)}
          </Chip>
        );
      }
      case 'email':
        return <span className='text-white'>{user?.email ?? ''}</span>;
      case 'phone':
        return <span className='text-white'>{user?.phone ?? ''}</span>;
      case 'createdAt':
        return <span className='text-white'>{user?.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</span>;
      default:
        return value;
    }
  }, []);

  const handleRowClick = async (user) => {
    if (modalClosing.current) return;
    try {
      const id = user?.id;
      if (!id) throw new Error('지원자 ID 없음');
      const res = await apiClient.get(`/core-recruit/applicants/${id}`);
      const detail = res?.data?.data ?? null;
      if (!detail) throw new Error('상세 정보 없음');
      setSelectedUser(detail);
      setModalOpen(true);
    } catch (e) {
      alert('상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleSearch = () => {
    setPage(1);
    setQuery((searchValue || '').trim());
  };

  const handleCloseModal = () => {
    modalClosing.current = true;
    setModalOpen(false);
    setTimeout(() => {
      modalClosing.current = false;
    }, 300);
  };

  useEffect(() => {
    if (searchValue === '' && query !== '') {
      setPage(1);
      setQuery('');
    }
  }, [searchValue, query]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  return (
    <div>
      <Table
        className='dark text-white py-[30px] px-[96px] mobile:px-[10px]'
        aria-label='Core applicants table'
        bottomContent={
          <div className='relative'>
            <AdminTableBottomContent
              page={page}
              totalPages={totalPages}
              totalUsers={totalUsers}
              onChangePage={(newPage) => setPage(newPage)}
            />
          </div>
        }
        topContent={
          <AdminTableTopContent searchValue={searchValue} setSearchValue={setSearchValue} onSearch={handleSearch} />
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align='start'>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={currentUsers} isLoading={loading} emptyContent={loading ? '불러오는 중...' : '데이터가 없습니다.'}>
          {(item) => (
            <TableRow className='hover:bg-white/10 cursor-pointer text-white' key={item.id} onClick={() => handleRowClick(item)}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 기존 UserDetailsModal 재사용: 핵심 질문/자유문항은 response 배열로 표시됨 */}
      <UserDetailsModal user={selectedUser} isOpen={modalOpen} onClose={handleCloseModal} preventClose />
    </div>
  );
}
