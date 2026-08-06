import type { TeamValue } from '@/types/profile'

export type AttachmentKind = 'FILE' | 'LINK'

export interface AttachmentResponse {
  id: number
  kind: AttachmentKind
  fileKey: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  url: string | null
}

export interface AttachmentEntry {
  fileKey?: string
  fileName?: string
  url?: string
}

export type EventBoardStatus = 'UPCOMING' | 'IN_PROGRESS' | 'ENDED'

/**
 * 세 게시판이 공유하는 검색 조건. 백엔드도 SearchType 을 board/common 으로 올린다
 * (게시판 공통 스키마 설계 §8.1) — 공지·자유가 BoardSearchBar 를 그대로 쓰려면
 * 이 이름이 행사 전용이 아니어야 한다.
 */
export type BoardSearchType = 'TITLE_AND_CONTENT' | 'TITLE' | 'CONTENT' | 'AUTHOR'

/** 행사게시판 문맥에서 쓰던 이름. BoardSearchType 과 같은 타입이다. */
export type EventSearchType = BoardSearchType

export type EventOrganizingTeam = Exclude<TeamValue, null>

export interface EventBoardSummary {
  id: number
  title: string
  thumbnailUrl: string | null
  eventStartDate: string
  eventEndDate: string
  organizingTeam: TeamValue
  authorName: string
  status: EventBoardStatus
}

export interface EventBoardDetail {
  id: number
  title: string
  eventStartDate: string
  eventEndDate: string
  organizingTeam: TeamValue
  authorName: string
  thumbnailUrl: string | null
  content: string
  isPublished: boolean
  status: EventBoardStatus
  attachments: AttachmentResponse[]
  createdAt: string
  updatedAt: string
}

export interface EventBoardCreatePayload {
  title: string
  eventStartDate: string
  eventEndDate: string
  organizingTeam: EventOrganizingTeam
  thumbnailKey?: string
  content: string
  isPublished: boolean
  attachments: AttachmentEntry[]
}

export type EventBoardUpdatePayload = Partial<EventBoardCreatePayload>
