'use client'

import { resolveMemberSchedule, type MemberScheduleView } from '@/constant/recruitSchedule'
import { useRecruitMemberPeriod } from '@/hooks/useRecruitMemberPeriod'

/**
 * 화면에 그대로 그릴 수 있는 집중 모집 기간.
 *
 * 서버가 준 값이 있으면 그걸 쓰고, 없으면 번들 상수가 그대로 보인다. 조회에 실패해도
 * 마찬가지라 화면이 비지 않는다 — 다만 마지막 배포 시점의 일정이 보인다는 뜻이다.
 *
 * 운영진 쪽은 이런 훅을 두지 않는다. 부르는 곳마다 접수 기간까지 함께 필요해서
 * `useRecruitCorePeriod` + `resolveCoreSchedule` 를 직접 쓰는 편이 짧다.
 */
export function useMemberSchedule(): MemberScheduleView {
  const { period } = useRecruitMemberPeriod()
  return resolveMemberSchedule(period?.notice)
}
