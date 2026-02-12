'use client'

import axios, { type AxiosResponse } from 'axios'

const AUTH_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_API_URL ?? ''}/auth`

export interface AuthUserPayload {
  id?: number
  name?: string
  email?: string
  userRole?: string
  team?: string | null
  membershipStatus?: string
  image?: string | null
}

export interface LoginExistingUserResponse {
  isNewUser: false
  accessToken: string
  refreshToken: string
  user: AuthUserPayload | null
}

export interface LoginNewUserResponse {
  isNewUser: true
  oauthSubject: string
  email: string
  name: string
  picture?: string
}

export type LoginApiResponseBody = LoginExistingUserResponse | LoginNewUserResponse

export interface SignupRequestPayload {
  oauthSubject: string
  email: string
  name: string
  studentId: string
  phoneNumber: string
  major: string
  image?: string
}

export interface SignupResponseBody {
  accessToken: string
  refreshToken: string
  role?: string
  membershipStatus?: string
  user?: AuthUserPayload | null
}

export interface RefreshResponseBody {
  data?: Record<string, unknown>
  accessToken: string
  user?: AuthUserPayload | null
}

export interface DuplicateCheckResponseBody {
  isExists: boolean
}

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

const defaultHeaders = { 'Content-Type': 'application/json' } as const
const defaultConfig = {
  headers: defaultHeaders,
  withCredentials: true
} as const

export const loginWithGoogleIdToken = (
  idToken: string
): Promise<AxiosResponse<LoginApiResponseBody>> =>
  axios.post(
    `${AUTH_BASE_URL}/login`,
    { idToken },
    {
      ...defaultConfig
    }
  )

export const signupWithProfile = (
  payload: SignupRequestPayload
): Promise<AxiosResponse<SignupResponseBody>> =>
  axios.post(`${AUTH_BASE_URL}/signup`, payload, {
    ...defaultConfig
  })

export const requestAccessTokenRefresh = (
  refreshToken: string
): Promise<AxiosResponse<RefreshResponseBody>> =>
  axios.post(
    `${AUTH_BASE_URL}/refresh`,
    { refreshToken },
    {
      ...defaultConfig
    }
  )

export const requestLogout = (refreshToken?: string): Promise<AxiosResponse<void>> =>
  axios.post(
    `${AUTH_BASE_URL}/logout`,
    { refreshToken },
    {
      withCredentials: true,
      headers: defaultHeaders
    }
  )

export const checkStudentIdDuplicated = (
  studentId: string
): Promise<AxiosResponse<ApiEnvelope<DuplicateCheckResponseBody>>> =>
  axios.post(
    `${AUTH_BASE_URL}/check/student-id`,
    { studentId },
    {
      ...defaultConfig
    }
  )

export const checkPhoneNumberDuplicated = (
  phoneNumber: string
): Promise<AxiosResponse<ApiEnvelope<DuplicateCheckResponseBody>>> =>
  axios.post(
    `${AUTH_BASE_URL}/check/phone-number`,
    { phoneNumber },
    {
      ...defaultConfig
    }
  )
