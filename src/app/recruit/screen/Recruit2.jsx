"use client";

import { useState, useEffect } from 'react';
import { Input, Checkbox } from '@nextui-org/react';

export default function Recruit2({ step, setChecked, updateRecruitData }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [enrolledClassification, setEnrolledClassification] = useState('');

  useEffect(() => {
    const isNameFilled = name.trim() !== '';
    const isStudentIdFilled = studentId.trim() !== '';
    const isEnrolledClassificationFilled = enrolledClassification !== '';

    if (step === 2) {
      setChecked(isNameFilled && isStudentIdFilled && isEnrolledClassificationFilled);
      const formData = {
        name,
        studentId,
        enrolledClassification,
      };
      updateRecruitData(2, formData);
    }
  }, [name, studentId, enrolledClassification, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 === 2 ? 'opacity-0' : step === 2 ? '' : step + 1 === 2 ? 'opacity-0' : 'hidden'} 
        ${
          step - 1 === 2 ? '-translate-y-full' : step === 2 ? 'translate-y-0' : step + 1 === 2 ? 'translate-y-full' : ''
        }`}
    >
      <div className='flex flex-col w-full h-full text-white overflow-y-scroll'>
        <p className='text-white text-2xl mb-[27px] font-semibold mobile:text-xl'>필수 개인정보를 적어주세요</p>
        <Input
          label='국문성명'
          value={name}
          onValueChange={setName}
          variant='bordered'
          labelPlacement='outside'
          placeholder='성함을 입력해주세요'
          className='!mt-[57px]'
          disableAutoFocus
          classNames={{
            mainWrapper: 'w-60 h-[57px]',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white
                        group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <Input
          label='학번'
          value={studentId}
          onValueChange={setStudentId}
          variant='bordered'
          labelPlacement='outside'
          placeholder='학번을 입력해주세요'
          className='!mt-[60px]'
          disableAutoFocus
          classNames={{
            mainWrapper: 'w-60 h-[57px]',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                        group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <p className='text-white text-xl mt-[20px] mobile:text-lg'>재학 구분</p>
        <div className='flex flex-wrap gap-4 mt-[20px] w-full mobile:gap-3'>
          {['정등록', '부분등록', '휴학', '수료', '졸업'].map((label) => (
            <Checkbox
              key={label}
              isSelected={enrolledClassification === label}
              onValueChange={() => setEnrolledClassification(label)}
              radius='none'
              classNames={{
                wrapper: 'hidden',
                label: `text-white text-xl w-[150px] h-[57px] flex justify-center items-center rounded-md mobile:text-base mobile:w-[27vw] mobile:h-[49px]
                ${enrolledClassification === label ? 'bg-[#471915] border-[1.5px] border-[#ea4335]' : 'bg-[#181818]'}`,
              }}
            >
              {label}
            </Checkbox>
          ))}
        </div>
      </div>
    </div>
  );
}