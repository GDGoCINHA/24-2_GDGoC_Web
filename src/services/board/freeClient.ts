import type { AxiosInstance } from 'axios'

import type {
  DeletedFreeBoardSummary,
  FreeBoardComment,
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

/**
 * 휴지통. 공지·행사가 CORE 이상인 것과 달리 MEMBER 이상이면 부를 수 있다 —
 * 자유게시판은 MEMBER 도 글을 쓰므로 자기가 지운 글을 본인이 되살릴 수 있어야 한다.
 * ORGANIZER 미만에게는 서버가 자기 글만 걸러서 준다.
 */
export const fetchDeletedFreePosts = async (
  params: { page?: number; size?: number },
  client: AxiosInstance
): Promise<PagedResult<DeletedFreeBoardSummary>> => {
  const response = await client.get('/board/free/deleted', {
    params: { page: params.page ?? 0, size: params.size ?? 15 }
  })
  return unwrapPaged<DeletedFreeBoardSummary>(response.data)
}

export const restoreFreePost = async (apiClient: AxiosInstance, id: number): Promise<void> => {
  await apiClient.post(`/board/free/${id}/restore`)
}

/**
 * 댓글 목록. 페이지네이션이 없어 트리 전체가 한 번에 온다.
 *
 * 여기서도 unwrapApiResponse 를 쓰지 않는다 — 댓글에 'content' 필드가 있어
 * WRAPPER_KEYS 의 'content' 와 부딪힌다.
 */
export const fetchFreeComments = async (
  postId: number,
  client: AxiosInstance
): Promise<FreeBoardComment[]> => {
  const response = await client.get(`/board/free/${postId}/comments`)
  return unwrapOnce<FreeBoardComment[]>(response.data)
}

export const createFreeComment = async (
  apiClient: AxiosInstance,
  postId: number,
  payload: { content: string; parentId?: number }
): Promise<number> => {
  const response = await apiClient.post(`/board/free/${postId}/comments`, payload)
  return unwrapOnce<number>(response.data)
}

/** 수정·삭제는 글 id 없이 댓글 id 만으로 부른다. */
export const updateFreeComment = async (
  apiClient: AxiosInstance,
  commentId: number,
  content: string
): Promise<void> => {
  await apiClient.patch(`/board/free/comments/${commentId}`, { content })
}

export const deleteFreeComment = async (
  apiClient: AxiosInstance,
  commentId: number
): Promise<void> => {
  await apiClient.delete(`/board/free/comments/${commentId}`)
}
