'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GdgLogo, GdgButton } from '@/components/ui/design-system'
import { RecruitScheduleCard } from '@/components/recruit/RecruitScheduleCard'

export default function RecruitCoreCompleted() {
  const searchParams = useSearchParams()
  const isClosed = searchParams.get('status') === 'closed'

  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <div className="relative z-10 pt-18 pb-32 mobile:pt-12 mobile:pb-24 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-10">
        {/* Header */}
        <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
          <GdgLogo mode="auto" />
          <h1 className="typo-pc-h3 text-white mobile:typo-m-h2">
            {isClosed ? 'Core Member 지원 마감' : 'Core Member 지원 완료'}
          </h1>
        </div>

        <div className="col-span-4 flex flex-col gap-10 w-full">
          <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
            {isClosed
              ? '코어 지원 기간이 종료되어 더 이상 지원서를 제출할 수 없습니다.'
              : '지원이 정상적으로 완료되었습니다. 이후 일정은 아래 안내를 확인해 주세요.'}
          </div>

          <RecruitScheduleCard />

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
