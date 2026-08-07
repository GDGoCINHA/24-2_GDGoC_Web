import type { AxiosInstance } from 'axios'

import { publicClient } from '@/lib/api/publicClient'
import { unwrapPaged, type PagedResult } from '@/utils/api/unwrapPaged'
import type {
  DeletedEventBoardSummary,
  EventBoardCreatePayload,
  EventBoardDetail,
  EventBoardSummary,
  EventBoardUpdatePayload,
  EventSearchType
} from '@/types/board'

export interface FetchEventListParams {
  page?: number
  size?: number
  searchType?: EventSearchType
  keyword?: string
}

/**
 * response.data.data를 한 겹만 벗긴다. 공용 unwrapApiResponse는 쓰지 않는다 —
 * EventBoardDetail에 'content'(본문) 필드가 있어서, WRAPPER_KEYS의 'content'와
 * 부딪혀 객체 대신 본문 문자열만 반환하는 버그가 있다 (unwrap.ts 참고).
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

export const fetchEventList = async (
  params: FetchEventListParams = {}
): Promise<PagedResult<EventBoardSummary>> => {
  const response = await publicClient.get('/board/events', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 12,
      searchType: params.searchType ?? 'TITLE_AND_CONTENT',
      keyword: params.keyword || undefined
    }
  })
  return unwrapPaged<EventBoardSummary>(response.data)
}

export const fetchEventDetail = async (id: number): Promise<EventBoardDetail> => {
  const response = await publicClient.get(`/board/events/${id}`)
  return unwrapOnce<EventBoardDetail>(response.data)
}

export const createEvent = async (
  apiClient: AxiosInstance,
  payload: EventBoardCreatePayload
): Promise<number> => {
  const response = await apiClient.post('/board/events', payload)
  return unwrapOnce<number>(response.data)
}

export const updateEvent = async (
  apiClient: AxiosInstance,
  id: number,
  payload: EventBoardUpdatePayload
): Promise<void> => {
  await apiClient.patch(`/board/events/${id}`, payload)
}

export const deleteEvent = async (apiClient: AxiosInstance, id: number): Promise<void> => {
  await apiClient.delete(`/board/events/${id}`)
}

/**
 * 휴지통. 목록·상세와 달리 publicClient 를 쓰지 않는다 — CORE 이상 전용이라
 * 토큰이 없으면 401 이다. 서버는 ORGANIZER 미만에게 자기 팀 것만 걸러서 준다.
 */
export const fetchDeletedEvents = async (
  params: { page?: number; size?: number },
  apiClient: AxiosInstance
): Promise<PagedResult<DeletedEventBoardSummary>> => {
  const response = await apiClient.get('/board/events/deleted', {
    params: { page: params.page ?? 0, size: params.size ?? 12 }
  })
  return unwrapPaged<DeletedEventBoardSummary>(response.data)
}

export const restoreEvent = async (apiClient: AxiosInstance, id: number): Promise<void> => {
  await apiClient.post(`/board/events/${id}/restore`)
}
