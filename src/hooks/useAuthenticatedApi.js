import { useAuth } from './useAuth';
import { useAuthApi } from './useAuthApi';
import { useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export const useAuthenticatedApi = () => {
  const { accessToken, setAccessToken, clearAuth } = useAuth();
  const { refreshAccessToken, logout } = useAuthApi();
  const router = useRouter();
  const refreshPromiseRef = useRef(null);
  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    return () => {
      refreshPromiseRef.current = null;
    };
  }, []);

  const reAccessToken = useCallback(async () => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = refreshAccessToken();
    }
    
    try {
      const res = await refreshPromiseRef.current;
      return res;
    } catch (error) {
      throw error;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, [refreshAccessToken]);

  //로그인 이후 api 요청
  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: 'https://gdgocinha.site/',
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    // 요청 인터셉터
    client.interceptors.request.use(
      (config) => {
        if (accessTokenRef.current) {
          config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const res = await reAccessToken();
            const newAccessToken = res.data.data.access_token;
            
            setAccessToken(newAccessToken);
            accessTokenRef.current = newAccessToken;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            if (refreshError.response?.status === 401 || 
                refreshError.response?.data?.error === 'invalid_refresh_token') {
              alert('로그인이 만료되었습니다. 재로그인 해주세요.');
              clearAuth();
              router.push('/auth/signin');
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return client;
  }, [setAccessToken, clearAuth, router, reAccessToken]);

  //로그아웃 핸들
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 handle 실패:', error);
    } finally {
      clearAuth();
      router.push('/auth/signin');
    }
  }, [logout, router, clearAuth]);

  return { apiClient, handleLogout };
};