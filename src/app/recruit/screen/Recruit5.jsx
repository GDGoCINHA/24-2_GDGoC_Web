"use client";

import { useState, useEffect } from 'react';
import { majors } from '../majors';
import { Autocomplete, AutocompleteItem, AutocompleteSection, Input } from '@nextui-org/react';

export default function Recruit5({ step, setChecked, updateRecruitData }) {
  const [major, setMajor] = useState('');
  const [doubleMajor, setDoubleMajor] = useState('');

  useEffect(() => {
    const isMajorFilled = major ? major.trim().length : false;
    if (step === 5) {
      setChecked(isMajorFilled);
      const formData = {
        major,
        doubleMajor,
      };
      updateRecruitData(5, formData);
    }
  }, [major, doubleMajor, step, setChecked, updateRecruitData]);

  const handlePreventEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 == 5 ? 'opacity-0' : step == 5 ? '' : step + 1 == 5 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 5 ? '-translate-y-full' : step == 5 ? 'translate-y-0' : step + 1 == 5 ? 'translate-y-full' : ''}`}
    >
      <p className='text-white text-2xl font-semibold mobile:text-xl'>필수 개인정보를 적어주세요</p>
      <Autocomplete
      allowsCustomValue
        label='주전공'
        labelPlacement='outside'
        placeholder='검색 혹은 스크롤하여 지정하세요'
        className='!mt-14 w-96 mobile:w-[90vw]'
        classNames={{
          popoverContent: 'bg-[#1c1c1c]',
          selectorButton: 'text-white',
        }}
        inputProps={{
          classNames: {
            label: '!text-white text-xl pb-3 mobile:text-lg',
            inputWrapper:
              'rounded-full bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]',
            input: '!text-white text-xl mobile:text-lg',
          },
          onKeyDown: handlePreventEnter,
        }}
        popoverProps={{
          classNames: {
            base: 'mt-3',
          },
        }}
        listboxProps={{
          classNames: {
            base: 'bg-[#1c1c1c] text-white',
          },
        }}
        selectedKeys={major}
        onSelectionChange={setMajor}
      >
        {majors.map((major) => (
          <AutocompleteSection title={major.title} key={major.title} showDivider>
            {major.items.map((item) => (
              <AutocompleteItem key={item.key} aria-label={item.value} value={item.value}>
                {item.value}
              </AutocompleteItem>
            ))}
          </AutocompleteSection>
        ))}
      </Autocomplete>
      <div className='flex flex-col w-full mt-6'>
        <p className='text-white text-xl mobile:text-lg'>다중전공 (선택)</p>
        <p className='text-white text-base mt-2 mobile:text-sm'>
          • 현재 진행 중인 다중 전공(복수전공, 부전공, 융합전공, 연계전공)을 순서에 맞게 띄어쓰기 없이 정확한 이름으로
          입력해주세요.
          <br /> ex) XXX 학과 복수전공, 000학과 융합전공
        </p>
        <Input
          value={doubleMajor}
          onValueChange={setDoubleMajor}
          variant='bordered'
          labelPlacement='outside'
          placeholder='다중전공이 있을경우 입력해주세요.'
          className='!mt-5'
          classNames={{
            mainWrapper: 'w-96 h-[57px] mobile:w-[90vw]',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                                group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
      </div>
    </div>
  );
}
