import type { AxiosInstance } from 'axios'

import type { ClubActivityDetail, ClubActivityRoster } from '@/types/club'

/**
 * 소모임 B 담당 API — 활동 기록(인증). 서버 `inha.gdgoc.domain.club.activity`.
 *
 * 명단은 서버가 활동일로 정한다. 제출할 때는 출석한 사람의 id 만 보낸다.
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/** 활동 사진 업로드용 S3 키. 서버 `S3KeyType.clubActivity`. */
export const ACTIVITY_PHOTO_S3_KEY = 'clubActivity'

export interface ClubActivityPayload {
  /** YYYY-MM-DD */
  activityDate: string
  scheduleId: number | null
  photoUrls: string[]
  content: string
  attendedUserIds: number[]
  progressNote: string | null
}

export const fetchActivityRoster = async (
  apiClient: AxiosInstance,
  clubId: number,
  date: string,
  scheduleId?: number | null
): Promise<ClubActivityRoster> =>
  unwrapOnce<ClubActivityRoster>(
    (
      await apiClient.get(`/clubs/${clubId}/activities/roster`, {
        params: { date, scheduleId: scheduleId ?? undefined }
      })
    ).data
  )

export const fetchActivity = async (
  apiClient: AxiosInstance,
  clubId: number,
  activityId: number
): Promise<ClubActivityDetail> =>
  unwrapOnce<ClubActivityDetail>(
    (await apiClient.get(`/clubs/${clubId}/activities/${activityId}`)).data
  )

/** 새 기록의 id 를 돌려준다. */
export const createActivity = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: ClubActivityPayload
): Promise<number> =>
  unwrapOnce<number>((await apiClient.post(`/clubs/${clubId}/activities`, payload)).data)

/** 인증 완료된 기록이면 서버가 409 를 준다. */
export const updateActivity = async (
  apiClient: AxiosInstance,
  clubId: number,
  activityId: number,
  payload: ClubActivityPayload
): Promise<void> => {
  await apiClient.patch(`/clubs/${clubId}/activities/${activityId}`, payload)
}
