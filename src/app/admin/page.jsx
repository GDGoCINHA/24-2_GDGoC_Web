'use client';

import React, { useCallback, useRef } from 'react';
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
  Input,
} from '@nextui-org/react';
import Header from './Header';
import UserDetailsModal from './UserDetailModal';
import { users } from './users';
import { IoSearch } from 'react-icons/io5';

export const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'MAJOR / ID', uid: 'major' },
  { name: 'PAYMENT', uid: 'status' },
];

const statusColorMap = {
  true: 'success',
  false: 'danger',
};

export default function Page() {
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

  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user.member[columnKey];
    switch (columnKey) {
      case 'name':
        return (
          <User
            className='text-white'
            avatarProps={{
              className: 'w-0 h-0 overflow-hidden',
            }}
            description={user.member.email}
            name={cellValue}
          >
            {user.member.email}
          </User>
        );
      case 'major':
        return (
          <div className='flex flex-col'>
            <p className='text-white text-bold text-sm capitalize'>{user.member.majors.main}</p>
            <p className='text-bold text-sm capitalize text-default-400'>{user.member.studentId}</p>
          </div>
        );
      case 'status':
        return (
          <Chip className='capitalize' color={statusColorMap[user.member.isPayed]} size='sm' variant='flat'>
            {user.member.isPayed ? '입금' : '미입금'}
          </Chip>
        );
      default:
        return cellValue;
    }
  }, []);

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
    <div>
      <Header />
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
          topContent={
            <Input
              isClearable
              classNames={{
                label: 'text-black/50 dark:text-white/90',
                input: [
                  'bg-transparent',
                  'text-black/90 dark:text-white/90',
                  'placeholder:text-default-700/50 dark:placeholder:text-white/60',
                ],
                innerWrapper: 'bg-transparent',
                inputWrapper: [
                  'shadow-xl',
                  'bg-default-200/50',
                  'dark:bg-default/60',
                  'backdrop-blur-xl',
                  'backdrop-saturate-200',
                  'hover:bg-default-200/70',
                  'dark:hover:bg-default/70',
                  'group-data-[focus=true]:bg-default-200/50',
                  'dark:group-data-[focus=true]:bg-default/60',
                  '!cursor-text',
                ],
              }}
              placeholder='Type to search...'
              radius='lg'
              startContent={
                <IoSearch
                  className='text-white cursor-pointer'
                  onClick={handleSearch} // 클릭시 이벤트 발생 (추후 api 연결로 대체)
                />
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSearch(); // 클릭시 이벤트 발생 (추후 api 연결로 대체)
                }
              }}
              onClear={() => setSearchValue('')}
            />
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
  );
}