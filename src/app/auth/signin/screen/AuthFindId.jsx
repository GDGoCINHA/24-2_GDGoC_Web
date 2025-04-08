'use client'

import { useState } from 'react';
import TransparentInput from '@/components/ui/TransparentInput';
import { Button } from '@nextui-org/react';
import { Autocomplete, AutocompleteItem, AutocompleteSection } from '@nextui-org/react';
import { majors } from '@/app/recruit/majors';
import axios from 'axios';

export default function AuthFindId({ handleBackToLogin }) {
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmitFindId = async () => {
    try {
      const response = await axios.post(
        'https://www.gdgocinha.site/auth/findId', {
          name,
          major,
          phoneNumber,
        },{
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const { email } = response.data.data;
      alert(`아이디: ${email}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('아이디를 찾을 수 없습니다. 입력값을 다시 확인해주세요.');
      }
      else {
        console.error(error);
      }
    }
  };
  const handlePreventEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };
  return (
    <div className='flex flex-col w-full gap-4 max-w-[349px] mx-[24px] my-[53px] mobile:my-[40px] select-none mobile:mx-[32px]'>
      <div className='text-[28px]/8 mobile:text-[24px] text-white font-bold'>
        <div>아이디 찾기</div>
      </div>
      <TransparentInput
        className='!mt-[40px]'
        label='이름'
        isRequired={false}
        placeholder='이름을 입력해주세요'
        type='text'
        name='name'
        value={name}
        autoComplete={false}
        onChange={(e) => setName(e.target.value)}
      />
      <Autocomplete
        allowsCustomValue
        label='주전공'
        labelPlacement='outside'
        placeholder='검색 혹은 스크롤하여 지정하세요'
        className='mt-[10px] w-full rounded-full'
        classNames={{
          popoverContent: 'bg-[#1c1c1c]',
          selectorButton: 'text-white',
        }}
        inputProps={{
          classNames: {
            label: '!pb-[10px] !text-white',
            inputWrapper: `h-[48px] mobile:h-[44px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
                group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
                group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
                group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#EA4336]`,
            input: '!text-white',
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

      <TransparentInput
        className='!mt-[35px]'
        label='전화번호'
        isRequired={false}
        placeholder='010-0000-0000'
        type='text'
        name='name'
        inputMode='numeric'
        value={phoneNumber}
        autoComplete={false}
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
      />

      <Button
        onPress={handleSubmitFindId}
        color='primary'
        className='!mt-[20px] h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#EA4336]'
      >
        제출하기
      </Button>
      <Button
        onPress={handleBackToLogin}
        color='default'
        className=' h-[48px] mobile:h-[44px] w-full rounded-full !bg-[#DCDCDC]'
      >
        뒤로가기
      </Button>
    </div>
  );
}
