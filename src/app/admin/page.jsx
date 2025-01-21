'use client';

import React, { useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Pagination,
} from '@nextui-org/react';
import Header from './Header';
import UserDetailsModal from './UserDetailModal';
import { users } from './users';

export const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'MAJOR / ID', uid: 'major' },
  { name: 'STATUS', uid: 'status' },
];

const statusColorMap = {
  합격: 'success',
  불합격: 'danger',
};

export default function Page() {
  // 추후 users 를 사용해 데이터를 받아오고, totalUsers를 사용해 페이지네이션 만들 예정
  const [page, setPage] = React.useState(1); // 현재 페이지 상태
  const [modalOpen, setModalOpen] = React.useState(false); // 모달 열림 상태
  const [selectedUser, setSelectedUser] = React.useState(null); // 선택된 사용자 데이터
  const rowsPerPage = 10; // 페이지당 표시할 행 수
  const totalUsers = 110; // 총 유저 수

  // 현재 페이지 데이터 계산 (임시)
  const currentUsers = React.useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return users.slice(startIndex, endIndex);
  }, [page, rowsPerPage]);

  // 총 페이지 수 계산
  // 현제는 (users의 전체 인원수 / rowsPerPage) 를 기준으로 계산중
  const totalPages = React.useMemo(() => Math.ceil(totalUsers / rowsPerPage), [totalUsers, rowsPerPage]);

  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <User
            className='text-white'
            avatarProps={{
              className: 'w-0 h-0 overflow-hidden',
            }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case 'major':
        return (
          <div className='flex flex-col'>
            <p className='text-white text-bold text-sm capitalize'>{cellValue}</p>
            <p className='text-bold text-sm capitalize text-default-400'>{user.studentID}</p>
          </div>
        );
      case 'status':
        return (
          <Chip className='capitalize' color={statusColorMap[user.status]} size='sm' variant='flat'>
            {cellValue}
          </Chip>
        );
      default:
        return cellValue;
    }
  }, []);

  // 행 클릭 시 선택된 사용자 데이터를 모달에 표시
  const handleRowClick = (user) => {
    setSelectedUser(user); // 선택된 사용자 설정
    setModalOpen(true); // 모달 열기
  };

  return (
    <div>
      <Header />
      {/* 추후 페이지 클릭 시 api 통신으로 데이터 불러오기 */}
      {console.log(page)}
      <Table
        className='dark py-[30px] px-[96px] mobile:px-[10px]'
        aria-label='Example table with custom cells'
        bottomContent={
          totalPages > 0 ? (
            <div className='flex w-full justify-center'>
              <Pagination
                isCompact
                showControls
                showShadow
                color='primary'
                page={page}
                total={totalPages}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        {/* 나중에 여기 users 로 변경할 것 */}
        <TableBody items={currentUsers}>
          {(item) => (
            <TableRow
              className='hover:bg-[#35353b99] cursor-pointer'
              key={item.id}
              onClick={() => handleRowClick(item)}
            >
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <UserDetailsModal user={selectedUser} isOpen={modalOpen} onClose={() => setModalOpen(false)} preventClose />
    </div>
  );
}
