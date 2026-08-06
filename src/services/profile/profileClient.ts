import axios, { type AxiosInstance } from 'axios'

import type { MyCoreApplication, UpdateProfilePayload, UserProfile } from '@/types/profile'
import { unwrapApiResponse } from '@/utils/api/unwrap'

export const fetchMyProfile = async (apiClient: AxiosInstance): Promise<UserProfile> => {
  const response = await apiClient.get('/users/me')
  return unwrapApiResponse<UserProfile>(response.data)
}

export const updateMyProfile = async (
  apiClient: AxiosInstance,
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  const response = await apiClient.patch('/users/me', payload)
  return unwrapApiResponse<UserProfile>(response.data)
}

export const updateMyProfileImage = async (
  apiClient: AxiosInstance,
  file: File
): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.patch('/users/me/image', formData)
  return unwrapApiResponse<{ image: string }>(response.data).image
}

/**
 * 운영진 지원서 조회.
 * 이 엔드포인트만 ApiResponse 래퍼 없이 DTO를 직접 반환하므로 unwrap을 타지 않는다.
 * 404(지원 이력 없음)면 null을 반환하고, 그 외 에러는 호출자에게 던진다.
 */
export const fetchMyCoreApplication = async (
  apiClient: AxiosInstance
): Promise<MyCoreApplication | null> => {
  try {
    const response = await apiClient.get<MyCoreApplication>('/recruit/core/applications/me')
    return response.data ?? null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}
