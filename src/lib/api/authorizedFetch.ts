'use client'

import { ACCESS_TOKEN_KEY, readStoredString } from '@/lib/auth/storage'

export type AuthorizedFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>

interface FetchContext {
  input: RequestInfo | URL
  init?: RequestInit
}

export interface AuthorizedFetchOptions {
  baseURL?: string
  clearAuth: () => void
  requestAccessTokenRefresh: () => Promise<void>
  onForbidden?: (response: Response, ctx: FetchContext) => void
  onUnauthorized?: (response: Response | unknown, ctx: FetchContext) => void
}

const isAbsoluteUrl = (value: string): boolean => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)

const resolveUrl = (
  input: RequestInfo | URL,
  baseURL?: string
): RequestInfo | URL => {
  if (!baseURL || typeof input !== 'string') {
    return input
  }
  if (isAbsoluteUrl(input) || input.startsWith('//')) {
    return input
  }
  const normalizedBase = baseURL.replace(/\/+$/, '')
  const normalizedPath = input.replace(/^\/+/, '')
  return `${normalizedBase}/${normalizedPath}`
}

const cloneInit = (init?: RequestInit): RequestInit & { headers: Headers } => {
  const headers = new Headers(init?.headers)
  return {
    ...init,
    headers
  }
}

const makeRequest = (
  input: RequestInfo | URL,
  init: RequestInit & { headers: Headers }
): { target: RequestInfo | URL; options: RequestInit } => {
  return {
    target: input,
    options: {
      ...init,
      credentials: init.credentials ?? 'include'
    }
  }
}

const buildError = (response: Response): Error => {
  const err = new Error(`Request failed with status ${response.status}`)
  return err
}

export const createAuthorizedFetch = ({
  baseURL,
  clearAuth,
  requestAccessTokenRefresh,
  onForbidden,
  onUnauthorized
}: AuthorizedFetchOptions): AuthorizedFetcher => {
  return async (input, init) => {
    const resolvedInput = resolveUrl(input, baseURL)
    const context: FetchContext = { input, init }

    const dispatch = async (): Promise<Response> => {
      const requestInit = cloneInit(init)
      const accessToken = readStoredString(ACCESS_TOKEN_KEY)

      if (accessToken && !requestInit.headers.has('Authorization')) {
        requestInit.headers.set('Authorization', `Bearer ${accessToken}`)
      }

      const { target, options } = makeRequest(resolvedInput, requestInit)
      return fetch(target, options)
    }

    let response = await dispatch()

    if (response.status === 401) {
      try {
        await requestAccessTokenRefresh()
        response = await dispatch()
      } catch (refreshError) {
        clearAuth()
        onUnauthorized?.(refreshError, context)
        throw refreshError
      }
    }

    if (response.status === 403) {
      onForbidden?.(response, context)
      throw buildError(response)
    }

    if (response.status === 401) {
      clearAuth()
      onUnauthorized?.(response, context)
      throw buildError(response)
    }

    return response
  }
}
