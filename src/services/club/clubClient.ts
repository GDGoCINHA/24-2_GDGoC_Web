import axios, { type AxiosInstance } from 'axios'

import type {
  ClubCategory,
  ClubDetail,
  ClubMember,
  ClubRecruitStatus,
  ClubStatus,
  ClubSummary,
  MyClub
} from '@/types/club'
import type { PageMeta, PagedResult } from '@/utils/api/unwrapPaged'

/**
 * 소모임 A 담당 API (소모임·멤버·개설 승인). 서버 `inha.gdgoc.domain.club.{club,member}`.
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
  /** 운영진만 통한다(승인 대기 목록). 일반 부원에게는 서버가 무시하고 공개 소모임만 준다. */
  status?: ClubStatus
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
/** 승인 전(대기·반려) 소모임만 리더가 지운다. 공개된 소모임이면 서버가 409. */
export const deleteClub = async (apiClient: AxiosInstance, clubId: number): Promise<void> => {
  await apiClient.delete(`/clubs/${clubId}`)
}

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

/* ---------------- 운영진 ---------------- */

export const approveClub = async (apiClient: AxiosInstance, clubId: number): Promise<void> => {
  await apiClient.post(`/admin/clubs/${clubId}/approve`)
}

/** 공개된 소모임까지 딸린 기록과 함께 지운다. 되돌릴 수 없다. */
export const deleteClubByStaff = async (
  apiClient: AxiosInstance,
  clubId: number
): Promise<void> => {
  await apiClient.delete(`/admin/clubs/${clubId}`)
}

export const rejectClub = async (
  apiClient: AxiosInstance,
  clubId: number,
  reason: string | null
): Promise<void> => {
  await apiClient.post(`/admin/clubs/${clubId}/reject`, { reason })
}
