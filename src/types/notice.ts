import type { AttachmentEntry, AttachmentResponse, BoardSearchType } from '@/types/board'

/**
 * 백엔드는 board/common/enums/SearchType 하나를 행사·공지가 공유한다(값이 동일).
 * 별도 선언 대신 공용 타입에 도메인 이름을 붙인다. 행사도 EventSearchType 으로
 * 같은 방식을 쓴다 — 별칭끼리 엮지 말고 각자 BoardSearchType 을 직접 가리킨다.
 */
export type NoticeSearchType = BoardSearchType

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
  /** 수정·삭제가 '본인 또는 ORGANIZER+'라 화면이 본인 여부를 판정하려면 필요하다. */
  authorId: number
  authorName: string
  viewCount: number
  isPublished: boolean
  attachments: AttachmentResponse[]
  createdAt: string
  updatedAt: string
}

/** 휴지통 한 행. deletedAt 이 정렬 기준이라 목록에도 보여준다. */
export interface DeletedNoticeSummary {
  id: number
  category: NoticeCategory
  title: string
  authorName: string
  viewCount: number
  isPublished: boolean
  createdAt: string
  deletedAt: string
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
