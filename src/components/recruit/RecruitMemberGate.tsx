'use client'

import { RecruitNotice } from '@/components/recruit/RecruitNotice'
import Loader from '@/components/ui/common/Loader'
import { formatKoreanDate, formatKoreanPeriod } from '@/constant/recruitSchedule'
import { useRecruitMemberPeriod } from '@/hooks/useRecruitMemberPeriod'

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
      <section>
        <h2 className="text-[15px] font-medium text-dusk-ink-200">모집 일정</h2>
        <p className="mt-3 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px] text-[15px]">
          {formatKoreanPeriod(openAt, closeAt)} 23:59:59
        </p>
      </section>
    </RecruitNotice>
  )
}

/**
 * 부원 지원 폼을 모집 기간 밖에서 가린다. RecruitCoreGate 와 같은 역할이다.
 *
 * 코어와 달리 ApiCodeGuard 로 감싸지 않는다. 지원에 로그인이 필요한 것은 같지만, 여기서
 * 로그인으로 튕기면 모집 기간 안내조차 못 보고 나간다. 로그인 확인은 이 게이트를 통과한
 * 뒤 페이지 안에서 한다.
 *
 * 카드(`/recruit`)의 버튼만 잠그면 주소를 직접 치고 들어온 사람은 폼을 다 채운 뒤
 * 제출에서 403 을 만난다. 서버가 막으니 데이터는 안전하지만 그 경험이 나쁘다.
 *
 * RecruitScheduleCard 는 면접·운영진 회의 안내가 붙어 있어 부원에는 맞지 않는다.
 * 그래서 기간만 보여준다.
 */
export default function RecruitMemberGate({ children }: { children: React.ReactNode }) {
  const { period, loading, failed } = useRecruitMemberPeriod()

  if (loading) return <Loader />

  // 조회에 실패하면 폼을 연다. 제출은 서버가 최종 판정하므로 안전하고,
  // 반대로 닫으면 API 일시 장애가 곧 지원 불가가 된다. 코어와 같은 판단이다.
  if (failed || !period) return <>{children}</>

  if (period.status === 'BEFORE_OPEN') {
    return (
      <NoticeScreen
        title="Member 모집 예정"
        message={`${formatKoreanDate(period.openAt)}부터 지원서를 받습니다.`}
        openAt={period.openAt}
        closeAt={period.closeAt}
      />
    )
  }

  if (period.status === 'CLOSED') {
    return (
      <NoticeScreen
        title="Member 지원 마감"
        message="부원 지원 기간이 종료되어 더 이상 지원서를 제출할 수 없습니다."
        openAt={period.openAt}
        closeAt={period.closeAt}
      />
    )
  }

  return <>{children}</>
}
