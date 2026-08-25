/**
 * 모집 일정 표시용 텍스트.
 *
 * 실제 지원 가능 여부(게이팅)는 서버가 판정한다 — `app.recruit.core.*` 와 `app.recruit.member.*`.
 * 여기 값은 서버 응답을 못 받았을 때 쓰는 대체 문구다.
 *
 * 발표·면접 날짜는 관리자 화면(`/dashboard/landing/` 모집 일정 탭)에서 고친다. 서버가 값을
 * 내려주면 그것을 쓰고, 비어 있으면 아래 상수가 그대로 보인다 — `resolveCoreSchedule` 참고.
 * 그래서 **여기 상수를 고쳐야 하는 경우는 배포 시점의 바닥값을 바꿀 때뿐이다.**
 *
 * 날짜는 전부 ISO 문자열로 두고 아래 포맷터를 거친다. 서버가 준 타임스탬프와 이 파일의
 * 상수가 각자 따로 문자열을 들고 있으면 포맷이 갈린다.
 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** ISO 문자열을 KST 기준으로 해석한다. 보는 사람의 시간대와 무관하다. */
function toKst(iso: string): Date {
  return new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000)
}

/** `2026. 8. 10.(월)` — 상세 일정 안내용. */
export function formatKoreanDate(iso: string): string {
  const d = toKst(iso)
  return `${d.getUTCFullYear()}. ${d.getUTCMonth() + 1}. ${d.getUTCDate()}.(${WEEKDAYS[d.getUTCDay()]})`
}

/**
 * `2026. 9. 8.(화) 23:59` — 시각까지 정해진 발표·마감용.
 *
 * 자정이면 시각을 붙이지 않는다. 관리자가 날짜만 정하고 시각은 신경 쓰지 않았을 때
 * `2026. 9. 13.(일) 00:00` 이 뜨면 그 시각에 뭔가 있는 것처럼 읽힌다.
 */
export function formatKoreanDateTime(iso: string): string {
  const d = toKst(iso)
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes()
  if (hours === 0 && minutes === 0) return formatKoreanDate(iso)

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${formatKoreanDate(iso)} ${pad(hours)}:${pad(minutes)}`
}

/** `8. 10.(월)` — 연도를 뺀 축약형. 카드처럼 폭이 좁은 곳에 쓴다. */
export function formatKoreanDateShort(iso: string): string {
  const d = toKst(iso)
  return `${d.getUTCMonth() + 1}. ${d.getUTCDate()}.(${WEEKDAYS[d.getUTCDay()]})`
}

/** `2026. 8. 10.(월) - 2026. 8. 30.(일)` */
export function formatKoreanPeriod(openAt: string, closeAt: string): string {
  return `${formatKoreanDate(openAt)} - ${formatKoreanDate(closeAt)}`
}

/** `8. 10.(월) ~ 8. 30.(일)` */
export function formatKoreanPeriodShort(openAt: string, closeAt: string): string {
  return `${formatKoreanDateShort(openAt)} ~ ${formatKoreanDateShort(closeAt)}`
}

/**
 * 서버가 내려주는 안내 일정. 관리자가 저장하지 않은 칸은 `null` 이다.
 *
 * 서버의 `RecruitScheduleNotice` 와 같은 모양이다 — **한쪽을 바꾸면 반대쪽도 같은 작업에서
 * 고쳐야 한다.** 지원 창구를 여닫는 `openAt`/`closeAt` 과 달리 이 값은 화면 문구일 뿐이라
 * 전부 비어 있어도 정상이다.
 */
export type RecruitScheduleNotice = {
  documentResultAt: string | null
  interviewOpenAt: string | null
  interviewCloseAt: string | null
  finalResultAt: string | null
  interviewNote: string | null
  meetingNote: string | null
  intensiveOpenAt: string | null
  intensiveCloseAt: string | null
}

export const CORE_SCHEDULE = {
  /** 서버 응답을 못 받았을 때만 쓰는 대체값. 서버 설정(app.recruit.core.*)과 함께 고친다. */
  fallbackOpenAt: '2026-08-10T00:00:00+09:00',
  fallbackCloseAt: '2026-09-08T23:59:59+09:00',
  documentResultAt: '2026-09-08T23:59:59+09:00',
  interviewOpenAt: '2026-09-09T00:00:00+09:00',
  interviewCloseAt: '2026-09-13T23:59:59+09:00',
  finalResultAt: '2026-09-13T00:00:00+09:00',
  /** 안내 문구는 앞의 `※` 없이 둔다. 붙이는 건 화면이 한다 — 두 번 찍히지 않게. */
  interviewNote: '지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.',
  meetingNote: '일정은 9월 내로 공지 드립니다.'
} as const

/**
 * 부원 모집은 **상시 모집**이다. 아래 두 값은 화면에 안내하는 **집중 모집 기간**일 뿐,
 * 지원 가능 여부와는 무관하다 — 게이팅은 서버가 `app.recruit.member.*` 로 판정하고
 * 그 close-at 은 학기 말까지 열려 있다.
 *
 * 그래서 여기 값을 서버 응답의 대체값으로 쓰지 않는다. 서버 기간을 그대로 그리면
 * 카드에 '8. 17.(월) ~ 1. 31.(일)' 이 뜬다.
 */
export const MEMBER_SCHEDULE = {
  intensiveOpenAt: '2026-08-17T00:00:00+09:00',
  intensiveCloseAt: '2026-09-09T23:59:59+09:00'
} as const

/** 화면이 그대로 쓸 수 있게 다듬은 운영진 일정. */
export type CoreScheduleView = {
  /** `2026. 9. 8.(화) 23:59` */
  documentResult: string
  interviewOpenAt: string
  interviewCloseAt: string
  /** `2026. 9. 9.(수) - 2026. 9. 13.(일)` */
  interview: string
  /** `2026. 9. 13.(일)` */
  finalResult: string
  /** 앞의 `※` 는 붙어 있지 않다. */
  interviewNote: string
  meetingNote: string
}

export type MemberScheduleView = {
  intensiveOpenAt: string
  intensiveCloseAt: string
}

/**
 * 서버가 준 안내 일정을 화면 문구로 바꾼다. 비어 있는 칸은 번들 상수로 메운다.
 *
 * 칸마다 따로 메우는 이유는 관리자가 일부만 채워도 나머지가 멀쩡히 보여야 하기 때문이다.
 * 하나라도 비면 통째로 상수를 쓰게 하면, 방금 저장한 값이 화면에 안 나타난다.
 */
export function resolveCoreSchedule(notice?: RecruitScheduleNotice | null): CoreScheduleView {
  const documentResultAt = notice?.documentResultAt ?? CORE_SCHEDULE.documentResultAt
  const interviewOpenAt = notice?.interviewOpenAt ?? CORE_SCHEDULE.interviewOpenAt
  const interviewCloseAt = notice?.interviewCloseAt ?? CORE_SCHEDULE.interviewCloseAt
  const finalResultAt = notice?.finalResultAt ?? CORE_SCHEDULE.finalResultAt

  return {
    documentResult: formatKoreanDateTime(documentResultAt),
    interviewOpenAt,
    interviewCloseAt,
    interview: formatKoreanPeriod(interviewOpenAt, interviewCloseAt),
    finalResult: formatKoreanDateTime(finalResultAt),
    interviewNote: notice?.interviewNote ?? CORE_SCHEDULE.interviewNote,
    meetingNote: notice?.meetingNote ?? CORE_SCHEDULE.meetingNote
  }
}

export function resolveMemberSchedule(notice?: RecruitScheduleNotice | null): MemberScheduleView {
  return {
    intensiveOpenAt: notice?.intensiveOpenAt ?? MEMBER_SCHEDULE.intensiveOpenAt,
    intensiveCloseAt: notice?.intensiveCloseAt ?? MEMBER_SCHEDULE.intensiveCloseAt
  }
}
