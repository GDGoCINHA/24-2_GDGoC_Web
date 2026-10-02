import type { AxiosInstance } from 'axios'

import type { ClubCheckinResult, ClubCheckinToken, ClubRsvp, ClubSchedule } from '@/types/club'

/**
 * 소모임 B 담당 API — 일정·참석 응답·QR 체크인. 서버 `inha.gdgoc.domain.club.schedule`.
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

export type ClubScheduleScope = 'upcoming' | 'past'

export interface ClubSchedulePayload {
  title: string
  /** ISO 시각 */
  startsAt: string
  location: string | null
  onlineLink: string | null
  description: string | null
}

/** 다가오는 일정은 가까운 순, 지난 일정은 최근 순. 오늘 일정은 하루 동안 다가오는 쪽에 있다. */
export const fetchSchedules = async (
  apiClient: AxiosInstance,
  clubId: number,
  scope: ClubScheduleScope
): Promise<ClubSchedule[]> =>
  unwrapOnce<ClubSchedule[]>(
    (await apiClient.get(`/clubs/${clubId}/schedules`, { params: { scope } })).data
  )

export const createSchedule = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: ClubSchedulePayload
): Promise<number> =>
  unwrapOnce<number>((await apiClient.post(`/clubs/${clubId}/schedules`, payload)).data)

export const updateSchedule = async (
  apiClient: AxiosInstance,
  clubId: number,
  scheduleId: number,
  payload: ClubSchedulePayload
): Promise<void> => {
  await apiClient.patch(`/clubs/${clubId}/schedules/${scheduleId}`, payload)
}

/** 연결된 활동 기록은 남고 연결만 끊긴다. */
export const deleteSchedule = async (
  apiClient: AxiosInstance,
  clubId: number,
  scheduleId: number
): Promise<void> => {
  await apiClient.delete(`/clubs/${clubId}/schedules/${scheduleId}`)
}

/** 참석 예정·불참 예정. 실제 출석과 무관하다. */
export const respondSchedule = async (
  apiClient: AxiosInstance,
  scheduleId: number,
  response: ClubRsvp
): Promise<void> => {
  await apiClient.put(`/club-schedules/${scheduleId}/rsvp`, { response })
}

export const fetchCheckinToken = async (
  apiClient: AxiosInstance,
  scheduleId: number
): Promise<ClubCheckinToken> =>
  unwrapOnce<ClubCheckinToken>(
    (await apiClient.get(`/club-schedules/${scheduleId}/checkin-token`)).data
  )

export const checkInSchedule = async (
  apiClient: AxiosInstance,
  token: string
): Promise<ClubCheckinResult> =>
  unwrapOnce<ClubCheckinResult>((await apiClient.post('/club-checkin', { token })).data)
