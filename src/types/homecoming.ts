/**
 * 홈커밍데이 신청 관리 타입. Server `domain/homecoming` 의 DTO 와 손으로 맞춘다 —
 * 서버 DTO 를 바꾸면 여기도 같은 작업에서 고친다.
 */

export type AttendType = 'main' | 'after' | 'both' | 'maybe' | 'no'
export type HomecomingMemberRole = 'organizer' | 'member'
export type HomecomingTeam = 'Organizer' | 'HR' | 'BD' | 'Tech' | 'PR·Design'
export type HomecomingStatus = 'ACTIVE' | 'CANCELED'
export type ConsentPurpose = 'EVENT_INVITE' | 'TALENT_POOL'
export type ConsentState = 'ACTIVE' | 'EXPIRED' | 'WITHDRAWN' | 'REFUSED'

export interface HomecomingApplication {
  id: number
  attendType: AttendType
  attendLabel: string
  /** Notion '2026 참석' 칸에 옮길 값 (참석/미정/불참) */
  notionStatus: string
  name: string
  phone: string
  yearStart?: number
  yearEnd?: number
  memberRole?: HomecomingMemberRole
  team?: HomecomingTeam
  activitySummary: string
  late: boolean
  arrivalTime?: string
  message?: string
  status: HomecomingStatus
  submittedAt: string
  canceledAt?: string
  cancelReason?: string
  eventInvite: ConsentState
  talentPool: ConsentState
}

export interface HomecomingSummary {
  main: number
  after: number
  both: number
  maybe: number
  no: number
  total: number
  mainEventAttendees: number
  afterPartyAttendees: number
  lateArrivals: number
  canceled: number
}

export interface HomecomingUpdatePayload {
  attendType: AttendType
  name: string
  phone: string
  yearStart: number | null
  yearEnd: number | null
  memberRole: HomecomingMemberRole | null
  team: HomecomingTeam | null
  isLate: boolean
  arrivalTime: string | null
  message: string | null
}

export interface HomecomingConsentEntry {
  applicationId: number
  name: string
  phone: string
  yearStart?: number
  yearEnd?: number
  memberRole?: HomecomingMemberRole
  purpose: ConsentPurpose
  state: ConsentState
  noticeVersion: string
  decidedAt: string
  expiresAt?: string
  withdrawnAt?: string
}

export const ATTEND_TYPES: AttendType[] = ['main', 'after', 'both', 'maybe', 'no']

export const ATTEND_LABEL: Record<AttendType, string> = {
  main: '본 행사만',
  after: '뒤풀이만',
  both: '본 행사+뒤풀이',
  maybe: '아직 미정',
  no: '불참'
}

export const ROLE_LABEL: Record<HomecomingMemberRole, string> = {
  organizer: '운영진',
  member: '일반 멤버'
}

export const TEAMS: HomecomingTeam[] = ['Organizer', 'HR', 'BD', 'Tech', 'PR·Design']

export const YEARS = [2021, 2022, 2023, 2024, 2025, 2026]

export const ARRIVAL_TIMES = ['14:00', '15:00', '16:00', '17:00', '18:00']

export const CONSENT_PURPOSE_LABEL: Record<ConsentPurpose, string> = {
  EVENT_INVITE: '이후 행사 초청',
  TALENT_POOL: 'OB 인재풀'
}

export const CONSENT_STATE_LABEL: Record<ConsentState, string> = {
  ACTIVE: '동의',
  EXPIRED: '기한 만료',
  WITHDRAWN: '철회',
  REFUSED: '미동의'
}
