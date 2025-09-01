"use client";

import React from 'react';
import { Pagination } from '@nextui-org/react';

export default function AdminTableBottomContent({ page, totalPages, totalUsers, onChangePage }) {
  if (!totalPages || totalPages <= 0) return null;

  return (
    <div className='flex w-full justify-center'>
      <Pagination
        isCompact
        showControls
        showShadow
        color='primary'
        page={page}
        total={totalPages}
        onChange={onChangePage}
      />
      <div className='text-white text-base absolute right-0 bottom-0 mobile:text-[11px]'>{totalUsers}</div>
    </div>
  );
}


