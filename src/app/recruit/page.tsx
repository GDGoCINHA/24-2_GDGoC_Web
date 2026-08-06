'use client'

import { GdgLogo } from '@/components/ui/design-system'
import { RecruitTypeCard } from '@/components/recruit/RecruitTypeCard'
import { useRecruitCorePeriod } from '@/hooks/useRecruitCorePeriod'
import { useRecruitMemberPeriod } from '@/hooks/useRecruitMemberPeriod'
import {
  CORE_SCHEDULE,
  MEMBER_SCHEDULE,
  formatKoreanDateShort,
  formatKoreanPeriodShort
} from '@/constant/recruitSchedule'

export default function RecruitSelect() {
  const { period, failed } = useRecruitCorePeriod()
  const { period: memberPeriod, failed: memberFailed } = useRecruitMemberPeriod()

  // 조회에 실패하면 열어둔다. 제출은 서버가 최종 판정하므로 안전하다.
  const coreUnknown = failed || !period
  const coreOpen = coreUnknown || period.status === 'OPEN'
  const coreStatusLabel = coreUnknown
    ? '모집중'
    : period.status === 'OPEN'
      ? '모집중'
      : period.status === 'BEFORE_OPEN'
        ? `${formatKoreanDateShort(period.openAt)} 오픈`
        : '모집 마감'
  const corePeriodText = period
    ? formatKoreanPeriodShort(period.openAt, period.closeAt)
    : formatKoreanPeriodShort(CORE_SCHEDULE.fallbackOpenAt, CORE_SCHEDULE.fallbackCloseAt)

  // 부원도 코어와 같은 규칙이다. 전에는 서버에 기간이 없어 항상 열어뒀다.
  const memberUnknown = memberFailed || !memberPeriod
  const memberOpen = memberUnknown || memberPeriod.status === 'OPEN'
  const memberStatusLabel = memberUnknown
    ? '모집중'
    : memberPeriod.status === 'OPEN'
      ? '모집중'
      : memberPeriod.status === 'BEFORE_OPEN'
        ? `${formatKoreanDateShort(memberPeriod.openAt)} 오픈`
        : '모집 마감'
  const memberPeriodText = memberPeriod
    ? formatKoreanPeriodShort(memberPeriod.openAt, memberPeriod.closeAt)
    : formatKoreanPeriodShort(MEMBER_SCHEDULE.openAt, MEMBER_SCHEDULE.closeAt)

  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <div className="relative z-10 pt-18 pb-32 mobile:pt-12 mobile:pb-24 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-10">
        <div className="col-span-4 flex flex-col gap-3 mobile:gap-2">
          <div className="flex items-center gap-3 mobile:gap-2">
            <GdgLogo mode="auto" />
            <h1 className="typo-pc-h3 text-white mobile:typo-m-h2">GDGoC INHA 2026-2</h1>
          </div>
          <p className="typo-pc-b2 text-gray-700 mobile:typo-m-b3">지원 종류를 선택해 주세요.</p>
        </div>

        <div className="col-span-4 grid grid-cols-2 items-stretch gap-5 mobile:grid-cols-1 mobile:gap-4">
          <RecruitTypeCard
            title="Core"
            subtitle="운영진"
            period={corePeriodText}
            href="/recruit/core"
            statusLabel={coreStatusLabel}
            isOpen={coreOpen}
          />
          <RecruitTypeCard
            title="Member"
            subtitle="부원"
            period={memberPeriodText}
            href="/recruit/member"
            statusLabel={memberStatusLabel}
            isOpen={memberOpen}
          />
        </div>
      </div>
    </main>
  )
}
