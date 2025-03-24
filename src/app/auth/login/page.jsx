'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Spinner } from '@nextui-org/react';
import googleIcon from '@public/src/images/google_icon.png';
import Image from 'next/image';
import Link from 'next/link';
import Header from './Header';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '../google/callback/GoogleAuth'


export default function Page() {
  const [isLoading, setIsLoading] = useState(false); //임시
  const router = useRouter();
  const [submitted, setSubmitted] = useState(null);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { handleGoogleLogin } = useGoogleLogin();


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
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
    } else {
      setErrors([]);
      setSubmitted(formData);
      console.log('Submitted data:', formData);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className='flex justify-center items-center h-screen'>
          <Spinner />
        </div>
      ) : (
        <div className='min-h-screen flex flex-col overflow-hidden'>
          <Header />
          <div className='flex justify-center items-center flex-1'>
            <div className='flex flex-col w-full gap-4 max-w-[349px] mx-[24px] my-[53px] select-none mobile:mx-[32px]'>
              <div className='text-[28px]/8 mobile:text-[26px] text-white font-bold'>
                <div>GDGoC Inha에</div>
                <div>오신 것을 환영합니다👋</div>
              </div>
              <Form className='w-full max-w-[349px]' validationBehavior='native' onSubmit={onSubmit}>
                <Input
                  isRequired
                  errorMessage={({ validationDetails, validationErrors }) => {
                    if (validationDetails.typeMismatch) {
                      validationErrors = '올바른 이메일 형식을 입력해주세요.';
                    } else {
                      validationErrors = '이메일을 입력해주세요.';
                    }
                    return validationErrors;
                  }}
                  className='!mt-[62px] w-full rounded-full'
                  classNames={{
                    label: '!pb-[10px] !text-white',
                    inputWrapper: `h-[48px] mobile:h-[46px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
                  group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
                  group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
                  group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#EA4336]`,
                    mainWrapper: 'relative',
                    helperWrapper: 'absolute -bottom-6 left-0',
                    input: '!text-white',
                    errorMessage: 'text-[#EA4336]',
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
                  className='!mt-[49px] w-full'
                  autoComplete='off'
                  classNames={{
                    label: '!pb-[10px] !text-white',
                    inputWrapper: `h-[48px] mobile:h-[46px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
                  group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent 
                  group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
                  group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#EA4336]`,
                    mainWrapper: 'relative',
                    helperWrapper: 'absolute -bottom-6 left-0',
                    input: '!text-white',
                    errorMessage: 'text-[#EA4336]',
                  }}
                  label='비밀번호'
                  labelPlacement='outside'
                  name='password'
                  type='password'
                  placeholder='비밀번호를 적어주세요'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors([]);
                  }}
                />
                <div className='flex flex-row justify-end w-full px-2 gap-[16.5px] text-[12px] text-[#DCDCDC]/50'>
                  <Link href='' className='transition ease-in-out hover:text-[#DCDCDC]'>
                    아이디 찾기
                  </Link>
                  <Link href='' className='transition ease-in-out hover:text-[#DCDCDC]'>
                    비밀번호 재설정
                  </Link>
                </div>
                <Button
                  color='primary'
                  type='submit'
                  className='!mt-[70px] h-[48px] mobile:h-[46px] w-full rounded-full !bg-[#EA4336]'
                >
                  로그인
                </Button>
              </Form>
              <Button color='success' className='!mt-[15px] h-[48px] mobile:h-[46px] w-full rounded-full !bg-white'>
                회원가입
              </Button>
              <div className='flex flex-row items-center justify-between max-w-[349px] gap-2'>
                <hr className='flex-1 border-t border-[#A8A8A8]' />
                <div className='px-2 text-[14px] text-[#A8A8A8]'>또는</div>
                <hr className='flex-1 border-t border-[#A8A8A8]' />
              </div>
              <div className='flex flex-col items-center justify-between max-w-[349px]'>
                <Image className='cursor-pointer' src={googleIcon} onClick={handleGoogleLogin} alt='googleIcon' height={54} width={54} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
