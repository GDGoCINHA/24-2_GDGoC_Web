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
  readStoredUser,
  subscribeAuthStorage,
  writeStoredUser
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
  setUser: Dispatch<SetStateAction<AuthUser>>
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

  const setUser = useCallback<Dispatch<SetStateAction<AuthUser>>>((value) => {
    setUserState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      writeStoredUser(next)
      return next
    })
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

      try {
        const response = await requestAccessTokenRefresh()
        const data = unwrapApiResponse<RefreshResponseBody>(response.data)
        if (!alive) return
        if (data?.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        if (alive) {
          setUser(null)
        }
      }
    }

    void bootstrap()
    return () => {
      alive = false
    }
  }, [setUser, pathname])

  const clearAuth = useCallback(() => {
    setUser(null)
  }, [setUser])

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
