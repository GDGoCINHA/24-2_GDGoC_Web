'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'
import { usePathname } from 'next/navigation'

import {
  USER_STORAGE_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  readStoredUser,
  subscribeAuthStorage,
  writeStoredUser,
  readStoredString,
  writeStoredString,
  clearStoredAuth
} from '@/lib/auth/storage'
import { requestAccessTokenRefresh, type RefreshResponseBody } from '@/services/auth/authClient'
import { unwrapApiResponse } from '@/utils/api/unwrap'

export interface AuthUser {
  id?: number
  name?: string
  email?: string
  userRole?: string
  team?: string | null
  membershipStatus?: string
  image?: string | null
}

export interface AuthContextValue {
  user: AuthUser
  setUser: (user: AuthUser, accessToken?: string, refreshToken?: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const pathname = usePathname()
  const [userState, setUserState] = useState<AuthUser>(() => readStoredUser<AuthUser>())

  useEffect(() => {
    if (typeof window === 'undefined') return
    return subscribeAuthStorage(({ key }) => {
      if (key === USER_STORAGE_KEY || key === null) {
        setUserState(readStoredUser<AuthUser>())
      }
    })
  }, [])

  const setUser = useCallback((user: AuthUser, accessToken?: string, refreshToken?: string) => {
    writeStoredUser(user)
    if (accessToken) writeStoredString(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) writeStoredString(REFRESH_TOKEN_KEY, refreshToken)
    setUserState(user)
  }, [])

  useEffect(() => {
    let alive = true

    const bootstrap = async () => {
      // Google OIDC implicit callback 처리 중(/login#id_token=...)에는
      // refresh 선호출을 건너뛰어 신규 유저 분기 응답 지연을 방지한다.
      if (
        pathname === '/login' &&
        typeof window !== 'undefined' &&
        window.location.hash.includes('id_token=')
      ) {
        return
      }

      const storedRt = readStoredString(REFRESH_TOKEN_KEY)
      if (!storedRt) {
        setUser(null)
        return
      }

      try {
        const response = await requestAccessTokenRefresh(storedRt)
        const data = unwrapApiResponse<RefreshResponseBody>(response.data)
        if (!alive) return

        // Support both camelCase and snake_case for token field
        const accessToken = data?.accessToken || (data as any)?.access_token

        if (data?.user && accessToken) {
          setUser(data.user, accessToken)
        } else {
          console.warn('[AuthProvider] Refresh response missing data', {
            hasUser: !!data?.user,
            hasToken: !!accessToken
          })
          clearAuth()
        }
      } catch (err) {
        if (alive) {
          console.error('[AuthProvider] Bootstrap refresh failed', err)
          clearAuth()
        }
      }
    }

    void bootstrap()
    return () => {
      alive = false
    }
  }, [setUser, pathname])

  const clearAuth = useCallback(() => {
    clearStoredAuth()
    setUserState(null)
  }, [])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: userState,
      setUser,
      clearAuth
    }),
    [userState, setUser, clearAuth]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContext
