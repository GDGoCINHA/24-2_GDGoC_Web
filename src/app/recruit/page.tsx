'use client'

import { GdgLogo } from '@/components/ui/design-system'
import { RecruitTypeRow } from '@/components/recruit/RecruitTypeRow'
import { useRecruitCorePeriod } from '@/hooks/useRecruitCorePeriod'
import { useRecruitMemberPeriod } from '@/hooks/useRecruitMemberPeriod'
import {
  CORE_SCHEDULE,
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

  // 부원은 코어와 달리 상시 모집이다. 서버 close-at 이 학기 말까지 열려 있어 그 값을
  // 띠에 그대로 그리면 '8. 17. ~ 1. 31.' 로 나온다. 날짜를 아예 달지 않고 상태 판정에만 쓴다.
  const memberUnknown = memberFailed || !memberPeriod
  const memberOpen = memberUnknown || memberPeriod.status === 'OPEN'
  const memberStatusLabel = memberUnknown
    ? '상시 모집 중'
    : memberPeriod.status === 'OPEN'
      ? '상시 모집 중'
      : memberPeriod.status === 'BEFORE_OPEN'
        ? `${formatKoreanDateShort(memberPeriod.openAt)} 오픈`
        : '모집 마감'

  return (
    <main className="mx-auto w-full max-w-[1120px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
      <div className="flex items-center gap-3">
        <GdgLogo mode="auto" />
        <h1 className="text-[clamp(26px,3vw,38px)] font-semibold leading-[1.24] tracking-[-0.03em]">
          GDGoC INHA 2026-2
        </h1>
      </div>
      <p className="mt-3.5 text-base text-dusk-ink-600">지원 종류를 선택해 주세요.</p>

      {/* 띠는 border-top 만 갖는다. 마지막 줄 아래를 이 묶음이 닫는다. */}
      <div className="mt-10 border-b border-[rgba(240,234,228,0.14)]">
        <RecruitTypeRow
          index="01"
          title="Core"
          subtitle="운영진 · 서류 후 면접"
          period={corePeriodText}
          href="/recruit/core"
          statusLabel={coreStatusLabel}
          isOpen={coreOpen}
          accent="core"
        />
        <RecruitTypeRow
          index="02"
          title="Member"
          subtitle="부원 · 면접 없이 지원서로 합류"
          href="/recruit/member"
          statusLabel={memberStatusLabel}
          isOpen={memberOpen}
          accent="member"
        />
      </div>

      <p className="mt-7 text-[13px] leading-[1.8] text-dusk-ink-800">
        ※ 부원은 학기 중 상시 모집입니다. 실제 지원 가능 여부는 서버에서 판정합니다.
      </p>
    </main>
  )
}
