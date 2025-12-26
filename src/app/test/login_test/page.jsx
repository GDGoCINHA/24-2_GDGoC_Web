'use client';

import { useMemo, useState } from 'react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@/services/auth/signin/google/GoogleLogin';

const NEXT_PATH = '/test/login_test';

export default function LoginTestPage() {
  const { apiClient } = useAuthenticatedApi();
  const { accessToken } = useAuth();
  const { handleGoogleLogin } = GoogleLogin();

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

  const handleCallTestApi = async () => {
    setLoading(true);
    setErrorText('');
    setPayload(null);
    setHttpStatus(null);
    try {
      const res = await apiClient.get('/test/login_test');
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
      <h1 className='text-2xl font-bold mb-6'>Google Login Test</h1>

      <section className='mb-6'>
        <div className='mb-1'>Current login state</div>
        <div className={`inline-block rounded px-3 py-1 ${isLoggedIn ? 'bg-green-600' : 'bg-red-600'}`}>
          {isLoggedIn ? 'Logged in' : 'Not logged in'}
        </div>
        <div className='mt-2 text-sm text-gray-300'>Access token: {maskedToken}</div>
      </section>

      <section className='mb-6 flex flex-wrap gap-3'>
        <button
          onClick={() => handleGoogleLogin({ next: NEXT_PATH })}
          className='rounded px-4 py-2 bg-emerald-600 hover:bg-emerald-500'
        >
          Start Google Login
        </button>
        <button
          onClick={handleCallTestApi}
          disabled={loading}
          className={`rounded px-4 py-2 ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {loading ? 'Requesting...' : 'Call Test API (/api/v1/test/login_test)'}
        </button>
      </section>

      <section>
        <div className='mb-2 font-semibold'>Response</div>
        <div className='mb-1 text-sm'>HTTP Status: {httpStatus ?? '-'}</div>
        {errorText && (
          <div className='mb-2 text-red-400 text-sm'>Error: {errorText}</div>
        )}
        <pre className='bg-black/40 rounded p-3 overflow-auto max-h-[50vh] text-sm'>
{payload ? JSON.stringify(payload, null, 2) : '-'}
        </pre>
      </section>
    </div>
  );
}
