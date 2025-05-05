'use client'

import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_AUTH_URL = 'https://gdgocinha.site/auth';

export const useAuthApi = () => {
  const { accessToken } = useAuth();

  // Access Token 갱신 함수
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${API_AUTH_URL}/refresh`, {}, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      return response;
    } catch (error) {
      if(error.response?.status === 401) {
        console.warn('리프레시 토큰 만료');
      } else {
        console.error('Access Token 갱신 오류: ', error);
      }
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
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
  };

  return { refreshAccessToken, logout };
};