'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';

import UserDetailsModal from '@/components/admin/UserDetailsModal';
import AdminTableCell from '@/components/admin/AdminTableCell';
import AdminTableTopContent from '@/components/admin/AdminTableTopContent';
import AdminTableBottomContent from '@/components/admin/AdminTableBottomContent';

import { users } from '@/mock/users';

const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'MAJOR / ID', uid: 'major' },
  { name: 'PAYMENT', uid: 'status' },
];

const statusColorMap = {
  true: 'success',
  false: 'danger',
};

export default function Page() {
  const router = useRouter();

  // 추후 users 를 사용해 데이터를 받아오고, totalUsers를 사용해 페이지네이션 만들 예정
  const [page, setPage] = React.useState(1); // 현재 페이지 상태 (추후 페이지 상태에 따라 api 통신으로 데이터 불러오기)

  const [modalOpen, setModalOpen] = React.useState(false); // 모달 열림 상태
  const modalClosing = useRef(false); // 모달이 닫히는 상태를 추적

  const [selectedUser, setSelectedUser] = React.useState(null); // 선택된 사용자 데이터
  const [searchValue, setSearchValue] = React.useState(''); // 검색 입력 상태

  const rowsPerPage = 10; //한 페이지당 표시될 유저 수
  const totalUsers = 110; //총 유저 수 (총 페이지 표시를 위함)

  // 현재 페이지 데이터 계산 (임시)
  const currentUsers = React.useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return users.slice(startIndex, endIndex);
  }, [page, rowsPerPage]);

  const totalPages = React.useMemo(() => Math.ceil(totalUsers / rowsPerPage), [totalUsers, rowsPerPage]);

  const renderCell = useCallback((user, columnKey) => 
    <AdminTableCell user={user} columnKey={columnKey} />
  , []);

  const handleRowClick = (user) => {
    if (modalClosing.current) return; // 모달이 닫히는 중에는 클릭 무시
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSearch = () => {
    //추후 api 연결 함수로 변경 예정
    console.log(searchValue); //임시
  };

  const handleCloseModal = () => {
    modalClosing.current = true; // 모달이 닫히는 중임을 표시
    setModalOpen(false);
    setTimeout(() => {
      modalClosing.current = false; // 모달 닫힘 완료 후 상태 변경
    }, 300);
  };

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
          <TableBody items={currentUsers}>
            {(item) => (
              <TableRow
                className='hover:bg-[#35353b99] cursor-pointer'
                key={item.member.id}
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