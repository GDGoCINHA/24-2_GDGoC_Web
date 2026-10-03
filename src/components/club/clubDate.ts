/**
 * 소모임 날짜 표시. 모임은 한국에서 하므로 보는 사람의 브라우저 시간대와 무관하게 한국 시간으로 보여 준다.
 */
const KST = 'Asia/Seoul'
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 활동일 2026-10-07 → 2026.10.07 (수). 날짜만 있는 값이라 시간대 변환 없이 읽는다. */
export const formatActivityDate = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${date.replaceAll('-', '.')} (${weekday})`
}

/** ISO 시각의 한국 날짜와 시각. 'sv-SE' 는 "YYYY-MM-DD HH:mm:ss" 로 찍는다. */
const kstParts = (iso: string) => {
  const [date, time] = new Date(iso).toLocaleString('sv-SE', { timeZone: KST }).split(' ')
  return { date, time: time.slice(0, 5) }
}

/** 일정 시각 → 10.07 (수) 19:00 */
export const formatScheduleTime = (iso: string): string => {
  const { date, time } = kstParts(iso)
  return `${formatActivityDate(date).slice(5)} ${time}`
}

/** 일정의 한국 날짜 (YYYY-MM-DD). 활동 기록의 활동일 기본값으로 쓴다. */
export const kstDateOf = (iso: string): string => kstParts(iso).date

/** ISO 시각 → `<input type="datetime-local">` 값 (한국 시간, YYYY-MM-DDTHH:mm). */
export const toKstInputValue = (iso: string): string => {
  const { date, time } = kstParts(iso)
  return `${date}T${time}`
}

/** `<input type="datetime-local">` 값을 한국 시간으로 읽어 ISO 시각으로. */
export const fromKstInputValue = (value: string): string =>
  new Date(`${value}:00+09:00`).toISOString()
