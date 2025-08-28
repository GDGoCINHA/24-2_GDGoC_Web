'use client'

import { useState, useMemo } from 'react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useAuth } from '@/hooks/useAuth';

export default function TestAuthPage() {
  const { apiClient } = useAuthenticatedApi();
  const { accessToken } = useAuth();

  const isLoggedIn = Boolean(accessToken);
  const maskedToken = useMemo(() => {
    if (!accessToken) return '-';
    const head = String(accessToken).slice(0, 8);
    const tail = String(accessToken).slice(-6);
    return `${head}...${tail}`;
  }, [accessToken]);

  const [loading, setLoading] = useState(false);
  const [httpStatus, setHttpStatus] = useState(null);
  const [payload, setPayload] = useState(null);
  const [errorText, setErrorText] = useState('');

  const handleCallAuthApi = async () => {
    setLoading(true);
    setErrorText('');
    setPayload(null);
    setHttpStatus(null);
    try {
      const res = await apiClient.get('/recruit/members', {
        params: { page: 0, size: 20, sort: 'createdAt', dir: 'DESC' },
      });
      setHttpStatus(res.status);
      setPayload(res.data);
    } catch (err) {
      const status = err?.response?.status ?? 'NETWORK_ERROR';
      setHttpStatus(status);
      if (err?.response?.data) setPayload(err.response.data);
      setErrorText(String(err?.message || 'request failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full px-6 py-10 text-white'>
      <h1 className='text-2xl font-bold mb-6'>로그인 테스트</h1>

      <section className='mb-6'>
        <div className='mb-1'>현재 로그인 상태</div>
        <div className={`inline-block rounded px-3 py-1 ${isLoggedIn ? 'bg-green-600' : 'bg-red-600'}`}>
          {isLoggedIn ? '로그인됨' : '미로그인'}
        </div>
        <div className='mt-2 text-sm text-gray-300'>액세스 토큰: {maskedToken}</div>
      </section>

      <section className='mb-6'>
        <button
          onClick={handleCallAuthApi}
          disabled={loading}
          className={`rounded px-4 py-2 ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {loading ? '요청 중...' : '인증 API 호출 (/api/v1/recruit/members)'}
        </button>
      </section>

      <section>
        <div className='mb-2 font-semibold'>응답</div>
        <div className='mb-1 text-sm'>HTTP Status: {httpStatus ?? '-'}</div>
        {errorText && (
          <div className='mb-2 text-red-400 text-sm'>에러: {errorText}</div>
        )}
        <pre className='bg-black/40 rounded p-3 overflow-auto max-h-[50vh] text-sm'>
{JSON.stringify(payload, null, 2) || '-'}
        </pre>
      </section>
    </div>
  );
} 