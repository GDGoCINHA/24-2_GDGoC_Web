'use client'

import axios from 'axios'
import { useCallback } from 'react'

import { requestAccessTokenRefresh, requestLogout } from '@/services/auth/authClient'
import { REFRESH_TOKEN_KEY, readStoredString } from '@/lib/auth/storage'

export type RefreshAccessTokenResponse = Awaited<
  ReturnType<typeof requestAccessTokenRefresh>
>

export const useAuthApi = () => {
  const refreshAccessToken = useCallback(async (): Promise<RefreshAccessTokenResponse> => {
    const storedRt = readStoredString(REFRESH_TOKEN_KEY)
    if (!storedRt) {
      throw new Error('리프레시 토큰이 없습니다.')
    }

    try {
      return await requestAccessTokenRefresh(storedRt)
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
    const storedRt = readStoredString(REFRESH_TOKEN_KEY)
    try {
      await requestLogout(storedRt ?? undefined)
    } catch (error) {
      console.error('로그아웃 요청 오류 발생:', error)
      throw error
    }
  }, [])

  return { refreshAccessToken, logout }
}
