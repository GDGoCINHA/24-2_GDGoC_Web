import type { AttachmentEntry, AttachmentResponse, EventSearchType } from '@/types/board'

/**
 * 백엔드는 board/common/enums/SearchType 하나를 행사·공지가 공유한다(값이 동일).
 * 별도 선언 대신 별칭을 둔다 — feature/board-ui가 소유한 types/board.ts를 건드리지
 * 않으면서 공지 코드에서 이름이 읽히게 하려는 것이다.
 */
export type NoticeSearchType = EventSearchType

export type NoticeCategory = 'OPERATION' | 'SCHEDULE' | 'RECRUIT' | 'ETC'

/** NoticeCategory.java의 description과 같은 문구다. */
export const NOTICE_CATEGORY_LABEL: Record<NoticeCategory, string> = {
  OPERATION: '운영',
  SCHEDULE: '일정',
  RECRUIT: '모집',
  ETC: '기타'
}

export interface NoticeSummary {
  id: number
  category: NoticeCategory
  title: string
  authorName: string
  viewCount: number
  isPublished: boolean
  createdAt: string
}

export interface NoticeDetail {
  id: number
  category: NoticeCategory
  title: string
  content: string
  authorName: string
  viewCount: number
  isPublished: boolean
  attachments: AttachmentResponse[]
  createdAt: string
  updatedAt: string
}

export interface NoticeCreatePayload {
  title: string
  content: string
  category: NoticeCategory
  isPublished: boolean
  attachments: AttachmentEntry[]
}

/** NoticeUpdateRequest는 전 필드 선택이고 null인 필드는 바꾸지 않는다. */
export type NoticeUpdatePayload = Partial<NoticeCreatePayload>
