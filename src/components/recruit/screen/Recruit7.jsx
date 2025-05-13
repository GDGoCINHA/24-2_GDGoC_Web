"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@nextui-org/react';

export default function Recruit7({ step, setChecked, updateRecruitData }) {
  const [gdgUserStory, setGdgUserStory] = useState('');

  useEffect(() => {
    if (step === 7) {
      setChecked(true);
      const formData = {
        gdgUserStory,
      };

      updateRecruitData(7, formData);
    }
  }, [gdgUserStory, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 === 7 ? 'opacity-0' : step === 7 ? '' : step + 1 === 7 ? 'opacity-0' : 'hidden'} 
        ${step - 1 === 7 ? '-translate-y-full' : step === 7 ? 'translate-y-0' : step + 1 === 7 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col text-white p-2 w-full h-full max-w-4xl mx-auto overflow-y-scroll'>
        <div className='text-2xl font-semibold mobile:text-xl'>지원자의 삶과 진로 경험 & 이야기 (선택)</div>
        <div className='text-base text-[#eeeeee] mt-[5px] mobile:text-[15px]'>
          <ul>
            <li>
              • GDG on campus INHA 24-2 가입 이전, 어떤 활동 및 공부를 하고 계셨나요? 여러분에 대한 정보를 편하게
              알려주세요! <br /> 기존 멤버분들께서는 간단하게 적어주셔도 됩니다 😀
            </li>
            <li>
              • ex) 1학년: ☆☆동아리 하면서 대학생활 / 2학년: ☆☆을 공부하는 학부 연구생, ☆☆대외활동 / 3학년: 잠시의
              방황과 교환학생 / 4학년: ☆☆기업 인턴
            </li>
          </ul>
        </div>
        <Textarea
          disableAutosize
          className='dark w-full h-full mt-[18px] rounded-2xl'
          labelPlacement='outside'
          placeholder='당신의 이야기를 편하게 적어주세요.'
          value={gdgUserStory}
          onValueChange={setGdgUserStory}
          classNames={{
            innerWrapper: '!h-full',
            input: '!h-full',
            inputWrapper: `border-1 border-[#ffffff34] !h-full`,
          }}
        />
      </div>
    </div>
  );
}