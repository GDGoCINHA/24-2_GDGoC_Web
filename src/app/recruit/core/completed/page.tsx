'use client'

import { useSearchParams } from 'next/navigation'

import { RecruitNotice } from '@/components/recruit/RecruitNotice'
import { RecruitScheduleCard } from '@/components/recruit/RecruitScheduleCard'

export default function RecruitCoreCompleted() {
  const searchParams = useSearchParams()
  const isClosed = searchParams.get('status') === 'closed'

  return (
    <RecruitNotice
      title={isClosed ? 'Core Member 지원 마감' : 'Core Member 지원 완료'}
      message={
        isClosed
          ? '코어 지원 기간이 종료되어 더 이상 지원서를 제출할 수 없습니다.'
          : '지원이 정상적으로 완료되었습니다. 이후 일정은 아래 안내를 확인해 주세요.'
      }
    >
      <RecruitScheduleCard />
    </RecruitNotice>
  )
}
