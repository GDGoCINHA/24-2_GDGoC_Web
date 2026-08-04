'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosHeaders, type AxiosHeaderValue, type InternalAxiosRequestConfig } from 'axios'

import { createAuthorizedClient, type AuthorizedRequestConfig } from '@/lib/api/authorizedClient'
import { createAuthorizedFetch } from '@/lib/api/authorizedFetch'
import { useAuth } from '@/hooks/useAuth'
import { useAuthApi } from '@/hooks/useAuthApi'
import { type RefreshResponseBody } from '@/services/auth/authClient'
import { unwrapApiResponse } from '@/utils/api/unwrap'

const headerValueToString = (value: AxiosHeaderValue | null | undefined): string | undefined => {
  if (value === undefined || value === null || value === false) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(String).join(', ')
  if (value instanceof AxiosHeaders) return value.toString()
  return String(value)
}

const readAxiosHeaderValue = (
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

const readFetchHeaderValue = (headers?: HeadersInit, key?: string): string | undefined => {
  if (!headers || !key) return undefined
  try {
    const normalized = new Headers(headers)
    return normalized.get(key) ?? undefined
  } catch {
    return undefined
  }
}

type UnauthorizedContext =
  | { originalRequest?: AuthorizedRequestConfig }
  | { init?: RequestInit }
  | undefined

const resolveInternalPath = (raw?: string | null): string | null => {
  if (!raw) return null

  try {
    const decoded = decodeURIComponent(raw)
    if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded

    if (typeof window !== 'undefined') {
      const parsed = new URL(decoded, window.location.origin)
      if (parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`
      }
    }
  } catch {
    return null
  }

  return null
}

const getCurrentInternalPath = (): string | null => {
  if (typeof window === 'undefined') return null
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

const resolveNextUrl = (ctx?: UnauthorizedContext): string => {
  let headerNext: string | undefined
  if (ctx && 'originalRequest' in ctx) {
    headerNext = readAxiosHeaderValue(ctx.originalRequest?.headers, 'X-Next-Url')
  } else if (ctx && 'init' in ctx) {
    headerNext = readFetchHeaderValue(ctx.init?.headers, 'X-Next-Url')
  }

  const sessionNext =
    typeof window !== 'undefined' ? sessionStorage.getItem('NEXT_URL_OVERRIDE') : null
  return (
    resolveInternalPath(headerNext) ||
    resolveInternalPath(sessionNext) ||
    getCurrentInternalPath() ||
    '/'
  )
}

export const useAuthenticatedApi = () => {
  const { setUser, clearAuth } = useAuth()
  const { refreshAccessToken, logout } = useAuthApi()
  const router = useRouter()
  const refreshPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(
    () => () => {
      refreshPromiseRef.current = null
    },
    []
  )

  const requestAccessTokenRefresh = useCallback(async (): Promise<void> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = refreshAccessToken()
        .then((response) => {
          const data = unwrapApiResponse<RefreshResponseBody>(response.data)
          if (data?.user && data.accessToken) {
            setUser(data.user, data.accessToken)
          }
        })
        .finally(() => {
          refreshPromiseRef.current = null
        })
    }

    await refreshPromiseRef.current
  }, [refreshAccessToken, setUser])

  const handleForbidden = useCallback(
    (_payload?: unknown, _ctx?: unknown) => {
      try {
        alert('권한이 부족합니다.')
      } catch {
        // ignore
      }
      router.replace('/')
    },
    [router]
  )

  const handleUnauthorized = useCallback(
    (_payload?: unknown, ctx?: UnauthorizedContext) => {
      const next = resolveNextUrl(ctx)
      try {
        alert('로그인이 만료되었습니다. 재로그인 해주세요.')
      } catch {
        // ignore
      }
      clearAuth()
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    },
    [clearAuth, router]
  )

  const apiClient = useMemo(
    () =>
      createAuthorizedClient({
        baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
        clearAuth,
        requestAccessTokenRefresh,
        onForbidden: handleForbidden,
        onUnauthorized: handleUnauthorized
      }),
    [clearAuth, handleForbidden, handleUnauthorized, requestAccessTokenRefresh]
  )

  const authorizedFetch = useMemo(
    () =>
      createAuthorizedFetch({
        baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
        clearAuth,
        requestAccessTokenRefresh,
        onForbidden: handleForbidden,
        onUnauthorized: handleUnauthorized
      }),
    [clearAuth, handleForbidden, handleUnauthorized, requestAccessTokenRefresh]
  )

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

  return { apiClient, authorizedFetch, handleLogout }
}
