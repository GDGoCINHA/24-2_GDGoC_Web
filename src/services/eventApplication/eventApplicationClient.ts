import type { AxiosInstance } from 'axios'

import type {
  Applicant,
  AnswerEntry,
  ApplicationStatus,
  CheckinResult,
  CheckinToken,
  EventForm,
  EventFormSavePayload,
  EventAttendanceStatus,
  MyActivity,
  PublicEventForm,
  QuestionSavePayload
} from '@/types/eventApplication'
import { unwrapPaged, type PagedResult } from '@/utils/api/unwrapPaged'

/**
 * response.data.data 를 한 겹만 벗긴다.
 *
 * 공용 unwrapApiResponse 는 'content' 까지 래퍼로 보고 벗기기 때문에, 페이지 응답이나
 * content 필드를 가진 객체에서 엉뚱한 값을 돌려준다 (boardClient 주석 참고).
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/* ---------------- 운영진: 폼과 질문 ---------------- */

export const fetchEventForm = async (
  apiClient: AxiosInstance,
  eventBoardId: number
): Promise<EventForm> => {
  const response = await apiClient.get(`/admin/events/${eventBoardId}/form`)
  return unwrapOnce<EventForm>(response.data)
}

export const createEventForm = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  payload: EventFormSavePayload
): Promise<number> => {
  const response = await apiClient.post(`/admin/events/${eventBoardId}/form`, payload)
  return unwrapOnce<number>(response.data)
}

export const updateEventForm = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  payload: EventFormSavePayload
): Promise<void> => {
  await apiClient.put(`/admin/events/${eventBoardId}/form`, payload)
}

/** 부원에게 공개한다. 이 요청 전까지 행사 상세에는 신청 영역이 그려지지 않는다. */
export const publishEventForm = async (
  apiClient: AxiosInstance,
  eventBoardId: number
): Promise<void> => {
  await apiClient.post(`/admin/events/${eventBoardId}/form/publish`)
}

/** 신청자가 있으면 서버가 거절한다. 그때는 마감으로 닫도록 안내한다. */
export const deleteEventForm = async (
  apiClient: AxiosInstance,
  eventBoardId: number
): Promise<void> => {
  await apiClient.delete(`/admin/events/${eventBoardId}/form`)
}

export const addQuestion = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  payload: QuestionSavePayload
): Promise<number> => {
  const response = await apiClient.post(`/admin/events/${eventBoardId}/form/questions`, payload)
  return unwrapOnce<number>(response.data)
}

export const updateQuestion = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  questionId: number,
  payload: QuestionSavePayload
): Promise<void> => {
  await apiClient.put(`/admin/events/${eventBoardId}/form/questions/${questionId}`, payload)
}

export const deleteQuestion = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  questionId: number
): Promise<void> => {
  await apiClient.delete(`/admin/events/${eventBoardId}/form/questions/${questionId}`)
}

export const reorderQuestions = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  questionIds: number[]
): Promise<void> => {
  await apiClient.put(`/admin/events/${eventBoardId}/form/questions/order`, { questionIds })
}

/* ---------------- 운영진: 신청자 ---------------- */

export interface FetchApplicantsParams {
  page?: number
  size?: number
  status?: ApplicationStatus
}

export const fetchApplicants = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  params: FetchApplicantsParams = {}
): Promise<PagedResult<Applicant>> => {
  const response = await apiClient.get(`/admin/events/${eventBoardId}/applications`, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 50,
      status: params.status || undefined
    }
  })
  return unwrapPaged<Applicant>(response.data)
}

export const updateAttendance = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  applicationId: number,
  status: EventAttendanceStatus
): Promise<void> => {
  await apiClient.patch(`/admin/events/${eventBoardId}/applications/${applicationId}/attendance`, {
    status
  })
}

export const registerProxyApplicant = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  userId: number,
  markAttended: boolean
): Promise<number> => {
  const response = await apiClient.post(`/admin/events/${eventBoardId}/applications`, {
    userId,
    markAttended
  })
  return unwrapOnce<number>(response.data)
}

/** CSV 는 ApiResponse 로 감싸지 않는 파일 응답이라 blob 으로 받는다. */
export const downloadApplicantsCsv = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  status?: ApplicationStatus
): Promise<Blob> => {
  const response = await apiClient.get(`/admin/events/${eventBoardId}/applications/export`, {
    params: { status: status || undefined },
    responseType: 'blob'
  })
  return response.data as Blob
}

export const fetchCheckinToken = async (
  apiClient: AxiosInstance,
  eventBoardId: number
): Promise<CheckinToken> => {
  const response = await apiClient.get(`/admin/events/${eventBoardId}/applications/checkin-token`)
  return unwrapOnce<CheckinToken>(response.data)
}

/* ---------------- 부원 ---------------- */

export const fetchPublicEventForm = async (
  apiClient: AxiosInstance,
  eventBoardId: number
): Promise<PublicEventForm> => {
  const response = await apiClient.get(`/board/events/${eventBoardId}/form`)
  return unwrapOnce<PublicEventForm>(response.data)
}

export const submitApplication = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  answers: AnswerEntry[]
): Promise<void> => {
  await apiClient.post(`/board/events/${eventBoardId}/applications`, { answers })
}

export const cancelApplication = async (
  apiClient: AxiosInstance,
  eventBoardId: number
): Promise<void> => {
  await apiClient.delete(`/board/events/${eventBoardId}/applications/me`)
}

export const checkIn = async (
  apiClient: AxiosInstance,
  eventBoardId: number,
  token: string
): Promise<CheckinResult> => {
  const response = await apiClient.post(`/board/events/${eventBoardId}/checkin`, { token })
  return unwrapOnce<CheckinResult>(response.data)
}

export const fetchMyActivities = async (apiClient: AxiosInstance): Promise<MyActivity[]> => {
  const response = await apiClient.get('/me/activities')
  return unwrapOnce<MyActivity[]>(response.data)
}
