import type { AxiosInstance } from 'axios'

import type {
  AttendType,
  ConsentPurpose,
  ConsentState,
  HomecomingApplication,
  HomecomingConsentEntry,
  HomecomingStatus,
  HomecomingSummary,
  HomecomingUpdatePayload
} from '@/types/homecoming'

/** response.data.data 를 한 겹만 벗긴다 (eventApplicationClient 주석 참고). */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

const BASE = '/admin/homecoming'

export const fetchHomecomingApplications = async (
  apiClient: AxiosInstance,
  params: { status?: HomecomingStatus; attendType?: AttendType } = {}
): Promise<HomecomingApplication[]> => {
  // 서버 enum 은 대문자 이름으로 받는다 (쿼리 파라미터는 JSON 변환을 타지 않는다).
  const response = await apiClient.get(`${BASE}/applications`, {
    params: {
      status: params.status || undefined,
      attendType: params.attendType ? params.attendType.toUpperCase() : undefined
    }
  })
  return unwrapOnce<HomecomingApplication[]>(response.data) ?? []
}

export const fetchHomecomingSummary = async (
  apiClient: AxiosInstance
): Promise<HomecomingSummary> => {
  const response = await apiClient.get(`${BASE}/summary`)
  return unwrapOnce<HomecomingSummary>(response.data)
}

export const updateHomecomingApplication = async (
  apiClient: AxiosInstance,
  id: number,
  payload: HomecomingUpdatePayload
): Promise<HomecomingApplication> => {
  const response = await apiClient.patch(`${BASE}/applications/${id}`, payload)
  return unwrapOnce<HomecomingApplication>(response.data)
}

export const cancelHomecomingApplication = async (
  apiClient: AxiosInstance,
  id: number,
  reason: string
): Promise<void> => {
  await apiClient.post(`${BASE}/applications/${id}/cancel`, { reason: reason || null })
}

export const fetchHomecomingConsents = async (
  apiClient: AxiosInstance,
  purpose: ConsentPurpose,
  state?: ConsentState
): Promise<HomecomingConsentEntry[]> => {
  const response = await apiClient.get(`${BASE}/consents`, {
    params: { purpose, state: state || undefined }
  })
  return unwrapOnce<HomecomingConsentEntry[]>(response.data) ?? []
}

export const withdrawHomecomingConsent = async (
  apiClient: AxiosInstance,
  id: number,
  purpose: ConsentPurpose
): Promise<void> => {
  await apiClient.post(`${BASE}/applications/${id}/consents/${purpose}/withdraw`)
}

/** CSV 는 ApiResponse 로 감싸지 않는 파일 응답이라 blob 으로 받는다. */
export const downloadHomecomingCsv = async (
  apiClient: AxiosInstance,
  kind: 'nametags' | 'applications'
): Promise<Blob> => {
  const response = await apiClient.get(`${BASE}/export/${kind}`, { responseType: 'blob' })
  return response.data as Blob
}
