"use client";

import React from 'react';
import { Pagination } from '@nextui-org/react';

export default function AdminTableBottomContent({ page, totalPages, onChangePage }) {
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
    </div>
  );
}


