'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import Loader from '@/components/ui/common/Loader';

import AuthLogin from '@/components/auth/screen/AuthLogin';
import AuthFindId from '@/components/auth/screen/AuthFindId';
import AuthResetPassword from '@/components/auth/screen/AuthResetPassword';
import AuthResetRequest from '@/components/auth/screen/AuthResetRequest';

import { GoogleLogin } from '@/services/auth/signin/google/GoogleLogin';
import { login } from '@/services/auth/signin/custom/CustomAuthApi';

import { useAuth } from '@/hooks/useAuth';

import loginBg from '@public/images/bgimg.png';

const DEFAULT_FALLBACK_ROUTE = '/main';

const getSafeNextUrl = (raw: string | null): string => {
  if (!raw) return DEFAULT_FALLBACK_ROUTE;

  try {
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith('/') ? decoded : DEFAULT_FALLBACK_ROUTE;
  } catch {
    return DEFAULT_FALLBACK_ROUTE;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken } = useAuth();
  const { handleGoogleLogin } = GoogleLogin();

  const nextUrl = useMemo(
    () => getSafeNextUrl(searchParams?.get('next') ?? null),
    [searchParams],
  );

  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const handleBackToLogin = () => setIsRendering(0);
  const handleFindIdClick = () => setIsRendering(1);
  const handleResetPasswordClick = () => setIsRendering(2);
  const handleBackToResetRequest = () => setIsRendering(2);
  const handleResetPasswordNext = (email: string) => {
    setVerifiedEmail(email);
    setIsRendering(3);
  };

  const validatePassword = (value: string): string[] => {
    const newErrors: string[] = [];
    if (value.length <= 0) {
      newErrors.push('비밀번호를 입력해주세요.');
    }
    return newErrors;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() ?? '';
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const res = await login(email, password);
      const { exists, access_token } = res.data.data;

      if (!exists) {
        alert('아이디 혹은 비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      setAccessToken(access_token);

      router.push(nextUrl);
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <>
      <Loader isLoading={loading} />
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
            handleGoogleLogin={() => handleGoogleLogin({ next: nextUrl })}
            handleFindIdClick={handleFindIdClick}
            handleResetPasswordClick={handleResetPasswordClick}
          />
        </div>

        <div
          key='screen2'
          className={`absolute w-full transition-all duration-500 ease-in-out transform ${
            isRendering === 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } flex justify-center items-center mt-[-30px]`}
        >
          <AuthFindId handleBackToLogin={handleBackToLogin} />
        </div>

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

        <div
          key='screen4'
          className={`absolute w-full transition-all duration-500 ease-in-out transform ${
            isRendering === 3 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } flex justify-center items-center`}
        >
          <AuthResetPassword
            email={verifiedEmail}
            handleBackToLogin={handleBackToLogin}
            handleBackToResetRequest={handleBackToResetRequest}
            setLoading={setLoading}
          />
        </div>
      </div>
    </>
  );
}
