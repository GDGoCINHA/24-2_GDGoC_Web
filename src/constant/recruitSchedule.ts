/**
 * 모집 일정 표시용 텍스트.
 *
 * 실제 지원 가능 여부(게이팅)는 서버가 판정한다 — `app.recruit.core.open-at` / `close-at`.
 * 여기 값은 화면에 보이는 문구일 뿐이다. 2차 모집 때 서버 환경변수만 바꾸면 게이팅은
 * 열리지만 아래 문구는 그대로이므로, **일정이 바뀌면 서버 설정과 이 파일을 함께 고친다.**
 *
 * 단, 서류 지원 기간은 RecruitScheduleCard 가 서버 응답으로 렌더할 수 있다.
 * 그 경우 CORE_SCHEDULE.application 은 서버 응답을 못 받았을 때의 대체값으로만 쓰인다.
 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** ISO 문자열을 KST 기준 `2026. 8. 10.(월)` 로 만든다. 보는 사람의 시간대와 무관하다. */
export function formatKoreanDate(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000)
  return `${kst.getUTCFullYear()}. ${kst.getUTCMonth() + 1}. ${kst.getUTCDate()}.(${WEEKDAYS[kst.getUTCDay()]})`
}

export const CORE_SCHEDULE = {
  application: '2026. 8. 10.(월) - 2026. 8. 30.(일) 23:59:59',
  documentResult: '~ 2026. 8. 31.(월)',
  interview: '2026. 9. 1.(화) - 2026. 9. 5.(토)',
  interviewNote: '※ 지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.',
  finalResult: '~ 2026. 9. 6.(일)',
  meetingNote: '※ 일정은 9월 내로 공지 드립니다.'
} as const

export const MEMBER_SCHEDULE = {
  intensive: '8/17 ~ 9/9'
} as const
