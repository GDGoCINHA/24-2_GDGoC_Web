"use client";

import { useState, useEffect } from 'react';
import { Input, Checkbox, Select, SelectItem } from '@nextui-org/react';

export default function Recruit4({ step, setChecked, updateRecruitData }) {
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [etcEmailDomain, setEtcEmailDomain] = useState('');
  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState('');

  const domains = [
    { label: 'inha.edu', value: 'inha.edu' },
    { label: 'gmail.com', value: 'gmail.com' },
    { label: 'naver.com', value: 'naver.com' },
    { label: 'daum.net', value: 'daum.net' },
    { label: 'kakao.com', value: 'kakao.com' },
    { label: '기타', value: 'custom' },
  ];

  useEffect(() => {
    const isEmailFilled = emailId.trim() !== '';
    const isDomainFilled = emailDomain !== '' && (emailDomain !== 'custom' || etcEmailDomain.trim() !== '');
    const isGenderFilled = gender !== '';
    const isBirthFilled = birth.trim() !== '';

    if (step === 4) {
      setChecked(isEmailFilled && isDomainFilled && isGenderFilled && isBirthFilled);
      const formData = {
        email: emailId + '@' + (emailDomain === 'custom' ? etcEmailDomain : emailDomain),
        gender,
        birth,
      };
      updateRecruitData(4, formData);
    }
  }, [emailId, emailDomain, etcEmailDomain, gender, birth, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 == 4 ? 'opacity-0' : step == 4 ? '' : step + 1 == 4 ? 'opacity-0' : 'hidden'} 
        ${step - 1 == 4 ? '-translate-y-full' : step == 4 ? 'translate-y-0' : step + 1 == 4 ? 'translate-y-full' : ''}`}
    >
      <p className='text-white text-2xl font-semibold mobile:text-xl'>필수 개인정보를 적어주세요</p>

      <div className='flex flex-row items-end justify-start gap-2 !mt-[57px]'>
        <Input
          label='이메일'
          value={emailId}
          onValueChange={setEmailId}
          variant='bordered'
          labelPlacement='outside'
          placeholder=' '
          disableAutoFocus
          classNames={{
            base: 'w-auto',
            mainWrapper: 'w-60 h-[57px] mobile:w-[41vw]',
            label: '!text-white text-xl pb-[18px] mobile:text-lg',
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                          group-data-[focus=true]:border-[#bbbbbb30]`,
            input: 'text-lg mobile:text-base',
          }}
        />
        <span className='text-white text-xl mb-[14px] mobile:text-lg'>@</span>
        {emailDomain === 'custom' ? (
          <Input
            value={etcEmailDomain}
            onValueChange={setEtcEmailDomain}
            variant='bordered'
            placeholder=' '
            disableAutoFocus
            classNames={{
              mainWrapper: 'w-60 h-[57px] mobile:w-[39vw]',
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                            group-data-[focus=true]:border-[#bbbbbb30]`,
              input: 'text-lg mobile:text-base',
            }}
            endContent={
              <p
                className='text-white text-xl cursor-pointer mobile:text-lg'
                onClick={() => {
                  setEtcEmailDomain('');
                  setEmailDomain('');
                }}
              >
                ×
              </p>
            }
          />
        ) : (
          <Select
            placeholder=' '
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
            aria-label='이메일'
            className='w-[200px]'
            classNames={{
              trigger:
                'h-[57px] bg-[#181818] border-[#bbbbbb30] border-[1.5px] data-[hover=true]:bg-[#181818] data-[hover=true]:border-[#bbbbbb30]',
              value: '!text-white text-lg mobile:text-base',
              listbox: 'bg-[#181818] text-white',
              popoverContent: 'bg-[#181818]',
              selectorIcon: 'invert',
            }}
          >
            {domains.map((domain) => (
              <SelectItem key={domain.value} value={domain.value} className='text-white'>
                {domain.label}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      <p className='text-white text-xl mt-[20px] mobile:text-lg'>성별</p>
      <div className='flex gap-4 mt-[20px]'>
        {['남자', '여자'].map((label) => (
          <Checkbox
            key={label}
            isSelected={gender === label}
            onValueChange={() => setGender(label)}
            radius='none'
            classNames={{
              wrapper: 'hidden',
              label: `text-white text-lg w-[150px] h-[57px] flex justify-center items-center rounded-md mobile:text-base mobile:w-[27vw] mobile:h-[49px]
                      ${gender === label ? 'bg-[#471915] border-[1.5px] border-[#ea4335]' : 'bg-[#181818]'}`,
            }}
          >
            {label}
          </Checkbox>
        ))}
      </div>

      <Input
        label='생년월일'
        type='date'
        value={birth}
        onChange={(e) => setBirth(e.target.value)}
        variant='bordered'
        labelPlacement='outside'
        placeholder=' '
        className='!mt-[60px]'
        disableAutoFocus
        classNames={{
          mainWrapper: 'w-60 h-[57px]',
          label: '!text-white text-xl pb-[18px] mobile:text-lg',
          inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl mobile:text-lg
                        group-data-[focus=true]:border-[#bbbbbb30]`,
          input: '!text-black invert text-lg mobile:text-base',
        }}
      />
    </div>
  );
}