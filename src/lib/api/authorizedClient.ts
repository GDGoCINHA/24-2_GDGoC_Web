'use client'

import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig
} from 'axios'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export type AuthorizedRequestConfig = RetryableRequestConfig

const ensureAxiosHeaders = (
  headers?: InternalAxiosRequestConfig['headers']
): AxiosHeaders => {
  if (headers instanceof AxiosHeaders) {
    return headers
  }
  return new AxiosHeaders(headers)
}

export interface AuthorizedClientOptions {
  baseURL?: string
  clearAuth: () => void
  requestAccessTokenRefresh: () => Promise<void>
  onForbidden?: (error: unknown, ctx: { originalRequest?: RetryableRequestConfig }) => void
  onUnauthorized?: (error: unknown, ctx: { originalRequest?: RetryableRequestConfig }) => void
}

export const createAuthorizedClient = ({
  baseURL,
  clearAuth,
  requestAccessTokenRefresh,
  onForbidden,
  onUnauthorized
}: AuthorizedClientOptions): AxiosInstance => {
  const client = axios.create({
    baseURL,
    withCredentials: true
  })

  client.interceptors.request.use(
    async (config) => {
      const headers = ensureAxiosHeaders(config.headers)
      const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData

      if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
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

      if (status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          await requestAccessTokenRefresh()
          return client(originalRequest)
        } catch (refreshError) {
          clearAuth()
          onUnauthorized?.(refreshError, { originalRequest })
          return Promise.reject(refreshError)
        }
      }

      if (status === 403) {
        onForbidden?.(error, { originalRequest })
      } else if (status === 401) {
        clearAuth()
        onUnauthorized?.(error, { originalRequest })
      }

      return Promise.reject(error)
    }
  )

  return client
}
