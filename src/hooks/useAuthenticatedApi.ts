'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios, {
  AxiosHeaders,
  type AxiosHeaderValue,
  type AxiosInstance,
  type InternalAxiosRequestConfig
} from 'axios'

import { useAuth } from '@/hooks/useAuth'
import { type RefreshAccessTokenResponse, useAuthApi } from '@/hooks/useAuthApi'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const ensureAxiosHeaders = (headers?: InternalAxiosRequestConfig['headers']): AxiosHeaders => {
  if (headers instanceof AxiosHeaders) {
    return headers
  }

  return new AxiosHeaders(headers)
}

const headerValueToString = (value: AxiosHeaderValue | null | undefined): string | undefined => {
  if (value === undefined || value === null || value === false) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(String).join(', ')
  if (value instanceof AxiosHeaders) return value.toString()
  return String(value)
}

const readHeaderValue = (
  headers?: InternalAxiosRequestConfig['headers'],
  key?: string
): string | undefined => {
  if (!headers || !key) return undefined

  if (headers instanceof AxiosHeaders) {
    return headerValueToString(headers.get(key))
  }

  const normalized = headers as Record<string, AxiosHeaderValue | undefined>
  return headerValueToString(normalized[key])
}

export const useAuthenticatedApi = () => {
  const { accessToken, setAccessToken, clearAuth } = useAuth()
  const { refreshAccessToken, logout } = useAuthApi()
  const router = useRouter()
  const refreshPromiseRef = useRef<Promise<RefreshAccessTokenResponse> | null>(null)
  const accessTokenRef = useRef<string | null>(accessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  useEffect(
    () => () => {
      refreshPromiseRef.current = null
    },
    []
  )

  const reAccessToken = useCallback(async (): Promise<RefreshAccessTokenResponse> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = refreshAccessToken()
    }

    try {
      return await refreshPromiseRef.current
    } finally {
      refreshPromiseRef.current = null
    }
  }, [refreshAccessToken])

  const apiClient = useMemo<AxiosInstance>(() => {
    const client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
      withCredentials: true
    })

    client.interceptors.request.use(
      (config) => {
        const headers = ensureAxiosHeaders(config.headers)
        const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData

        if (!isFormData && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }

        if (accessTokenRef.current) {
          headers.set('Authorization', `Bearer ${accessTokenRef.current}`)
        }

        config.headers = headers
        return config
      },
      (error) => Promise.reject(error)
    )

    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!axios.isAxiosError(error)) {
          return Promise.reject(error)
        }

        const originalRequest = error.config as RetryableRequestConfig | undefined
        const status = error.response?.status

        const pickNext = (): string => {
          const headerNext = readHeaderValue(originalRequest?.headers, 'X-Next-Url')
          const sessionNext =
            typeof window !== 'undefined' ? sessionStorage.getItem('NEXT_URL_OVERRIDE') : null
          const currentUrl = typeof window !== 'undefined' ? window.location.href : null

          return headerNext || sessionNext || currentUrl || '/'
        }

        if (status === 403) {
          try {
            alert('권한이 부족합니다.')
          } catch {
            // ignore
          }
          router.replace('/main')
          return Promise.reject(error)
        }

        if (status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const res = await reAccessToken()
            const newAccessToken = res.data.data.access_token

            if (!newAccessToken) {
              throw new Error('토큰 재발급에 실패했습니다.')
            }

            setAccessToken(newAccessToken)
            accessTokenRef.current = newAccessToken

            const headers = ensureAxiosHeaders(originalRequest.headers)
            headers.set('Authorization', `Bearer ${newAccessToken}`)
            originalRequest.headers = headers

            return client(originalRequest)
          } catch (refreshError) {
            const next = pickNext()
            try {
              alert('로그인이 만료되었습니다. 재로그인 해주세요.')
            } catch {
              // ignore
            }
            clearAuth()
            router.replace(`/login?next=${encodeURIComponent(next)}`)
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    return client
  }, [setAccessToken, clearAuth, router, reAccessToken])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error('로그아웃 handle 실패:', error)
    } finally {
      clearAuth()
      router.push('/login')
    }
  }, [logout, router, clearAuth])

  return { apiClient, handleLogout }
}
