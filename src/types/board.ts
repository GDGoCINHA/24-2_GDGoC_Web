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

export type EventSearchType = 'TITLE_AND_CONTENT' | 'TITLE' | 'CONTENT' | 'AUTHOR'

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
