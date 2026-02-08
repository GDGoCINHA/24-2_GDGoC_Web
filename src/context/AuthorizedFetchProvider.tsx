'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { type AuthorizedFetcher } from '@/lib/api/authorizedFetch'

const AuthorizedFetchContext = createContext<AuthorizedFetcher | null>(null)

interface AuthorizedFetchProviderProps {
  fetcher: AuthorizedFetcher
  children: ReactNode
}

export const AuthorizedFetchProvider = ({
  fetcher,
  children
}: AuthorizedFetchProviderProps) => (
  <AuthorizedFetchContext.Provider value={fetcher}>
    {children}
  </AuthorizedFetchContext.Provider>
)

export const useAuthorizedFetch = (): AuthorizedFetcher => {
  const fetcher = useContext(AuthorizedFetchContext)
  if (!fetcher) {
    throw new Error('useAuthorizedFetch must be used within an AuthorizedFetchProvider')
  }
  return fetcher
}
