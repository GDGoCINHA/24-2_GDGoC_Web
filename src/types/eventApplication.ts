import type { UserRoleValue } from '@/types/profile'

/**
 * 질문 유형. 서버의 QuestionType 과 값을 맞춘다.
 *
 * 자동 생성 파이프라인이 없으므로 서버에 유형이 늘면 여기도 손으로 늘려야 한다.
 * 그때까지 렌더러는 모르는 유형을 만나면 화면을 죽이지 말고 안내 문구로 대체한다
 * (UnsupportedQuestion). 서버를 먼저 배포하는 순서에서 안전하려면 이 규칙이 필요하다.
 */
export type QuestionType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'DROPDOWN'
  | 'FILE'
  | 'AGREEMENT'

export const QUESTION_TYPES: QuestionType[] = [
  'SHORT_TEXT',
  'LONG_TEXT',
  'NUMBER',
  'DATE',
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'DROPDOWN',
  'FILE',
  'AGREEMENT'
]

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SHORT_TEXT: '단답형',
  LONG_TEXT: '장문형',
  NUMBER: '숫자',
  DATE: '날짜',
  SINGLE_CHOICE: '객관식 (하나)',
  MULTI_CHOICE: '체크박스 (복수)',
  DROPDOWN: '드롭다운',
  FILE: '파일 첨부',
  AGREEMENT: '동의 여부'
}

/** 선택지가 있어야 하는 유형. 서버 QuestionType.requiresOptions 와 같다. */
export const TYPES_WITH_OPTIONS: QuestionType[] = ['SINGLE_CHOICE', 'MULTI_CHOICE', 'DROPDOWN']

/** 다른 질문의 표시 조건에서 기준이 될 수 있는 유형. 서버 usableAsCondition 과 같다. */
export const TYPES_USABLE_AS_CONDITION: QuestionType[] = [
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'DROPDOWN',
  'AGREEMENT'
]

export type ApplicationStatus = 'APPLIED' | 'CANCELED'
export type EventAttendanceStatus = 'PENDING' | 'ATTENDED' | 'NO_SHOW'

export const ATTENDANCE_LABEL: Record<EventAttendanceStatus, string> = {
  PENDING: '미확인',
  ATTENDED: '참석',
  NO_SHOW: '불참'
}

/** 답변 값. 유형에 따라 모양이 다르다. */
export type AnswerValue = string | number | boolean | string[] | null

export interface QuestionOption {
  value: string
  label: string
}

export interface FormQuestion {
  id: number
  type: QuestionType
  label: string
  helpText: string | null
  isRequired: boolean
  sortOrder: number
  options: QuestionOption[] | null
  /** 조건부 표시의 기준 질문. null 이면 항상 보인다. */
  visibleWhenQuestionId: number | null
  visibleWhenValues: string[] | null
}

/** 운영진이 보는 폼. appliedCount 가 1 이상이면 고칠 수 있는 범위가 좁아진다. */
export interface EventForm {
  id: number
  eventBoardId: number
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  opensAt: string | null
  closesAt: string | null
  capacity: number | null
  minRole: UserRoleValue
  isOpen: boolean
  appliedCount: number
  questions: FormQuestion[]
}

export interface MyApplicationSummary {
  status: ApplicationStatus
  attendanceStatus: EventAttendanceStatus
  appliedAt: string
  answers: Record<string, AnswerValue>
}

/**
 * 부원이 보는 폼.
 *
 * canApply 와 blockedReason 은 서버가 판정해서 내려준다. 같은 판정을 화면에서 다시 하면
 * 서버와 어긋나므로 그대로 쓴다.
 */
export interface PublicEventForm {
  eventBoardId: number
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  opensAt: string | null
  closesAt: string | null
  capacity: number | null
  appliedCount: number
  remainingSeats: number | null
  canApply: boolean
  blockedReason: string | null
  questions: FormQuestion[]
  myApplication: MyApplicationSummary | null
}

export interface Applicant {
  applicationId: number
  userId: number
  name: string
  studentId: string
  major: string
  email: string
  phoneNumber: string
  status: ApplicationStatus
  attendanceStatus: EventAttendanceStatus
  appliedAt: string
  canceledAt: string | null
  /** 값이 있으면 QR 로 체크인한 것이고, 비어 있는데 참석이면 운영진이 수기로 찍은 것이다. */
  checkedInAt: string | null
  answers: Record<string, AnswerValue>
}

export interface MyActivity {
  applicationId: number
  eventBoardId: number
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  appliedAt: string
  attendanceStatus: EventAttendanceStatus
}

export interface CheckinResult {
  alreadyCheckedIn: boolean
  checkedInAt: string
  eventTitle: string
}

export interface CheckinToken {
  eventBoardId: number
  token: string
  expiresInSeconds: number
}

/** capacity 를 다시 무제한으로 되돌리려면 clearCapacity 를 보낸다. null 만으로는 '안 바꿈'과 구분되지 않는다. */
export interface EventFormSavePayload {
  opensAt?: string | null
  closesAt?: string | null
  capacity?: number | null
  clearCapacity?: boolean
  minRole?: UserRoleValue
  isOpen?: boolean
}

export interface QuestionSavePayload {
  type: QuestionType
  label: string
  helpText?: string | null
  isRequired: boolean
  options?: QuestionOption[] | null
  visibleWhenQuestionId?: number | null
  visibleWhenValues?: string[] | null
  /** 수정에서 조건을 없앨 때 보낸다. */
  clearCondition?: boolean
}

export interface AnswerEntry {
  questionId: number
  value: AnswerValue
}
