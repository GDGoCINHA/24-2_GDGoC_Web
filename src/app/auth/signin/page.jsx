'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import loginBg from '@public/src/images/bgimg.png';
import Header from './screen/Header';
import AuthLogin from './screen/AuthLogin';
import AuthFindId from './screen/AuthFindId';
import AuthResetPassword from './screen/AuthResetPassword';
import AuthResetRequest from './screen/AuthResetRequest';
import Loader from '@/components/ui/Loader.jsx';

import { GoogleLogin } from './google/GoogleLogin';
import { login } from './custom/CustomAuthApi';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { handleGoogleLogin } = GoogleLogin();
  const [isRendering, setIsRendering] = useState(0);
  const { setAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBackToLogin = () => setIsRendering(0);
  const handleFindIdClick = () => setIsRendering(1);
  const handleResetPasswordClick = () => setIsRendering(2);
  const handleBackToResetRequest = () => setIsRendering(2);
  const handleResetPasswordNext = () => setIsRendering(3);

  const validatePassword = (password) => {
    const newErrors = [];
    if (password.length <= 0) {
      newErrors.push('비밀번호를 입력해주세요.');
    }
    return newErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
    } else {
      setErrors([]);

      try {
        const { email, password } = formData;
        setLoading(true);
        const res = await login(email, password);
        const { exists, access_token } = res.data.data;
      
        if (!exists) {
          alert('아이디 혹은 비밀번호가 올바르지 않습니다.');
          setLoading(false);
          return;
        }
      
        setAccessToken(access_token);
        router.push('/study');
      } catch (error) {
        console.error('로그인 실패:', error);
        alert('로그인 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }
  };

  return (
    <div className='min-h-screen flex flex-col overflow-hidden relative'>
      <Loader isLoading={loading} />
      <Header />
      <Image src={loginBg} alt='loginBg' fill className='absolute top-0 left-0 -z-10 object-cover opacity-70 blur-sm' />
      <div className='flex justify-center items-center flex-1 relative'>
        {/* 로그인 화면 */}
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

        {/* 아이디 찾기 화면 */}
        <div
          key='screen2'
          className={`absolute w-full transition-all duration-500 ease-in-out transform ${
            isRendering === 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } flex justify-center items-center mt-[-30px]`}
        >
          <AuthFindId handleBackToLogin={handleBackToLogin} />
        </div>

        {/* 비밀번호 재설정 화면 1 */}
        <div
          key='screen3'
          className={`absolute w-full transition-all duration-500 ease-in-out transform ${
            isRendering === 2
              ? 'translate-x-0 opacity-100'
              : `${isRendering === 3 ? '-translate-x-full' : 'translate-x-full'} opacity-0`
          } flex justify-center items-center`}
        >
          <AuthResetRequest 
            handleNextStep={handleResetPasswordNext} 
            handleBackToLogin={handleBackToLogin} 
            setLoading={setLoading}
          />
        </div>

        {/* 비밀번호 재설정 화면 2 */}
        <div
          key='screen4'
          className={`absolute w-full transition-all duration-500 ease-in-out transform ${
            isRendering === 3 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } flex justify-center items-center`}
        >
          <AuthResetPassword
            handleBackToLogin={handleBackToLogin}
            handleBackToResetRequest={handleBackToResetRequest}
            setLoading={setLoading}
          />
        </div>
      </div>
    </div>
  );
}
