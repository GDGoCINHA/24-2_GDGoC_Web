import type {
  NoticeCategory,
  NoticeSearchField,
  NoticeStatus,
  NoticeVisibility
} from '@/services/notice/noticeApi'

export const NOTICE_CATEGORY_LABEL: Record<NoticeCategory, string> = {
  OPERATION: '운영',
  SCHEDULE: '일정',
  RECRUITMENT: '모집',
  ETC: '기타'
}

// Figma 디자인의 카테고리 식별 컬러 — 빨강은 카테고리가 아니라 "전체/액션" 강조색이라 제외.
export const NOTICE_CATEGORY_COLOR: Record<NoticeCategory, string> = {
  OPERATION: '#4285F4',
  SCHEDULE: '#34A853',
  RECRUITMENT: '#F9AB00',
  ETC: '#CCCCCC'
}

export const NOTICE_STATUS_LABEL: Record<NoticeStatus, string> = {
  PUBLISHED: '공지',
  IN_PROGRESS: '진행',
  CLOSED: '마감',
  DRAFT: '임시'
}

export const NOTICE_STATUS_COLOR: Record<NoticeStatus, string> = {
  PUBLISHED: '#17386E',
  IN_PROGRESS: '#165A28',
  CLOSED: '#674C14',
  DRAFT: '#424242'
}

export const NOTICE_VISIBILITY_LABEL: Record<NoticeVisibility, string> = {
  PUBLIC: '공개',
  PRIVATE: '비공개'
}

export const NOTICE_SEARCH_FIELD_LABEL: Record<NoticeSearchField, string> = {
  title_content: '제목+내용',
  title: '제목',
  content: '내용',
  author: '작성자'
}

export const NOTICE_PIN_LIMIT = 3
export const NOTICE_PAGE_SIZE = 15
export const NOTICE_ATTACHMENT_MAX_COUNT = 10
export const NOTICE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

export const NOTICE_DRAFT_STORAGE_KEY = 'gdgoc.notice.draft'

export const NOTICE_PIN_LIMIT_ERROR_NAME = 'NoticePinLimitError'
