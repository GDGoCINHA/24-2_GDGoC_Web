'use client'

import { GdgLogo } from '@/components/ui/design-system'
import { RecruitTypeCard } from '@/components/recruit/RecruitTypeCard'
import { useRecruitCorePeriod } from '@/hooks/useRecruitCorePeriod'
import { CORE_SCHEDULE, MEMBER_SCHEDULE, formatKoreanDate } from '@/constant/recruitSchedule'

export default function RecruitSelect() {
  const { period, failed } = useRecruitCorePeriod()

  // 조회에 실패하면 열어둔다. 제출은 서버가 최종 판정하므로 안전하다.
  const coreUnknown = failed || !period
  const coreOpen = coreUnknown || period.status === 'OPEN'
  const coreStatusLabel = coreUnknown
    ? '모집중'
    : period.status === 'OPEN'
      ? '모집중'
      : period.status === 'BEFORE_OPEN'
        ? `${formatKoreanDate(period.openAt)} 오픈`
        : '모집 마감'
  const corePeriodText = period
    ? `${formatKoreanDate(period.openAt)} - ${formatKoreanDate(period.closeAt)}`
    : CORE_SCHEDULE.application

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

        <div className="col-span-4 grid grid-cols-2 gap-5 mobile:grid-cols-1 mobile:gap-4">
          <RecruitTypeCard
            title="Core"
            subtitle="운영진"
            period={corePeriodText}
            href="/recruit/core"
            statusLabel={coreStatusLabel}
            isOpen={coreOpen}
          />
          {/* 부원 모집은 서버에 기간 차단 로직이 없어 상시 지원 가능하다. 항상 열어둔다. */}
          <RecruitTypeCard
            title="Member"
            subtitle="부원"
            period={MEMBER_SCHEDULE.intensive}
            href="/recruit/member"
            statusLabel="모집중"
            isOpen
          />
        </div>
      </div>
    </main>
  )
}
