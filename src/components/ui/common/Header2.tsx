import React from 'react';
import { GdgLogo } from '@/components/ui/design-system';

export default function Header2() {
  return (
    <div className='flex flex-row select-none pt-[53px] mobile:pt-[40px] px-[96px] mobile:justify-center mobile:px-[0px]'>
      <div className='w-fit cursor-pointer'>
        <GdgLogo mode='auto' variant='long' />
      </div>
    </div>
  );
}
