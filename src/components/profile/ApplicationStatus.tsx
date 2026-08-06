'use client'

import type { ApplicationStatusValue, MyCoreApplication } from '@/types/profile'
import { cn } from '@/utils/cn'

const STATUS_CLASS: Record<ApplicationStatusValue, string> = {
  SUBMITTED: 'bg-blue text-white',
  IN_REVIEW: 'bg-yellow text-black',
  ACCEPTED: 'bg-green text-white',
  REJECTED: 'bg-red text-white'
}

const STATUS_LABEL: Record<ApplicationStatusValue, string> = {
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN-REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

interface ApplicationStatusProps {
  application: MyCoreApplication | null
  loading?: boolean
  error?: string | null
}

export default function ApplicationStatus({
  application,
  loading = false,
  error = null
}: ApplicationStatusProps) {
  return (
    <section className="space-y-4">
      <h2 className="typo-pc-h4 text-white">활동 및 신청 현황</h2>

      {loading ? (
        <p className="typo-pc-b3 text-gray-700">불러오는 중…</p>
      ) : error ? (
        <p className="typo-pc-b3 text-red">{error}</p>
      ) : application ? (
        <div className="flex items-center overflow-hidden rounded-full bg-gray-100/30">
          <span className="flex-1 px-5 py-3 typo-pc-b3 text-gray-700">운영진 지원서</span>
          <span
            className={cn(
              'min-w-[140px] px-5 py-3 text-center typo-pc-b3',
              STATUS_CLASS[application.resultStatus]
            )}
          >
            {STATUS_LABEL[application.resultStatus]}
          </span>
        </div>
      ) : (
        <p className="typo-pc-b3 text-gray-700">제출한 지원서가 없습니다.</p>
      )}
    </section>
  )
}
