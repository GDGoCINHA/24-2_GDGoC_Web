import React from 'react';
import Image from 'next/image';

import gdgocIcon from '@public/src/images/GDGoC_icon.png';

export default function StudyHeader() {
  return (
    <div className='flex flex-row select-none pt-[53px] px-[96px] mobile:justify-center mobile:px-[0px]'>
      <div className='flex flex-row gap-x-[16px] w-fit cursor-pointer'>
        <Image className='w-[54px] h-[26px]' src={gdgocIcon} alt='gdgocIcon'/>
        <div className='text-white text-[16px] pt-[3px]'>
          <strong>GDGoC</strong> Inha univ.
        </div>
      </div>
    </div>
  );
}
