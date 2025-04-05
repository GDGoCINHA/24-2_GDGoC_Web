'use client'

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { exchangeGoogleToken } from '../GoogleAuthApi';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader'

export const GoogleAuthComponent = () => {
  const { setAccessToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const decodedCode = searchParams.get('code');
    if (!decodedCode) {
      setIsLoading(false);
      return;
    }

    const code = encodeURIComponent(decodedCode);

    exchangeGoogleToken(code)
      .then((res) => {
        const { exists, access_token, email, name } = res.data.data;
        if (exists) {
          setAccessToken(access_token);
          router.push('/');
        } else {
          alert('회원 정보가 없습니다. 회원가입을 완료해주세요.');
          sessionStorage.setItem('signup_email', email);
          sessionStorage.setItem('signup_name', name);
          router.push('/signup');
        }
      })
      .catch(() => {
        alert('구글 로그인 실패! 다시 시도해주세요.');
        router.push('/auth/signin');
      })
      .finally(() => setIsLoading(false));
  }, [searchParams, router, setAccessToken]);
  
    if (isLoading) {
      return <Loader isLoading={true} />;
    }
  return null;
};

export const GoogleAuth = () => (
  <Suspense fallback={<Loader isLoading={true} />}>
    <GoogleAuthComponent />
  </Suspense>
);