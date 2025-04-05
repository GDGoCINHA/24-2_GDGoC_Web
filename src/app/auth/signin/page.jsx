'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import loginBg from '@public/src/images/bgimg.png';
import Header from './screen/Header';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from './google/GoogleLogin';
import AuthLogin from './screen/AuthLogin';
import AuthFindId from './screen/AuthFindId';
import AuthResetPassword from './screen/AuthResetPassword';

export default function Page() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(null);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { handleGoogleLogin } = GoogleLogin();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRendering, setIsRendering] = useState(0); // (0: AuthLogin, 1: AuthFindId, 2: AuthResetPassword)

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

  const handleFindIdClick = () => {
    setIsRendering(1);
  };

  const handleResetPasswordClick = () => {
    setIsRendering(2);
  };

  const handleBackToLogin = () => {
    setIsRendering(0);
  };

  return (
    <>
      <div className='min-h-screen flex flex-col overflow-hidden relative'>
        <Header />
        <Image
          src={loginBg}
          alt='loginBg'
          fill
          className='absolute top-0 left-0 -z-10 object-cover opacity-70 blur-sm'
        />
        <div className='flex justify-center items-center flex-1 relative'>
          <div
            key='screen1'
            className={`absolute w-full transition-all duration-500 ease-in-out transform ${
              isRendering === 0 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            } flex justify-center items-center`}
          >
            <AuthLogin
              router={router}
              onSubmit={onSubmit}
              errors={errors}
              password={password}
              setPassword={setPassword}
              setErrors={setErrors}
              handleGoogleLogin={handleGoogleLogin}
              handleFindIdClick={handleFindIdClick}
              handleResetPasswordClick={handleResetPasswordClick}
            />
          </div>

          <div
            key='screen2'
            className={`absolute w-full transition-all duration-500 ease-in-out transform ${
              isRendering === 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            } flex justify-center items-center`}
          >
            <AuthFindId handleBackToLogin={handleBackToLogin} />
          </div>

          <div
            key='screen3'
            className={`absolute w-full transition-all duration-500 ease-in-out transform ${
              isRendering === 2 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            } flex justify-center items-center`}
          >
            <AuthResetPassword handleBackToLogin={handleBackToLogin} />
          </div>
        </div>
      </div>
    </>
  );
}