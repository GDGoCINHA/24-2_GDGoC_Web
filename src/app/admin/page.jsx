'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';

import UserDetailsModal from '@/components/admin/UserDetailsModal';
import AdminTableCell from '@/components/admin/AdminTableCell';
import AdminTableTopContent from '@/components/admin/AdminTableTopContent';
import AdminTableBottomContent from '@/components/admin/AdminTableBottomContent';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'MAJOR / ID', uid: 'major' },
  { name: 'PAYMENT', uid: 'isPayed' },
];

const statusColorMap = {
  true: 'success',
  false: 'danger',
};

export default function Page() {
  const router = useRouter();
  const { apiClient } = useAuthenticatedApi();

  const [page, setPage] = React.useState(1);

  const [modalOpen, setModalOpen] = React.useState(false); // 모달 열림 상태
  const modalClosing = useRef(false); // 모달이 닫히는 상태를 추적

  const [selectedUser, setSelectedUser] = React.useState(null); // 선택된 사용자 데이터
  const [searchValue, setSearchValue] = React.useState(''); // 검색 입력 상태
  const [query, setQuery] = React.useState(''); // API 호출시 검색 내용
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [currentUsers, setCurrentUsers] = React.useState([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  const rowsPerPage = 10; //한 페이지당 표시될 유저 수

  const fetchUsers = useCallback(async () => {
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
      const res = await apiClient.get('/recruit/members', { params });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      const total = res?.data?.meta?.totalElements ?? list.length;
      const computedTotalPages = Math.max(1, Math.ceil(total / rowsPerPage));

      setCurrentUsers(list);
      setTotalUsers(total);
      setTotalPages(computedTotalPages);
    } catch (err) {
      setError(String(err?.message || 'failed to load users'));
      setCurrentUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [apiClient, page, rowsPerPage, query]);

  const renderCell = useCallback((user, columnKey) => {
    const normalizedUser = {
      ...user,
      name: user?.name ?? '',
      major: user?.major ?? '',
      studentId: user?.studentId ?? '',
      isPayed: typeof user?.isPayed === 'boolean' ? user.isPayed : '',
      phoneNumber: user?.phoneNumber ?? '',
    };
    return <AdminTableCell user={normalizedUser} columnKey={columnKey} />;
  }, []);

  const handleRowClick = (user) => {
    if (modalClosing.current) return; // 모달이 닫히는 중에는 클릭 무시
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSearch = () => {
    setPage(1);
    setQuery((searchValue || '').trim());
  };

  const handleCloseModal = () => {
    modalClosing.current = true; // 모달이 닫히는 중임을 표시
    setModalOpen(false);
    setTimeout(() => {
      modalClosing.current = false; // 모달 닫힘 완료 후 상태 변경
    }, 300);
  };

  useEffect(() => {
    if (searchValue === '' && query !== '') {
      setPage(1);
      setQuery('');
    }
  }, [searchValue, query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <div>
        <Table
          className='dark py-[30px] px-[96px] mobile:px-[10px]'
          aria-label='Example table with custom cells'
          bottomContent={
            <AdminTableBottomContent page={page} totalPages={totalPages} onChangePage={(newPage) => setPage(newPage)} />
          }
          topContent={
            <AdminTableTopContent searchValue={searchValue} setSearchValue={setSearchValue} onSearch={handleSearch} />
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={currentUsers}
            isLoading={loading}
            emptyContent={loading ? '불러오는 중...' : '데이터가 없습니다.'}
          >
            {(item) => (
              <TableRow
                className='hover:bg-[#35353b99] cursor-pointer'
                key={item.member?.id ?? item.id}
                onClick={() => handleRowClick(item)}
              >
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <UserDetailsModal user={selectedUser} isOpen={modalOpen} onClose={handleCloseModal} preventClose />
      </div>
    </>
  );
}