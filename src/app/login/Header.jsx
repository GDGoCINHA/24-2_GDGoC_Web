import React from 'react';
import gdgocIcon from '@public/src/images/GDGoC_icon.png';
import Image from 'next/image';

export default function Header() {
  return (
    <div className='flex flex-row select-none gap-x-[16px] mt-[53px] ml-[96px] w-fit cursor-pointer'>
      <Image className='' src={gdgocIcon} alt='gdgocIcon' width={54} height={26} />
      <div className='text-white text-[14px] pt-[3px]'>
        <strong>GDGoC</strong> Inha univ.
      </div>
    </div>
  );
}
