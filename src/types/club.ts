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

/* ---------------- C: 기수·완주·검토·현황·반응 ---------------- */

export interface ClubTerm {
  id: number
  name: string
  /** 0.01 ~ 1.00 (0.5 = 50%). 서버 BigDecimal 이라 number 로 온다. */
  attendanceRatio: number
}

/** 화면에서 칸 색을 고르는 상태. 서버 값(`rest`·`satisfied`·활동 상태)에서 `weekStateOf` 로 만든다. */
export type ClubWeekState =
  | 'SATISFIED'
  | 'MISSED'
  | 'REST'
  | 'PENDING_REVIEW'
  | 'CURRENT'
  | 'UPCOMING'

export interface ClubWeekActivity {
  activityId: number
  date: string
  status: ClubActivityStatus
  attended: number
  roster: number
  /** ceil(roster × 참석 비율) */
  required: number
  /** 인증 완료이고 필요 인원을 채워 인정 활동인지 */
  counted: boolean
}

/** 월요일 시작 한 주. */
export interface ClubWeek {
  weekStart: string
  rest: boolean
  activities: ClubWeekActivity[]
  /** true 충족 / false 놓침 / null 진행 중(이번 주·앞으로의 주) 또는 쉬는 주 */
  satisfied: boolean | null
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

export const CLUB_GOAL_STATUS_LABEL: Record<ClubGoalStatus, string> = {
  NOT_SUBMITTED: '결과 제출 전',
  SUBMITTED: '결과 제출됨 · 확인 전',
  ACHIEVED: '달성 확인',
  NOT_ACHIEVED: '미달성'
}

export const CLUB_COMPLETION_STATUS_LABEL: Record<ClubCompletionStatus, string> = {
  IN_PROGRESS: '진행 중',
  COMPLETED: '완주',
  FAILED: '미완주'
}

/** `GET /clubs/{id}/completion`. 계산값은 참고용이고 확정은 운영진이 한다. */
export interface ClubCompletion {
  /** null 이면 활동 기간 미설정 — weeks 는 빈 배열 */
  period: { startDate: string; endDate: string } | null
  weeks: ClubWeek[]
  restWeeks: string[]
  memberCount: number
  memberCountSatisfied: boolean
  goalStatus: ClubGoalStatus
  /** 아직 검토하지 않은 기록 수 */
  pendingActivityCount: number
  /** 활동 기간 밖 기록 수 — 계산에서 빠졌다 */
  outOfPeriodActivityCount: number
  /** 쉬는 주 뺀 모든 주 충족 && 4명 이상 && 목표 ACHIEVED */
  eligible: boolean
  warnings: ClubWarning[]
  goal: string | null
  goalCriteria: string | null
  goalResult: string | null
  goalEvidenceUrls: string[]
  completionStatus: ClubCompletionStatus
  completionMemo: string | null
  confirmedAt: string | null
}

/** 운영진 현황 표 한 줄 (`GET /admin/clubs`). */
export interface AdminClubRow {
  clubId: number
  name: string
  leaderId: number
  leaderName: string
  status: ClubStatus
  startDate: string | null
  endDate: string | null
  memberCount: number
  capacity: number | null
  goalStatus: ClubGoalStatus
  satisfiedWeeks: number
  /** 쉬는 주를 뺀 주 (앞으로의 주 포함) */
  targetWeeks: number
  restWeeks: number
  pendingReviewCount: number
  warnings: ClubWarning[]
  eligible: boolean
  completionStatus: ClubCompletionStatus
}

/** 인증 검토 목록 한 건 (`GET /admin/club-activities`). */
export interface ClubReviewItem {
  activityId: number
  clubId: number
  clubName: string
  activityDate: string
  content: string
  progressNote: string | null
  status: ClubActivityStatus
  submittedAt: string
  /** 보완 요청 뒤 다시 낸 기록 */
  resubmitted: boolean
  revisionReason: string | null
  photoUrls: string[]
  roster: { userId: number; name: string; attended: boolean }[]
  rosterCount: number
  attendedCount: number
  required: number
  requiredSatisfied: boolean
}

export type ClubTargetType = 'POST' | 'ACTIVITY'

export interface ClubComment {
  id: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
  /** 지금 보는 사람이 지울 수 있는지 (작성자·팀 리더·운영진) */
  deletable: boolean
}

export interface ClubLikeResult {
  liked: boolean
  likeCount: number
}
