'use client'

import axios from 'axios'
import { useCallback } from 'react'

import { requestAccessTokenRefresh, requestLogout } from '@/services/auth/authClient'

export type RefreshAccessTokenResponse = Awaited<
  ReturnType<typeof requestAccessTokenRefresh>
>

export const useAuthApi = () => {
  const refreshAccessToken = useCallback(async (): Promise<RefreshAccessTokenResponse> => {
    try {
      return await requestAccessTokenRefresh()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('리프레시 토큰 만료')
      } else {
        console.error('Access Token 갱신 오류: ', error)
      }
      throw error
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await requestLogout()
    } catch (error) {
      console.error('로그아웃 요청 오류 발생:', error)
      throw error
    }
  }, [])

  return { refreshAccessToken, logout }
}
