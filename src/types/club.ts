/**
 * 소모임 타입. 서버 enum 문자열과 같아야 한다 — 서버 `inha.gdgoc.domain.club.*.enums`.
 *
 * 타입 자동 생성이 없으므로 서버 DTO 를 바꾸면 여기도 같은 작업에서 고친다.
 */

export type ClubCategory = 'STUDY' | 'HOBBY' | 'CAREER' | 'ETC'
export type ClubRecruitStatus = 'RECRUITING' | 'CLOSED'
export type ClubStatus = 'ACTIVE' | 'ENDED' | 'HIDDEN'
export type ClubMemberStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CANCELED' | 'LEFT' | 'KICKED'
export type ClubActivityStatus = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED'
export type ClubPostCategory = 'NOTICE' | 'QUESTION' | 'REVIEW' | 'RESOURCE'
export type ClubGoalStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'ACHIEVED' | 'NOT_ACHIEVED'
export type ClubCompletionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export const CLUB_CATEGORY_LABEL: Record<ClubCategory, string> = {
  STUDY: '스터디',
  HOBBY: '취미',
  CAREER: '취업 준비',
  ETC: '기타'
}

export const CLUB_ACTIVITY_STATUS_LABEL: Record<ClubActivityStatus, string> = {
  PENDING: '확인 중',
  APPROVED: '인증 완료',
  REVISION_REQUESTED: '보완 요청'
}

export const CLUB_POST_CATEGORY_LABEL: Record<ClubPostCategory, string> = {
  NOTICE: '공지',
  QUESTION: '질문',
  REVIEW: '후기',
  RESOURCE: '자료'
}

export interface ClubSummary {
  id: number
  name: string
  category: ClubCategory
  summary: string
  imageUrl: string | null
  leaderName: string
  memberCount: number
  capacity: number | null
  recruitStatus: ClubRecruitStatus
}

export interface ClubMembership {
  status: ClubMemberStatus
  isLeader: boolean
}

export interface ClubDetail extends ClubSummary {
  leaderId: number
  status: ClubStatus
  termId: number
  termName: string
  description: string | null
  activityMethod: string | null
  startDate: string | null
  endDate: string | null
  /** 멤버·운영진이 아니면 서버가 null 로 준다. */
  kakaoLink: string | null
  myMembership: ClubMembership | null
}

/** 멤버·신청자 한 줄. `memberId` 는 승인·거절·강퇴에 쓰는 club_member 행 id 다. */
export interface ClubMember {
  memberId: number
  userId: number
  name: string
  major: string | null
  status: ClubMemberStatus
  isLeader: boolean
  applyMessage: string | null
  appliedAt: string
  joinedAt: string | null
}

export interface MyClub {
  club: ClubSummary
  status: ClubMemberStatus
  isLeader: boolean
}

export type ClubOpenRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ClubOpenRequest {
  id: number
  userId: number
  userName: string
  name: string
  category: ClubCategory
  summary: string
  goal: string | null
  status: ClubOpenRequestStatus
  rejectReason: string | null
  createdAt: string
}

export interface ClubLeaderGrant {
  userId: number
  name: string
  major: string | null
  grantedAt: string
  /** 지금 이끄는 소모임 이름. */
  clubNames: string[]
}

export interface ClubActivity {
  id: number
  activityDate: string
  content: string
  status: ClubActivityStatus
  photoUrls: string[]
  attendedCount: number
  rosterCount: number
  requiredCount: number
  /** 멤버·운영진에게만 채워진다. */
  attendeeNames: string[] | null
  revisionReason: string | null
  likeCount: number
  commentCount: number
}

export interface ClubPost {
  id: number
  category: ClubPostCategory
  authorName: string
  content: string
  createdAt: string
  likeCount: number
  commentCount: number
}

export type ClubFeedItem = ({ type: 'ACTIVITY' } & ClubActivity) | ({ type: 'POST' } & ClubPost)

export interface ClubSchedule {
  id: number
  title: string
  startsAt: string
  location: string | null
  onlineLink: string | null
  attendCount: number
  absentCount: number
  noResponseCount: number
  myResponse: 'ATTEND' | 'ABSENT' | null
}

export type ClubWeekState =
  | 'SATISFIED'
  | 'MISSED'
  | 'REST'
  | 'PENDING_REVIEW'
  | 'CURRENT'
  | 'UPCOMING'

export interface ClubWeek {
  weekStart: string
  state: ClubWeekState
  countedActivities: number
}

export type ClubWarning =
  | 'PERIOD_NOT_SET'
  | 'MEMBERS_UNDER_4'
  | 'WEEK_MISSED'
  | 'GOAL_NOT_SET'
  | 'OUT_OF_PERIOD'
  | 'OVER_CAPACITY'

export const CLUB_WARNING_LABEL: Record<ClubWarning, string> = {
  PERIOD_NOT_SET: '기간 미설정',
  MEMBERS_UNDER_4: '4명 미만',
  WEEK_MISSED: '놓친 주',
  GOAL_NOT_SET: '목표 미등록',
  OUT_OF_PERIOD: '기간 밖 기록',
  OVER_CAPACITY: '정원 초과'
}

export interface ClubCompletion {
  goal: string | null
  goalCriteria: string | null
  goalResult: string | null
  goalStatus: ClubGoalStatus
  weeks: ClubWeek[]
  memberCount: number
  completionStatus: ClubCompletionStatus
  warnings: ClubWarning[]
}
