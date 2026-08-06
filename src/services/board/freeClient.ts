import type { AxiosInstance } from 'axios'

import type {
  FreeBoardCreatePayload,
  FreeBoardDetail,
  FreeBoardSummary,
  FreeBoardUpdatePayload,
  FreeSearchType
} from '@/types/free'
import { unwrapPaged, type PagedResult } from '@/utils/api/unwrapPaged'

export interface FetchFreeListParams {
  page?: number
  size?: number
  searchType?: FreeSearchType
  keyword?: string
}

/**
 * response.data.data를 한 겹만 벗긴다. 공용 unwrapApiResponse는 쓰지 않는다 —
 * FreeBoardDetail에 'content'(본문) 필드가 있어서 WRAPPER_KEYS의 'content'와 부딪혀
 * 객체 대신 본문 문자열만 반환한다 (src/utils/api/unwrap.ts).
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/**
 * 자유게시판은 회원 전용이다. 그래서 client를 필수로 받는다 — 기본값을 publicClient로
 * 두면 토큰 없이 조회가 나가 401이 된다. 호출 전에 로그인 여부를 가르는 건 화면의 몫이다.
 *
 * 목록 봉투는 행사와 같다 ({ data: { content: [...] }, meta }). 공지처럼 고정 글이
 * 따로 오지 않으므로 unwrapPaged를 그대로 쓴다.
 */
export const fetchFreeList = async (
  params: FetchFreeListParams,
  client: AxiosInstance
): Promise<PagedResult<FreeBoardSummary>> => {
  const response = await client.get('/board/free', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 15,
      searchType: params.searchType ?? 'TITLE_AND_CONTENT',
      keyword: params.keyword || undefined
    }
  })
  return unwrapPaged<FreeBoardSummary>(response.data)
}

export const fetchFreeDetail = async (
  id: number,
  client: AxiosInstance
): Promise<FreeBoardDetail> => {
  const response = await client.get(`/board/free/${id}`)
  return unwrapOnce<FreeBoardDetail>(response.data)
}

export const createFreePost = async (
  apiClient: AxiosInstance,
  payload: FreeBoardCreatePayload
): Promise<number> => {
  const response = await apiClient.post('/board/free', payload)
  return unwrapOnce<number>(response.data)
}

export const updateFreePost = async (
  apiClient: AxiosInstance,
  id: number,
  payload: FreeBoardUpdatePayload
): Promise<void> => {
  await apiClient.patch(`/board/free/${id}`, payload)
}

export const deleteFreePost = async (apiClient: AxiosInstance, id: number): Promise<void> => {
  await apiClient.delete(`/board/free/${id}`)
}
