'use client';

import React, { useState } from 'react';
import { Button, Form, Input } from '@nextui-org/react';

export default function Page() {
  const [submitted, setSubmitted] = useState(null);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const validatePassword = (password) => {
    const newErrors = [];
    if (password.length < 4) {
      newErrors.push('Password must be 4 characters or more.');
    }
    if ((password.match(/[A-Z]/g) || []).length < 1) {
      newErrors.push('Password must include at least 1 upper case letter.');
    }
    if ((password.match(/[^a-z0-9]/gi) || []).length < 1) {
      newErrors.push('Password must include at least 1 symbol.');
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
    <div className='flex min-h-screen justify-center px-6 py-12'>
      <div className='flex flex-col w-full justify-center gap-4 max-w-[414px]'>
        <div className='text-[30px]'>
          GDGoC Inha에 <br /> 오신 것을 환영합니다
        </div>
        <Form className='w-full max-w-[414px]' validationBehavior='native' onSubmit={onSubmit}>
          <Input
            isRequired
            errorMessage={({ validationDetails, validationErrors }) => {
              if (validationDetails.typeMismatch) {
                return 'Please enter a valid email address.';
              }
              return validationErrors;
            }}
            className='!mt-[49.5px] w-full'
            classNames={{
              label: '!pb-[12px]',
              inputWrapper: 'h-[57px]',
            }}
            label='아이디'
            labelPlacement='outside'
            name='email'
            placeholder='Enter your email'
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
            classNames={{
              label: '!pb-[12px]',
              inputWrapper: 'h-[57px]',
            }}
            label='비밀번호'
            labelPlacement='outside'
            name='password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors([]); // 에러 메시지 초기화
            }}
          />
          <Button color='primary' type='submit' className='!mt-[91.5px] h-[57px] w-full rounded-full'>
            로그인
          </Button>
        </Form>
        <Button color='primary' className='!mt-[15px] h-[57px] w-full rounded-full'>
          회원가입
        </Button>
        <div className='flex flex-row items-center justify-between max-w-[414px] gap-2'>
          <hr className='flex-1 border-t border-[#A8A8A8]' />
          <div className='px-2 text-sm text-[#A8A8A8]'>또는</div>
          <hr className='flex-1 border-t border-[#A8A8A8]' />
        </div>
      </div>
    </div>
  );
}
