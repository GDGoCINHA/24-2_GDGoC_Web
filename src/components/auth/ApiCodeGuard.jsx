'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import Loader from '@/components/ui/common/Loader';

export default function ApiCodeGuard({ children }) {
  const router = useRouter();
  const { apiClient } = useAuthenticatedApi();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyAccess = async () => {
      try {
        const res = await apiClient.get('/recruit/members', {
          params: { page: 0, size: 20, sort: 'createdAt', dir: 'DESC' },
        });

        const code = res?.data?.code;
        if (!cancelled) {
          if (code === 200) {
            setAllowed(true);
          } else {
            router.replace('/auth/signin');
          }
        }
      } catch (error) {
        if (!cancelled) {
          // 인터셉터에서 401/403 처리로 리다이렉트가 발생할 수 있으므로, 보조적으로 차단
          router.replace('/auth/signin');
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [apiClient, router]);

  if (checking) return <Loader isLoading={true} />;
  if (!allowed) return null;
  return children;
} 