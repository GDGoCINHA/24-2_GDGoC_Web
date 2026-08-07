'use client'

import Link from 'next/link'
import { GdgButton, GdgLogo } from '@/components/ui/design-system'
import Loader from '@/components/ui/common/Loader'
import { useRecruitMemberPeriod } from '@/hooks/useRecruitMemberPeriod'
import { formatKoreanDate, formatKoreanPeriod } from '@/constant/recruitSchedule'

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

          <div className="space-y-2">
            <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">모집 일정</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
              {formatKoreanPeriod(openAt, closeAt)} 23:59:59
            </div>
          </div>

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
 * 부원 지원 폼을 모집 기간 밖에서 가린다. RecruitCoreGate 와 같은 역할이다.
 *
 * 코어와 달리 ApiCodeGuard 로 감싸지 않는다. 부원 지원은 원래 비로그인으로 받는다.
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
