"use client";

import { useState, useEffect, useRef } from 'react';
import { Input, Checkbox, Select, SelectItem } from '@nextui-org/react';

export default function Recruit3({ step, setChecked, updateRecruitData }) {
  const [grade, setGrade] = useState('');
  const [nationality, setNationality] = useState('');
  const [etcNationality, setEtcNationality] = useState('');
  const nationalityInputRef = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSelectBoxOpen, setIsSelectBoxOpen] = useState(false);

  useEffect(() => {
    const isGradeFilled = grade.trim() !== '';
    const isPhoneNumberFilled = phoneNumber.trim() !== '';
    const isNationalityFilled = nationality === '기타' ? etcNationality.trim() !== '' : nationality !== '';
    if (step === 3) {
      setChecked(isGradeFilled && isNationalityFilled && isPhoneNumberFilled);
      const formData = {
        grade,
        phoneNumber,
        nationality: nationality === '기타' ? etcNationality : nationality,
      };
      updateRecruitData(3, formData);
    }
  }, [grade, nationality, etcNationality, phoneNumber, step, setChecked, updateRecruitData]);

  useEffect(() => {
    if (nationality === '기타' && nationalityInputRef.current) {
      nationalityInputRef.current.focus();
    }
  }, [nationality]);

  const handleSelectBoxOpen = (open) => {
    setTimeout(() => {
      setIsSelectBoxOpen(open);
    }, 80);
  };

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 == 3 ? 'opacity-0' : step == 3 ? '' : step + 1 == 3 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 3 ? '-translate-y-full' : step == 3 ? 'translate-y-0' : step + 1 == 3 ? 'translate-y-full' : ''}`}
    >
      <div className='flex flex-col w-full h-full text-white overflow-y-scroll'>
        <p className='text-white text-2xl font-semibold mb-[15px] mobile:text-xl'>필수 개인정보를 적어주세요</p>
        <Select
          label='학년'
          aria-label='학년'
          labelPlacement='outside'
          placeholder='학년을 선택하세요'
          className='w-[200px] !mt-[55px]'
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          onOpenChange={handleSelectBoxOpen}
          isOpen={isSelectBoxOpen}
          classNames={{
            trigger:
              'h-[53px] bg-[#181818] border-[#bbbbbb30] border-[1.5px] data-[hover=true]:bg-[#181818] data-[hover=true]:border-[#bbbbbb30]',
            value: '!text-white text-lg mobile:text-base',
            label: '!text-white text-xl pb-[12px] mobile:text-lg',
            popoverContent: 'bg-[#181818]',
            selectorIcon: 'text-white',
          }}
        >
          <SelectItem key='1학년' value='1학년' className='text-white'>
            1학년
          </SelectItem>
          <SelectItem key='2학년' value='2학년' className='text-white'>
            2학년
          </SelectItem>
          <SelectItem key='3학년' value='3학년' className='text-white'>
            3학년
          </SelectItem>
          <SelectItem key='4학년' value='4학년' className='text-white'>
            4학년
          </SelectItem>
          <SelectItem key='초과학기' value='초과학기' className='text-white'>
            초과학기
          </SelectItem>
        </Select>
        <Input
          label='전화번호'
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length <= 11) {
              let formattedNumber = '';
              if (value.length > 3) {
                formattedNumber += value.slice(0, 3) + '-';
                if (value.length > 7) {
                  formattedNumber += value.slice(3, 7) + '-' + value.slice(7);
                } else {
                  formattedNumber += value.slice(3);
                }
              } else {
                formattedNumber = value;
              }
              setPhoneNumber(formattedNumber);
            }
          }}
          placeholder='010-0000-0000'
          inputMode="numeric"
          variant='bordered'
          labelPlacement='outside'
          className='!mt-[68px]'
          disableAutoFocus
          classNames={{
            mainWrapper: 'w-60 h-[57px]',
            label: '!text-white text-xl pb-[12px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                        group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <p className='text-white text-xl mt-[28px] mobile:text-lg'>국적</p>
        <div className='flex flex-wrap gap-4 mt-[20px] w-full'>
          {['대한민국', '기타'].map((label) => (
            <Checkbox
              key={label}
              isSelected={nationality === label}
              onValueChange={() => setNationality(label)}
              radius='none'
              classNames={{
                wrapper: 'hidden',
                label: `text-white text-lg w-[150px] h-[57px] flex justify-center items-center rounded-md mobile:text-base mobile:w-[27vw] mobile:h-[49px]
                ${nationality === label ? 'bg-[#471915] border-[1.5px] border-[#ea4335]' : 'bg-[#181818]'}`,
              }}
            >
              {label}
            </Checkbox>
          ))}
        </div>

        {nationality === '기타' && (
          <Input
            ref={nationalityInputRef}
            variant='bordered'
            placeholder='국가를 입력해주세요'
            className='max-w-xs mt-4'
            value={etcNationality}
            onValueChange={setEtcNationality}
            classNames={{
              mainWrapper: 'w-60 h-[57px]',
              label: '!text-white text-xl pb-[18px]',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                  group-data-[focus=true]:border-[#bbbbbb30]`,
              input: 'text-lg mobile:text-base',
            }}
          />
        )}
      </div>
    </div>
  );
}