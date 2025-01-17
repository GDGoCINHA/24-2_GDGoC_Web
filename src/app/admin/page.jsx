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

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'MAJOR / ID', uid: 'major' },
  { name: 'STATUS', uid: 'status' },
];

export const users = [
  {
    id: 1,
    name: '김소연',
    major: '컴퓨터공학과',
    studentID: '12212444',
    status: 'active',
    age: '29',
    email: 'kim@example.com',
  },
  {
    id: 2,
    name: '강명묵',
    major: '컴퓨터공학과',
    studentID: '12201674',
    status: 'active',
    age: '25',
    email: 'kang@example.com',
  },
  {
    id: 3,
    name: '박우찬',
    major: '컴퓨터공학과',
    studentID: '12221111',
    status: 'active',
    age: '22',
    email: 'park@example.com',
  },
  {
    id: 4,
    name: '김철수',
    major: '인공지능공학과',
    studentID: '12231111',
    status: 'paused',
    age: '28',
    email: 'kimchulsoo@example.com',
  },
  {
    id: 5,
    name: '김유리',
    major: '기계공학과',
    studentID: '12241222',
    status: 'active',
    age: '24',
    email: 'iceggaggi@example.com',
  },
];

const statusColorMap = {
  active: 'success',
  paused: 'danger',
  vacation: 'warning',
};

export default function Page() {
  //추후 users 를 사용해 데이터를 받아오고, totalUsers를 사용해 페이지네이션 만들 예정
  const [page, setPage] = React.useState(1); // 현재 페이지 상태
  const rowsPerPage = 10; // 페이지당 표시할 행 수
  const totalUsers = 70; // 총 유저 수

  // 현재 페이지 데이터 계산
  const currentUsers = React.useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return users.slice(startIndex, endIndex);
  }, [page, rowsPerPage]);

  // 총 페이지 수 계산
  // 현제는 (users의 전체 인원수 / rowsPerage) 를 기준으로 계산중
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

  return (
    <div>
      <Header />
      {/* 추후 페이지 클릭 시 api 통신으로 데이터 불러오기 */}
      {console.log(page)}
      <Table
        className='dark pt-[53px] px-[96px]'
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
            <TableRow className='hover:bg-[#35353b99] cursor-pointer' key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
