import axios, { type AxiosInstance } from 'axios'

import type {
  MyCoreApplication,
  MyCoreApplicationDetail,
  MyMemberApplication,
  UpdateProfilePayload,
  UserProfile
} from '@/types/profile'
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

/**
 * 운영진 지원서 상세. 목록 응답(fetchMyCoreApplication)에는 문항 답변이 없다.
 *
 * 본인/운영진만 열 수 있으며 서버가 판정한다. 본인이 볼 때는 검토 메모가 빠져서 온다.
 * 이 엔드포인트도 ApiResponse 래퍼 없이 DTO 를 직접 반환한다.
 */
export const fetchMyCoreApplicationDetail = async (
  apiClient: AxiosInstance,
  applicationId: number
): Promise<MyCoreApplicationDetail> => {
  const response = await apiClient.get<MyCoreApplicationDetail>(
    `/recruit/core/applications/${applicationId}`
  )
  return response.data
}

/**
 * 부원 지원서 조회.
 * 서버가 로그인 계정의 이메일로 이번 학기 지원서를 찾는다. 이메일이 어긋나면 학번+이름으로 한 번 더 본다 —
 * 로그인 필수로 바뀌기 전에는 폼에 이메일을 직접 적었기 때문이다.
 * 404(지원 이력 없음)면 null 을 반환하고, 그 외 에러는 호출자에게 던진다.
 */
export const fetchMyMemberApplication = async (
  apiClient: AxiosInstance
): Promise<MyMemberApplication | null> => {
  try {
    const response = await apiClient.get('/recruit/member/applications/me')
    return unwrapApiResponse<MyMemberApplication>(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}
