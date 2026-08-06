import type { AxiosInstance } from 'axios'

import { publicClient } from '@/lib/api/publicClient'
import { unwrapPaged, type PagedResult } from '@/utils/api/unwrapPaged'
import type {
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
