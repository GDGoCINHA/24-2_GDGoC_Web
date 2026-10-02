import type { AxiosInstance } from 'axios'

import type { ClubFixRequest, ClubFixRequestStatus, ClubMyAttendance } from '@/types/club'

/**
 * 소모임 B 담당 API — 내 출석·출석 수정 요청. 서버 `ClubAttendanceController`.
 *
 * 수락하면 출석이 요청한 값이 된다("반전" 이 아니다). 그 사이 리더가 고친 출석은 다시 뒤집히지 않는다.
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/** 이 소모임에서 내가 명단에 든 회차. 최근 회차부터. */
export const fetchMyAttendance = async (
  apiClient: AxiosInstance,
  clubId: number
): Promise<ClubMyAttendance[]> =>
  unwrapOnce<ClubMyAttendance[]>(
    (await apiClient.get(`/clubs/${clubId}/activities/my-attendance`)).data
  )

/** 본인 출석의 수정 요청. 바꿀 값은 서버가 정한다(지금과 반대). */
export const requestAttendanceFix = async (
  apiClient: AxiosInstance,
  activityId: number,
  reason: string
): Promise<number> =>
  unwrapOnce<number>(
    (await apiClient.post(`/club-activities/${activityId}/fix-requests`, { reason })).data
  )

export const fetchFixRequests = async (
  apiClient: AxiosInstance,
  clubId: number,
  status: ClubFixRequestStatus = 'PENDING'
): Promise<ClubFixRequest[]> =>
  unwrapOnce<ClubFixRequest[]>(
    (await apiClient.get(`/clubs/${clubId}/fix-requests`, { params: { status } })).data
  )

export const acceptFixRequest = async (
  apiClient: AxiosInstance,
  requestId: number
): Promise<void> => {
  await apiClient.post(`/club-fix-requests/${requestId}/accept`)
}

export const rejectFixRequest = async (
  apiClient: AxiosInstance,
  requestId: number
): Promise<void> => {
  await apiClient.post(`/club-fix-requests/${requestId}/reject`)
}
