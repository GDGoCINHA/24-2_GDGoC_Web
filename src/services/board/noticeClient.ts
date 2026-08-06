import type { AxiosInstance } from 'axios'

import type {
  NoticeCreatePayload,
  NoticeDetail,
  NoticeSearchType,
  NoticeSummary,
  NoticeUpdatePayload
} from '@/types/notice'
import type { PageMeta } from '@/utils/api/unwrapPaged'

export interface FetchNoticeListParams {
  page?: number
  size?: number
  searchType?: NoticeSearchType
  keyword?: string
}

export interface NoticeListResult {
  pinned: NoticeSummary[]
  items: NoticeSummary[]
  meta: PageMeta
}

/**
 * response.data.data를 한 겹만 벗긴다. 공용 unwrapApiResponse는 쓰지 않는다 —
 * NoticeDetail에 'content'(본문) 필드가 있어서 WRAPPER_KEYS의 'content'와 부딪혀
 * 객체 대신 본문 문자열만 반환한다 (src/utils/api/unwrap.ts).
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/**
 * 공지 목록 봉투는 행사와 다르다.
 *   행사: { data: { content: [...] }, meta }
 *   공지: { data: { pinned: [...], posts: { content: [...] } }, meta }
 * 그래서 unwrapPaged를 쓸 수 없다 — body.data.content가 undefined다.
 * meta는 posts 기준이며 고정 3건을 포함하지 않는다 (PageMeta.of(posts)).
 */
interface NoticeListBody {
  data: { pinned: NoticeSummary[]; posts: { content: NoticeSummary[] } }
  meta: PageMeta
}

/**
 * 공지는 로그인한 사용자만 볼 수 있다. 그래서 client를 필수로 받는다 —
 * 기본값을 publicClient로 두면 토큰 없이 조회가 나가고, 서버가 permitAll을
 * 걷어내는 순간 조용히 401이 된다. 호출 전에 로그인 여부를 가르는 건 화면의 몫이다.
 *
 * CORE 이상이 자기 임시저장(isPublished=false)까지 보려면 토큰이 실려야 한다 —
 * 서버가 역할로 거른다.
 */
export const fetchNoticeList = async (
  params: FetchNoticeListParams,
  client: AxiosInstance
): Promise<NoticeListResult> => {
  const response = await client.get('/board/notices', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 15,
      searchType: params.searchType ?? 'TITLE_AND_CONTENT',
      keyword: params.keyword || undefined
    }
  })
  const body = response.data as NoticeListBody
  return { pinned: body.data.pinned, items: body.data.posts.content, meta: body.meta }
}

export const fetchNoticeDetail = async (
  id: number,
  client: AxiosInstance
): Promise<NoticeDetail> => {
  const response = await client.get(`/board/notices/${id}`)
  return unwrapOnce<NoticeDetail>(response.data)
}

export const createNotice = async (
  apiClient: AxiosInstance,
  payload: NoticeCreatePayload
): Promise<number> => {
  const response = await apiClient.post('/board/notices', payload)
  return unwrapOnce<number>(response.data)
}

export const updateNotice = async (
  apiClient: AxiosInstance,
  id: number,
  payload: NoticeUpdatePayload
): Promise<void> => {
  await apiClient.patch(`/board/notices/${id}`, payload)
}

export const deleteNotice = async (apiClient: AxiosInstance, id: number): Promise<void> => {
  await apiClient.delete(`/board/notices/${id}`)
}

/** GET /pinned는 ORGANIZER+ 전용이라 apiClient가 필수다. */
export const fetchPinnedNotices = async (apiClient: AxiosInstance): Promise<NoticeSummary[]> => {
  const response = await apiClient.get('/board/notices/pinned')
  return unwrapOnce<NoticeSummary[]>(response.data)
}

/** 배열 순서가 곧 display_order 1·2·3이다. 개별 pin/unpin이 아니라 전체 교체다. */
export const replacePinnedNotices = async (
  apiClient: AxiosInstance,
  noticeIds: number[]
): Promise<void> => {
  await apiClient.put('/board/notices/pinned', { noticeIds })
}
