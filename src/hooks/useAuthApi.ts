'use client';

import axios, { type AxiosResponse } from 'axios';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';

const API_AUTH_URL = `${process.env.NEXT_PUBLIC_BASE_API_URL ?? ''}/auth`;

interface RefreshResponseBody {
  data: {
    access_token: string;
  };
}

export type RefreshAccessTokenResponse = AxiosResponse<RefreshResponseBody>;

export const useAuthApi = () => {
  const { accessToken } = useAuth();

  const refreshAccessToken = useCallback(
    async (): Promise<RefreshAccessTokenResponse> => {
      try {
        return await axios.post(
          `${API_AUTH_URL}/refresh`,
          {},
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          },
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.warn('리프레시 토큰 만료');
        } else {
          console.error('Access Token 갱신 오류: ', error);
        }
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await axios.post(
        `${API_AUTH_URL}/logout`,
        {},
        {
          withCredentials: true,
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        },
      );
    } catch (error) {
      console.error('로그아웃 요청 오류 발생:', error);
      throw error;
    }
  }, [accessToken]);

  return { refreshAccessToken, logout };
};
