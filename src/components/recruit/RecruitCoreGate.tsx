'use client'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import { RecruitNotice } from '@/components/recruit/RecruitNotice'
import { RecruitScheduleCard } from '@/components/recruit/RecruitScheduleCard'
import Loader from '@/components/ui/common/Loader'
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
    <RecruitNotice title={title} message={message}>
      <RecruitScheduleCard applicationPeriod={{ openAt, closeAt }} />
    </RecruitNotice>
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
