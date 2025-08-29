"use client";

import React from 'react';
import { User, Chip } from '@nextui-org/react';

const statusColorMap = {
  true: 'success',
  false: 'danger',
};

export default function AdminTableCell({ user, columnKey }) {
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
}


