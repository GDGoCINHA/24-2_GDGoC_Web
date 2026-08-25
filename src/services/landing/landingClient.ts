import type { AxiosInstance } from 'axios'

import { publicClient } from '@/lib/api/publicClient'
import type { LandingContentDocument } from '@/types/landing'
import type { RecruitType, RecruitPeriodAdmin } from '@/types/landing.admin'

/**
 * 응답을 한 겹만 벗긴다. 공용 `unwrapApiResponse` 는 쓰지 않는다 — 문서 안에 'content' 나
 * 'data' 라는 이름이 생기면 래퍼로 오인해 엉뚱한 조각만 돌려준다 (unwrap.ts 참고).
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/**
 * 방문자가 보는 발행본.
 *
 * 발행된 게 없으면 `null` 이다 — 오류가 아니라 아직 아무것도 발행하지 않은 정상 상태이고,
 * 그때는 부르는 쪽이 번들에 든 기본값을 그대로 쓴다.
 */
export const fetchLandingContent = async (): Promise<LandingContentDocument | null> => {
  const response = await publicClient.get('/landing-content')
  return unwrapOnce<LandingContentDocument | null>(response.data) ?? null
}

/** 관리자가 편집 중인 초안. 초안이 없으면 서버가 발행본을 준다. */
export const fetchLandingDraft = async (
  apiClient: AxiosInstance
): Promise<LandingContentDocument | null> => {
  const response = await apiClient.get('/admin/landing-content')
  return unwrapOnce<LandingContentDocument | null>(response.data) ?? null
}

export const saveLandingDraft = async (
  apiClient: AxiosInstance,
  document: LandingContentDocument
): Promise<void> => {
  await apiClient.put('/admin/landing-content', document)
}

export const publishLandingContent = async (apiClient: AxiosInstance): Promise<void> => {
  await apiClient.post('/admin/landing-content/publish')
}

export const fetchRecruitPeriod = async (
  apiClient: AxiosInstance,
  recruitType: RecruitType
): Promise<RecruitPeriodAdmin> => {
  const response = await apiClient.get(`/admin/recruit/${recruitType}/period`)
  return unwrapOnce<RecruitPeriodAdmin>(response.data)
}

export const updateRecruitPeriod = async (
  apiClient: AxiosInstance,
  recruitType: RecruitType,
  payload: { openAt: string; closeAt: string }
): Promise<RecruitPeriodAdmin> => {
  const response = await apiClient.put(`/admin/recruit/${recruitType}/period`, payload)
  return unwrapOnce<RecruitPeriodAdmin>(response.data)
}

/** 저장한 기간을 지운다. 지우면 서버 설정값으로 돌아간다. */
export const clearRecruitPeriod = async (
  apiClient: AxiosInstance,
  recruitType: RecruitType
): Promise<RecruitPeriodAdmin> => {
  const response = await apiClient.delete(`/admin/recruit/${recruitType}/period`)
  return unwrapOnce<RecruitPeriodAdmin>(response.data)
}
