import axios, { type AxiosInstance } from 'axios'

import type {
  ClubCategory,
  ClubDetail,
  ClubLeaderGrant,
  ClubMember,
  ClubOpenRequest,
  ClubOpenRequestStatus,
  ClubRecruitStatus,
  ClubSummary,
  MyClub
} from '@/types/club'
import type { PageMeta, PagedResult } from '@/utils/api/unwrapPaged'

/**
 * 소모임 A 담당 API (소모임·멤버·리더 권한). 서버 `inha.gdgoc.domain.club.{club,member,leader}`.
 *
 * 목록은 data 가 Page 가 아니라 배열이고 페이지 정보는 meta 에 있다 — unwrapPaged 를 쓰지 않는다.
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/** 서버 ErrorCode 메시지가 있으면 그대로 보여 준다. */
export const readClubError = (err: unknown, fallback = '요청을 처리하지 못했어요.'): string => {
  if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
    return err.response.data.message
  }
  return fallback
}

/* ---------------- 소모임 ---------------- */

export interface ClubSearchParams {
  category?: ClubCategory
  recruitStatus?: ClubRecruitStatus
  keyword?: string
  page?: number
  size?: number
}

export const fetchClubs = async (
  apiClient: AxiosInstance,
  params: ClubSearchParams
): Promise<PagedResult<ClubSummary>> => {
  const response = await apiClient.get('/clubs', { params })
  const body = response.data as { data: ClubSummary[]; meta: PageMeta }
  return { items: body.data, meta: body.meta }
}

export const fetchMyClubs = async (apiClient: AxiosInstance): Promise<MyClub[]> =>
  unwrapOnce<MyClub[]>((await apiClient.get('/clubs/me')).data)

export const fetchClubDetail = async (
  apiClient: AxiosInstance,
  clubId: number
): Promise<ClubDetail> => unwrapOnce<ClubDetail>((await apiClient.get(`/clubs/${clubId}`)).data)

export interface ClubSavePayload {
  name: string
  category: ClubCategory
  summary: string
  description: string | null
  activityMethod: string | null
  imageUrl: string | null
  kakaoLink: string | null
  capacity: number | null
  startDate: string | null
  endDate: string | null
}

export const createClub = async (
  apiClient: AxiosInstance,
  payload: ClubSavePayload
): Promise<number> => unwrapOnce<number>((await apiClient.post('/clubs', payload)).data)

/** 수정 화면 저장. 보낸 값으로 통째로 바꾼다 — null 이면 비운다. 모집 상태는 건드리지 않는다. */
export const replaceClub = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: ClubSavePayload
): Promise<void> => {
  await apiClient.put(`/clubs/${clubId}`, payload)
}

/** 부분 수정(모집 마감 등). null 인 항목은 서버가 그대로 둔다. */
export const updateClub = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: Partial<ClubSavePayload> & { recruitStatus?: ClubRecruitStatus }
): Promise<void> => {
  await apiClient.patch(`/clubs/${clubId}`, payload)
}

/* ---------------- 멤버 ---------------- */

export const applyClub = async (
  apiClient: AxiosInstance,
  clubId: number,
  message: string | null
): Promise<void> => {
  await apiClient.post(`/clubs/${clubId}/members`, { message })
}

/** 신청 중이면 취소, 참여 중이면 탈퇴. */
export const leaveClub = async (apiClient: AxiosInstance, clubId: number): Promise<void> => {
  await apiClient.delete(`/clubs/${clubId}/members/me`)
}

export const fetchClubMembers = async (
  apiClient: AxiosInstance,
  clubId: number
): Promise<ClubMember[]> =>
  unwrapOnce<ClubMember[]>((await apiClient.get(`/clubs/${clubId}/members`)).data)

export const fetchClubApplicants = async (
  apiClient: AxiosInstance,
  clubId: number
): Promise<ClubMember[]> =>
  unwrapOnce<ClubMember[]>((await apiClient.get(`/clubs/${clubId}/members/pending`)).data)

export const handleClubMember = async (
  apiClient: AxiosInstance,
  clubId: number,
  memberId: number,
  action: 'approve' | 'reject' | 'kick'
): Promise<void> => {
  await apiClient.post(`/clubs/${clubId}/members/${memberId}/${action}`)
}

export const handOverLeader = async (
  apiClient: AxiosInstance,
  clubId: number,
  userId: number
): Promise<void> => {
  await apiClient.post(`/clubs/${clubId}/leader`, { userId })
}

/* ---------------- 리더 권한·개설 신청 ---------------- */

export const fetchMyLeaderGrant = async (apiClient: AxiosInstance): Promise<boolean> =>
  unwrapOnce<{ hasGrant: boolean }>((await apiClient.get('/clubs/leader-grant/me')).data).hasGrant

export interface ClubOpenRequestPayload {
  name: string
  category: ClubCategory
  summary: string
  goal: string | null
}

export const createOpenRequest = async (
  apiClient: AxiosInstance,
  payload: ClubOpenRequestPayload
): Promise<void> => {
  await apiClient.post('/club-open-requests', payload)
}

export const fetchMyOpenRequests = async (apiClient: AxiosInstance): Promise<ClubOpenRequest[]> =>
  unwrapOnce<ClubOpenRequest[]>((await apiClient.get('/club-open-requests/me')).data)

/* ---------------- 운영진 ---------------- */

export const fetchOpenRequests = async (
  apiClient: AxiosInstance,
  status?: ClubOpenRequestStatus
): Promise<ClubOpenRequest[]> =>
  unwrapOnce<ClubOpenRequest[]>(
    (await apiClient.get('/admin/club-open-requests', { params: { status } })).data
  )

export const approveOpenRequest = async (apiClient: AxiosInstance, id: number): Promise<void> => {
  await apiClient.post(`/admin/club-open-requests/${id}/approve`)
}

export const rejectOpenRequest = async (
  apiClient: AxiosInstance,
  id: number,
  reason: string | null
): Promise<void> => {
  await apiClient.post(`/admin/club-open-requests/${id}/reject`, { reason })
}

export const fetchLeaderGrants = async (apiClient: AxiosInstance): Promise<ClubLeaderGrant[]> =>
  unwrapOnce<ClubLeaderGrant[]>((await apiClient.get('/admin/club-leader-grants')).data)

export const grantLeader = async (apiClient: AxiosInstance, userId: number): Promise<void> => {
  await apiClient.post('/admin/club-leader-grants', { userId })
}

export const revokeLeader = async (apiClient: AxiosInstance, userId: number): Promise<void> => {
  await apiClient.delete(`/admin/club-leader-grants/${userId}`)
}
