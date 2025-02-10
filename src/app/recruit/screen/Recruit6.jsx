"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@nextui-org/react';

export default function Recruit6({ step, setChecked, updateRecruitData }) {
  const [gdgUserMotive, setGdgUserMotive] = useState('');

  useEffect(() => {
    if (step === 6) {
      setChecked(gdgUserMotive.trim() !== '');
      const formData = {
        gdgUserMotive,
      };
      
      updateRecruitData(6, formData);
    }
  }, [gdgUserMotive, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 == 6 ? 'opacity-0' : step == 6 ? '' : step + 1 == 6 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 6 ? '-translate-y-full' : step == 6 ? 'translate-y-0' : step + 1 == 6 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col text-white p-2 w-full h-full max-w-4xl mx-auto overflow-y-scroll'>
        <div className='text-2xl font-semibold mobile:text-xl'>지원 동기</div>
        <div className='text-base text-[#eeeeee] mt-[5px] mobile:text-[15px]'>
          <ul>
            <li>• GDG on Campus INHA 멤버 가입을 지원하게 된 동기가 어떻게 되시나요?</li>
            <li>• 많은 동아리들 중, &apos;GDG on Campus INHA&apos; 를 선택하신 계기가 궁금합니다.</li>
            <li>• 글자 수 제한은 없습니다. 편하게 작성 부탁드립니다. </li>
          </ul>
        </div>
        <Textarea
          disableAutosize
          className='dark w-full h-full mt-[18px] rounded-2xl'
          labelPlacement='outside'
          placeholder='지원 동기를 자유롭게 작성해주세요.'
          value={gdgUserMotive}
          onValueChange={setGdgUserMotive}
          classNames={{
            innerWrapper: "!h-full",
            input: "!h-full",
            inputWrapper: `border-1 border-[#ffffff34] !h-full`,
          }}
        />
      </div>
    </div>
  );
}