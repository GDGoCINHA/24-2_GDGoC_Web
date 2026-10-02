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

/**
 * 활동 기록 상세. 서버 `ClubActivityDetailResponse`.
 *
 * 서버는 null 필드를 응답에서 뺀다 — 그래서 비어 있을 수 있는 필드는 `?:` 다.
 */
export interface ClubActivityDetail {
  id: number
  clubId: number
  scheduleId?: number | null
  /** YYYY-MM-DD */
  activityDate: string
  content: string
  progressNote?: string | null
  status: ClubActivityStatus
  photoUrls: string[]
  rosterCount: number
  attendedCount: number
  requiredCount: number
  /** 팀 멤버·운영진에게만 채워진다. 다른 부원에게는 없다. */
  attendance?: ClubActivityAttendance[] | null
  /** 팀 멤버·운영진에게만 채워진다. */
  revisionReason?: string | null
  submittedAt: string
  /** 내가 리더이고 아직 인증 완료되지 않았다. */
  editable: boolean
}

export interface ClubActivityAttendance {
  userId: number
  name: string
  attended: boolean
}

/** 활동 기록 작성 화면의 명단. 서버 `ClubActivityRosterResponse`. 활동일 당시 팀원이다. */
export interface ClubActivityRoster {
  date: string
  attendanceRatio: number
  requiredCount: number
  members: ClubActivityRosterMember[]
}

export interface ClubActivityRosterMember {
  userId: number
  name: string
  leader: boolean
  /** QR 로 체크인했다. 출석 체크의 기본값으로만 쓴다. */
  checkedIn: boolean
}

export type ClubRsvp = 'ATTEND' | 'ABSENT'

/**
 * 일정과 참석 예정 응답 집계. 서버 `ClubScheduleResponse`.
 *
 * 서버는 null 필드를 응답에서 뺀다 — 그래서 비어 있을 수 있는 필드는 `?:` 다.
 */
export interface ClubSchedule {
  id: number
  title: string
  /** ISO 시각 */
  startsAt: string
  location?: string | null
  /** 팀 멤버·운영진에게만 채워진다. */
  onlineLink?: string | null
  description?: string | null
  /** 지금 팀원만 센다. */
  attendCount: number
  absentCount: number
  noResponseCount: number
  /** 내 응답. 응답하지 않았거나 팀원이 아니면 없다. */
  myResponse?: ClubRsvp | null
}

/** 리더 화면이 QR 로 그릴 값. 서버 `ClubCheckinTokenResponse`. */
export interface ClubCheckinToken {
  scheduleId: number
  token: string
  expiresInSeconds: number
}

/** QR 체크인 결과. 서버 `ClubCheckinResponse`. */
export interface ClubCheckinResult {
  clubId: number
  scheduleId: number
  scheduleTitle: string
  /** 이미 체크인돼 있었다. 오류가 아니다. */
  alreadyCheckedIn: boolean
  checkedAt: string
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
