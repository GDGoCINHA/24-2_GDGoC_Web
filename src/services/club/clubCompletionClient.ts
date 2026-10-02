import type { AxiosInstance } from 'axios'

import type {
  AdminClubRow,
  ClubActivityStatus,
  ClubComment,
  ClubCompletion,
  ClubCompletionStatus,
  ClubLikeResult,
  ClubReviewItem,
  ClubTargetType,
  ClubTerm,
  ClubWarning,
  ClubWeek,
  ClubWeekState
} from '@/types/club'

/**
 * 소모임 C 담당 API (기수·목표·쉬는 주·완주·검토·현황·좋아요·댓글).
 * 서버 `inha.gdgoc.domain.club.{term,completion,review,export,reaction}`.
 *
 * `unwrapApiResponse` 는 쓰지 않는다 — 검토 항목·댓글에 `content` 필드가 있어 한 겹 더 벗겨진다.
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/* ---------------- 기수 ---------------- */

export const fetchClubTerms = async (apiClient: AxiosInstance): Promise<ClubTerm[]> =>
  unwrapOnce<ClubTerm[]>((await apiClient.get('/club-terms')).data)

export const createClubTerm = async (
  apiClient: AxiosInstance,
  payload: { name: string; attendanceRatio: number }
): Promise<ClubTerm> =>
  unwrapOnce<ClubTerm>((await apiClient.post('/admin/club-terms', payload)).data)

export const updateClubTerm = async (
  apiClient: AxiosInstance,
  termId: number,
  payload: { name?: string; attendanceRatio?: number }
): Promise<ClubTerm> =>
  unwrapOnce<ClubTerm>((await apiClient.patch(`/admin/club-terms/${termId}`, payload)).data)

/* ---------------- 목표·쉬는 주·완주 ---------------- */

export const fetchClubCompletion = async (
  apiClient: AxiosInstance,
  clubId: number
): Promise<ClubCompletion> =>
  unwrapOnce<ClubCompletion>((await apiClient.get(`/clubs/${clubId}/completion`)).data)

/** 목록을 통째로 저장한다. 아무 요일이나 보내도 서버가 그 주 월요일로 맞춘다. */
export const saveRestWeeks = async (
  apiClient: AxiosInstance,
  clubId: number,
  weeks: string[]
): Promise<string[]> =>
  unwrapOnce<string[]>((await apiClient.put(`/clubs/${clubId}/rest-weeks`, { weeks })).data)

export const saveClubGoal = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: { goal: string; goalCriteria: string | null }
): Promise<void> => {
  await apiClient.put(`/clubs/${clubId}/goal`, payload)
}

export const submitClubGoalResult = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: { goalResult: string; evidenceUrls: string[] }
): Promise<void> => {
  await apiClient.put(`/clubs/${clubId}/goal-result`, payload)
}

export const judgeClubGoal = async (
  apiClient: AxiosInstance,
  clubId: number,
  status: 'ACHIEVED' | 'NOT_ACHIEVED'
): Promise<void> => {
  await apiClient.post(`/admin/clubs/${clubId}/goal-status`, { status })
}

export const confirmClubCompletion = async (
  apiClient: AxiosInstance,
  clubId: number,
  status: Exclude<ClubCompletionStatus, 'IN_PROGRESS'>,
  memo: string | null
): Promise<void> => {
  await apiClient.post(`/admin/clubs/${clubId}/completion`, { status, memo })
}

/**
 * 운영진의 활동 기간 수정. A 의 `PATCH /admin/clubs/{id}` 를 쓴다 — 기간은 소모임 컬럼이다.
 * 서버는 null 을 「그대로 둠」으로 보므로 기간을 비울 수는 없다.
 */
export const updateClubPeriodByStaff = async (
  apiClient: AxiosInstance,
  clubId: number,
  startDate: string,
  endDate: string
): Promise<void> => {
  await apiClient.patch(`/admin/clubs/${clubId}`, { club: { startDate, endDate } })
}

/* ---------------- 인증 검토 ---------------- */

export const fetchReviewQueue = async (
  apiClient: AxiosInstance,
  params: { status?: ClubActivityStatus; clubId?: number } = {}
): Promise<ClubReviewItem[]> =>
  unwrapOnce<ClubReviewItem[]>((await apiClient.get('/admin/club-activities', { params })).data)

export const approveActivity = async (apiClient: AxiosInstance, activityId: number) => {
  await apiClient.post(`/admin/club-activities/${activityId}/approve`)
}

export const requestActivityRevision = async (
  apiClient: AxiosInstance,
  activityId: number,
  reason: string
) => {
  await apiClient.post(`/admin/club-activities/${activityId}/request-revision`, { reason })
}

/* ---------------- 운영진 현황 ---------------- */

/** `warning`: 비우면 전체, 'ANY' 면 경고 있는 팀. */
export const fetchAdminClubs = async (
  apiClient: AxiosInstance,
  params: { termId?: number; warning?: 'ANY' | ClubWarning } = {}
): Promise<AdminClubRow[]> =>
  unwrapOnce<AdminClubRow[]>((await apiClient.get('/admin/clubs', { params })).data)

/** CSV 는 ApiResponse 로 감싸지 않는 파일 응답이라 blob 으로 받는다. */
export const downloadAdminClubsCsv = async (
  apiClient: AxiosInstance,
  termId?: number
): Promise<Blob> =>
  (await apiClient.get('/admin/clubs/export', { params: { termId }, responseType: 'blob' }))
    .data as Blob

/* ---------------- 좋아요·댓글 ---------------- */

export const setClubLike = async (
  apiClient: AxiosInstance,
  targetType: ClubTargetType,
  targetId: number,
  liked: boolean
): Promise<ClubLikeResult> => {
  const url = `/club-reactions/${targetType}/${targetId}/like`
  const response = liked ? await apiClient.put(url) : await apiClient.delete(url)
  return unwrapOnce<ClubLikeResult>(response.data)
}

export const fetchClubComments = async (
  apiClient: AxiosInstance,
  targetType: ClubTargetType,
  targetId: number
): Promise<ClubComment[]> =>
  unwrapOnce<ClubComment[]>(
    (await apiClient.get(`/club-reactions/${targetType}/${targetId}/comments`)).data
  )

export const createClubComment = async (
  apiClient: AxiosInstance,
  targetType: ClubTargetType,
  targetId: number,
  content: string
): Promise<number> =>
  unwrapOnce<number>(
    (await apiClient.post(`/club-reactions/${targetType}/${targetId}/comments`, { content })).data
  )

export const deleteClubComment = async (apiClient: AxiosInstance, commentId: number) => {
  await apiClient.delete(`/club-comments/${commentId}`)
}

/* ---------------- 화면 계산 ---------------- */

/** 오늘(한국 날짜)이 속한 주의 월요일, `YYYY-MM-DD`. */
export const thisMonday = (now: Date = new Date()): string => {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const day = kst.getUTCDay() // 0 = 일
  kst.setUTCDate(kst.getUTCDate() - ((day + 6) % 7))
  return kst.toISOString().slice(0, 10)
}

/** 아무 날짜(`YYYY-MM-DD`)를 그 주 월요일로. 쉬는 주 체크를 바로 표에 반영할 때 쓴다. */
export const mondayOf = (date: string): string => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

/**
 * 칸 색. 서버가 정한 `satisfied` 를 그대로 따르고, 판정이 안 났거나 놓친 주에 검토 대기 기록이 있으면
 * 「검토 중」으로 보여 준다 — 리더가 왜 아직 미충족인지 알게.
 */
export const weekStateOf = (week: ClubWeek, monday: string = thisMonday()): ClubWeekState => {
  if (week.rest) return 'REST'
  if (week.satisfied === true) return 'SATISFIED'
  if (week.activities.some((a) => a.status === 'PENDING')) return 'PENDING_REVIEW'
  if (week.satisfied === false) return 'MISSED'
  return week.weekStart === monday ? 'CURRENT' : 'UPCOMING'
}

/** `2026-10-05` → `10.05` */
export const shortDate = (date: string | null): string =>
  date ? date.slice(5).replace('-', '.') : '—'
