import type { AttachmentEntry, AttachmentResponse, BoardSearchType } from '@/types/board'

/**
 * 백엔드는 board/common/enums/SearchType 하나를 행사·공지·자유가 공유한다(값이 동일).
 * 별칭끼리 엮지 말고 각자 BoardSearchType 을 직접 가리킨다.
 */
export type FreeSearchType = BoardSearchType

export interface FreeBoardSummary {
  id: number
  title: string
  authorName: string
  viewCount: number
  createdAt: string
}

/**
 * 행사·공지 상세와 달리 authorId 가 있다. 수정·삭제 권한이 '작성자 본인 또는
 * ORGANIZER 이상'이라, 이 값이 없으면 화면이 본인 여부를 판정할 수 없다.
 */
export interface FreeBoardDetail {
  id: number
  title: string
  content: string
  authorId: number
  authorName: string
  viewCount: number
  attachments: AttachmentResponse[]
  createdAt: string
  updatedAt: string
}

export interface FreeBoardCreatePayload {
  title: string
  content: string
  attachments: AttachmentEntry[]
}

/** FreeBoardUpdateRequest는 전 필드 선택이고 null인 필드는 바꾸지 않는다. */
export type FreeBoardUpdatePayload = Partial<FreeBoardCreatePayload>
