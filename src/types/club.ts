/**
 * 소모임 타입. 서버 enum 문자열과 같아야 한다 — 서버 `inha.gdgoc.domain.club.*.enums`.
 *
 * 타입 자동 생성이 없으므로 서버 DTO 를 바꾸면 여기도 같은 작업에서 고친다.
 */

export type ClubCategory = 'STUDY' | 'HOBBY' | 'CAREER' | 'ETC'
export type ClubRecruitStatus = 'RECRUITING' | 'CLOSED'
/** PENDING(개설 승인 대기)·REJECTED(반려)·HIDDEN 은 리더·멤버와 운영진에게만 보인다. */
export type ClubStatus = 'PENDING' | 'REJECTED' | 'ACTIVE' | 'ENDED' | 'HIDDEN'
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

export const CLUB_STATUS_LABEL: Record<ClubStatus, string> = {
  PENDING: '개설 승인 대기',
  REJECTED: '개설 반려',
  ACTIVE: '운영 중',
  ENDED: '종료',
  HIDDEN: '숨김'
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
  status: ClubStatus
}

export interface ClubMembership {
  status: ClubMemberStatus
  isLeader: boolean
}

export interface ClubDetail extends ClubSummary {
  leaderId: number
  /** 운영진이 반려할 때 남긴 사유. 승인하면 비운다. */
  rejectReason: string | null
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

/**
 * 피드 카드 한 장. 서버 `ClubFeedItemResponse`. 팀 피드는 게시글(POST)과 활동 기록(ACTIVITY)을 섞고,
 * 전체 피드는 활동 기록만 담는다. `type`·`id` 가 그대로 좋아요·댓글 대상이다.
 *
 * 종류에 해당하지 않는 필드는 서버가 응답에서 뺀다 — 그래서 `?:` 다.
 * 활동 기록 카드에는 출석 명단이 없다(인원 수만). 명단은 상세에서 팀 멤버·운영진에게만 보인다.
 */
export interface ClubFeedItem {
  type: ClubTargetType
  id: number
  /** ISO 시각. 피드는 이 순서(최신순)다. */
  createdAt: string
  content: string
  likeCount: number
  commentCount: number
  likedByMe: boolean
  /** 전체 피드에서만. */
  clubId?: number | null
  clubName?: string | null
  /** 활동 기록. YYYY-MM-DD */
  activityDate?: string | null
  status?: ClubActivityStatus | null
  photoUrls?: string[] | null
  attendedCount?: number | null
  rosterCount?: number | null
  requiredCount?: number | null
  /** 게시글. */
  category?: ClubPostCategory | null
  authorId?: number | null
  authorName?: string | null
  imageUrls?: string[] | null
  /** 게시글: 내가 작성자다. */
  editable?: boolean | null
  /** 게시글: 작성자·리더·운영진이다. */
  deletable?: boolean | null
}

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
  /** 이 일정에 연결된 활동 기록. 있으면 「기록 보기」, 없으면 「기록 작성」. */
  activityId?: number | null
}

/** 한 회차의 내 출석. 서버 `MyAttendanceResponse`. */
export interface ClubMyAttendance {
  activityId: number
  /** YYYY-MM-DD */
  activityDate: string
  /** 일정에 연결된 기록이면 그 회차 제목. */
  scheduleTitle?: string | null
  /** 인증 완료(APPROVED)면 수정 요청을 받지 않는다. */
  status: ClubActivityStatus
  attended: boolean
  /** 내가 낸 수정 요청이 처리 대기 중이다. */
  fixRequestPending: boolean
}

export type ClubFixRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

/** 리더가 처리할 출석 수정 요청. 서버 `ClubFixRequestResponse`. */
export interface ClubFixRequest {
  id: number
  activityId: number
  /** YYYY-MM-DD */
  activityDate: string
  /** 인증 완료(APPROVED)면 수락할 수 없다(거절만). */
  activityStatus: ClubActivityStatus
  userId: number
  userName: string
  /** 지금 기록된 출석. 요청자가 명단에서 빠졌으면(활동일 변경) 없다 — 수락할 수 없다. */
  currentAttended?: boolean | null
  /** 수락하면 출석이 이 값이 된다. */
  requestedAttended: boolean
  reason?: string | null
  status: ClubFixRequestStatus
  createdAt: string
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
