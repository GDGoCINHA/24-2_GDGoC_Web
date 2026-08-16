/**
 * 모집 일정 표시용 텍스트.
 *
 * 실제 지원 가능 여부(게이팅)는 서버가 판정한다 — `app.recruit.core.*` 와 `app.recruit.member.*`.
 * 여기 값은 서버 응답을 못 받았을 때 쓰는 대체 문구다. 2차 모집 때 서버 환경변수만 바꾸면
 * 게이팅은 열리지만 아래 문구는 그대로이므로, **일정이 바뀌면 서버 설정과 이 파일을 함께 고친다.**
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

export const CORE_SCHEDULE = {
  /** 서버 응답을 못 받았을 때만 쓰는 대체값. 서버 설정(app.recruit.core.*)과 함께 고친다. */
  fallbackOpenAt: '2026-08-10T00:00:00+09:00',
  fallbackCloseAt: '2026-09-08T23:59:59+09:00',
  documentResult: '2026. 9. 8.(화) 23:59',
  interview: '2026. 9. 9.(수) - 2026. 9. 13.(일)',
  interviewNote: '※ 지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.',
  finalResult: '2026. 9. 13.(일)',
  meetingNote: '※ 일정은 9월 내로 공지 드립니다.'
} as const

export const MEMBER_SCHEDULE = {
  /** 서버 응답을 못 받았을 때만 쓰는 대체값. 서버 설정(app.recruit.member.*)과 함께 고친다. */
  openAt: '2026-08-17T00:00:00+09:00',
  closeAt: '2026-09-09T23:59:59+09:00'
} as const
