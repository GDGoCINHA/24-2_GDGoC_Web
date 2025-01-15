'use client';

import React, { useState } from 'react';
import { Button, Form, Input } from '@nextui-org/react';
import googleIcon from '@public/src/images/google_icon.png';
import Image from 'next/image';
import Link from 'next/link';
import Header from './Header';

export default function Page() {
  const [submitted, setSubmitted] = useState(null);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const validatePassword = (password) => {
    const newErrors = [];
    if (password.length <= 0) {
      newErrors.push('비밀번호를 입력해주세요.');
    }
    return newErrors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));
    const passwordErrors = validatePassword(password); // 현재 비밀번호를 검증

    if (passwordErrors.length > 0) {
      setErrors(passwordErrors); // 에러 상태 업데이트
    } else {
      setErrors([]); // 에러 초기화
      setSubmitted(formData); // 제출 데이터 저장
      console.log('Submitted data:', formData);
    }
  };

  return (
    <>
      <Header />
      <div className='flex min-h-screen justify-center px-6 py-12 select-none'>
        <div className='flex flex-col w-full justify-center gap-4 max-w-[414px]'>
          <div className='text-[30px] text-white'>
            GDGoC Inha에 <br /> 오신 것을 환영합니다👋
          </div>
          <Form className='w-full max-w-[414px]' validationBehavior='native' onSubmit={onSubmit}>
            <Input
              isRequired
              errorMessage={({ validationDetails, validationErrors }) => {
                if (validationDetails.typeMismatch) {
                  return '올바른 이메일 형식을 입력해주세요.';
                } else {
                  return '이메일을 입력해주세요.';
                }
                return validationErrors;
              }}
              className='!mt-[49.5px] w-full rounded-full'
              classNames={{
                label: '!pb-[12px] !text-white',
                inputWrapper: `h-[57px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
              group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#F31260]`,
                mainWrapper: 'relative',
                helperWrapper: 'absolute -bottom-6 left-0',
                input: '!text-white',
              }}
              label='아이디'
              labelPlacement='outside'
              name='email'
              placeholder='이메일을 적어주세요'
              type='email'
            />
            <Input
              errorMessage={() => (
                <ul>
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}
              isInvalid={errors.length > 0}
              className='!mt-[49.5px] w-full'
              autoComplete='off'
              classNames={{
                label: '!pb-[12px] !text-white',
                inputWrapper: `h-[57px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent 
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
              group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#F31260]`,
                mainWrapper: 'relative',
                helperWrapper: 'absolute -bottom-6 left-0',
                input: '!text-white',
              }}
              label='비밀번호'
              labelPlacement='outside'
              name='password'
              type='password'
              placeholder='비밀번호를 적어주세요'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors([]); // 에러 메시지 초기화
              }}
            />
            <div className='flex flex-row justify-end w-full px-2 gap-[16.5px] text-xs text-[#DCDCDC]/50'>
              <Link href='' className='transition ease-in-out hover:text-[#DCDCDC]'>
                아이디 찾기
              </Link>
              <Link href='' className='transition ease-in-out hover:text-[#DCDCDC]'>
                비밀번호 재설정
              </Link>
            </div>
            <Button color='primary' type='submit' className='!mt-[91.5px] h-[57px] w-full rounded-full !bg-[#EA4336]'>
              로그인
            </Button>
          </Form>
          <Button color='success' className='!mt-[15px] h-[57px] w-full rounded-full !bg-white'>
            회원가입
          </Button>
          <div className='flex flex-row items-center justify-between max-w-[414px] gap-2'>
            <hr className='flex-1 border-t border-[#A8A8A8]' />
            <div className='px-2 text-sm text-[#A8A8A8]'>또는</div>
            <hr className='flex-1 border-t border-[#A8A8A8]' />
          </div>
          <div className='flex flex-col items-center justify-between max-w-[414px]'>
            <Image className='cursor-pointer' src={googleIcon} alt='googleIcon' height={50} width={50} />
          </div>
        </div>
      </div>
    </>
  );
}
