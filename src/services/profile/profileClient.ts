import type { AxiosInstance } from 'axios'

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
 * 지원 이력이 없으면 null을 돌려준다 — 정상 상태이며 에러가 아니다.
 */
export const fetchMyCoreApplication = async (
  apiClient: AxiosInstance
): Promise<MyCoreApplication | null> => {
  try {
    const response = await apiClient.get<MyCoreApplication>('/recruit/core/applications/me')
    return response.data ?? null
  } catch {
    return null
  }
}
