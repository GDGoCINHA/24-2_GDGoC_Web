"use client";

import React from 'react';
import { User, Chip, Checkbox } from '@nextui-org/react';

const statusColorMap = {
  true: 'success',
  false: 'danger',
};

export default function AdminTableCell({ user, columnKey, onTogglePay }) {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case 'name':
      return (
        <User
          className='text-white'
          avatarProps={{
            className: 'w-0 h-0 overflow-hidden',
          }}
          description={user.phoneNumber}
          name={cellValue}
        >
          {user.phoneNumber}
        </User>
      );
    case 'major':
      return (
        <div className='flex flex-col'>
          <p className='text-white text-bold text-sm capitalize'>{user.major}</p>
          <p className='text-bold text-sm capitalize text-default-400'>{user.studentId}</p>
        </div>
      );
    case 'isPayed':
      return (
        <Chip className='capitalize' color={statusColorMap[user.isPayed]} size='sm' variant='flat'>
          {user.isPayed ? '입금' : '미입금'}
        </Chip>
      );
    case 'togglePay':
      return (
        <div onClick={(e) => e.stopPropagation()} className='w-full flex justify-center items-center'>
          <div className='inline-flex justify-center items-center'>
            <Checkbox
              isSelected={!!user.isPayed}
              onValueChange={(checked) => onTogglePay?.(user.memberId ?? user.id, checked)}
            />
          </div>
        </div>
      );
    default:
      return cellValue;
  }
}


