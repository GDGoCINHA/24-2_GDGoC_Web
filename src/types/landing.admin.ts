import type { RecruitScheduleNotice } from '@/constant/recruitSchedule'

export type RecruitType = 'CORE' | 'MEMBER'

/**
 * 관리자 화면이 보는 모집 기간.
 *
 * `overridden` 이 false 면 서버 설정값을 쓰고 있다는 뜻이다. 이걸 알아야 '내가 저장한 값이
 * 먹고 있는지'와 '설정값으로 되돌리기'가 의미를 갖는다.
 *
 * `notice` 는 화면에만 쓰는 안내 일정이라 `overridden` 과 무관하게 비어 있을 수 있다 —
 * 기간은 설정값을 쓰면서 발표 날짜만 저장해 둘 수 있다.
 */
export type RecruitPeriodAdmin = {
  openAt: string
  closeAt: string
  overridden: boolean
  notice?: RecruitScheduleNotice | null
}

/** 저장 요청. 기간은 필수, 안내 일정은 비워서 보낼 수 있다. */
export type RecruitPeriodUpdate = {
  openAt: string
  closeAt: string
} & Partial<RecruitScheduleNotice>
