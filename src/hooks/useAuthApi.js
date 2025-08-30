'use client'

import axios from 'axios';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const API_AUTH_URL = process.env.NEXT_PUBLIC_BASE_API_URL + '/auth';

export const useAuthApi = () => {
  const { accessToken } = useAuth();

  // Access Token 갱신 (stable)
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_AUTH_URL}/refresh`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
          credentials: 'include',
        }
      );
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn('리프레시 토큰 만료');
      } else {
        console.error('Access Token 갱신 오류: ', error);
      }
      throw error;
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API_AUTH_URL}/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('로그아웃 요청 오류 발생:', error);
      throw error;
    }
  }, [accessToken]);

  return { refreshAccessToken, logout };
};