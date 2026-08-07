export interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  sort: string
  direction: string
}

export interface PagedResult<T> {
  items: T[]
  meta: PageMeta
}

interface PagedApiBody<T> {
  data: { content: T[] }
  meta: PageMeta
}

/**
 * 게시판 목록 응답 전용 언랩. 공용 unwrapApiResponse는 'content' 키를 만나면
 * 재귀적으로 계속 벗겨 Spring Page의 배열 자체를 반환해버려 pageable·meta가
 * 사라진다 (WRAPPER_KEYS에 'content'가 있음, src/utils/api/unwrap.ts).
 * 이 함수는 바깥 'data' 한 겹만 벗기고 content 배열과 meta를 그대로 돌려준다.
 */
export const unwrapPaged = <T>(payload: unknown): PagedResult<T> => {
  const body = payload as PagedApiBody<T>
  return { items: body.data.content, meta: body.meta }
}
