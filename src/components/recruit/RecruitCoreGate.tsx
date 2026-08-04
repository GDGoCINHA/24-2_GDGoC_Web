'use client'

import Link from 'next/link'
import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import { GdgButton, GdgLogo } from '@/components/ui/design-system'
import Loader from '@/components/ui/common/Loader'
import { RecruitScheduleCard } from '@/components/recruit/RecruitScheduleCard'
import { useRecruitCorePeriod } from '@/hooks/useRecruitCorePeriod'
import { formatKoreanDate } from '@/constant/recruitSchedule'

function NoticeScreen({
  title,
  message,
  openAt,
  closeAt
}: {
  title: string
  message: string
  openAt: string
  closeAt: string
}) {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <div className="relative z-10 pt-18 pb-32 mobile:pt-12 mobile:pb-24 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-10">
        <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
          <GdgLogo mode="auto" />
          <h1 className="typo-pc-h3 text-white mobile:typo-m-h2">{title}</h1>
        </div>

        <div className="col-span-4 flex flex-col gap-10 w-full">
          <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
            {message}
          </div>

          <RecruitScheduleCard applicationPeriod={{ openAt, closeAt }} />

          <div className="flex justify-end pt-4">
            <Link href="/">
              <GdgButton variant="active" size="small">
                홈으로 이동
              </GdgButton>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * 모집 기간을 로그인보다 **먼저** 판정한다.
 *
 * 모집이 시작되지 않았는데 로그인부터 요구하는 건 어색하고, 비로그인 사용자도
 * 일정은 볼 수 있어야 한다. 그래서 ApiCodeGuard 를 이 안쪽에 둔다.
 */
export default function RecruitCoreGate({ children }: { children: React.ReactNode }) {
  const { period, loading, failed } = useRecruitCorePeriod()

  if (loading) return <Loader />

  // 조회에 실패하면 폼을 연다. 제출은 서버가 최종 판정하므로 안전하고,
  // 반대로 닫으면 API 일시 장애가 곧 지원 불가가 된다.
  if (failed || !period) {
    return (
      <ApiCodeGuard requiredRole="GUEST" nextOverride="/recruit/core">
        {children}
      </ApiCodeGuard>
    )
  }

  if (period.status === 'BEFORE_OPEN') {
    return (
      <NoticeScreen
        title="Core Member 모집 예정"
        message={`${formatKoreanDate(period.openAt)}부터 지원서를 받습니다. 아래 일정을 확인해 주세요.`}
        openAt={period.openAt}
        closeAt={period.closeAt}
      />
    )
  }

  if (period.status === 'CLOSED') {
    return (
      <NoticeScreen
        title="Core Member 지원 마감"
        message="코어 지원 기간이 종료되어 더 이상 지원서를 제출할 수 없습니다."
        openAt={period.openAt}
        closeAt={period.closeAt}
      />
    )
  }

  return (
    <ApiCodeGuard requiredRole="GUEST" nextOverride="/recruit/core">
      {children}
    </ApiCodeGuard>
  )
}
