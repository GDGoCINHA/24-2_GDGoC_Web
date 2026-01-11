'use client'

import { createContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

export type AuthUser = Record<string, unknown> | null

export interface AuthContextValue {
  accessToken: string | null
  setAccessToken: Dispatch<SetStateAction<string | null>>
  user: AuthUser
  setUser: Dispatch<SetStateAction<AuthUser>>
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser>(null)

  const clearAuth = () => {
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, user, setUser, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
