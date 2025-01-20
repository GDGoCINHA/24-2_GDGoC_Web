import React from 'react';
import gdgocIcon from '@public/src/images/GDGoC_icon.png';
import Image from 'next/image';

export default function Header() {
  return (
    <div className='flex flex-row select-none mt-[53px] mx-[96px] cursor-pointer mobile:justify-center'>
      <div className='flex flex-row gap-x-[16px] w-fit'>
        <Image className='' src={gdgocIcon} alt='gdgocIcon' width={54} height={26} />
        <div className='text-white text-[14px] pt-[3px]'>
          <strong>GDGoC</strong> Inha univ.
        </div>
      </div>
    </div>
  );
}
