'use client'

import type {
  ApplicationStatusValue,
  MyCoreApplication,
  MyMemberApplication
} from '@/types/profile'
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

/** 클릭하면 지원서 내용을 펼친다. 전에는 상태만 보이고 눌러도 아무 일이 없었다. */
function ApplicationRow({
  label,
  statusLabel,
  statusClass,
  onClick
}: {
  label: string
  statusLabel: string
  statusClass: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center overflow-hidden rounded-full bg-gray-100/30 text-left transition hover:bg-gray-100/50"
    >
      <span className="flex-1 px-5 py-3 typo-pc-b3 text-gray-700">{label}</span>
      <span className="px-2 typo-pc-c2 text-gray-700" aria-hidden>
        내용 보기
      </span>
      <span className={cn('min-w-[140px] px-5 py-3 text-center typo-pc-b3', statusClass)}>
        {statusLabel}
      </span>
    </button>
  )
}

interface ApplicationStatusProps {
  application: MyCoreApplication | null
  memberApplication: MyMemberApplication | null
  loading?: boolean
  error?: string | null
  onOpenCore: () => void
  onOpenMember: () => void
}

export default function ApplicationStatus({
  application,
  memberApplication,
  loading = false,
  error = null,
  onOpenCore,
  onOpenMember
}: ApplicationStatusProps) {
  const hasAny = application !== null || memberApplication !== null

  return (
    <section className="space-y-4">
      <h2 className="typo-pc-h4 text-white">활동 및 신청 현황</h2>

      {loading ? (
        <p className="typo-pc-b3 text-gray-700">불러오는 중…</p>
      ) : error ? (
        <p className="typo-pc-b3 text-red">{error}</p>
      ) : hasAny ? (
        <div className="space-y-3">
          {application ? (
            <ApplicationRow
              label="운영진 지원서"
              statusLabel={STATUS_LABEL[application.resultStatus]}
              statusClass={STATUS_CLASS[application.resultStatus]}
              onClick={onOpenCore}
            />
          ) : null}

          {/* 부원 지원에는 합불 판정이 없다. 상태 칸은 제출 사실만 알린다. */}
          {memberApplication ? (
            <ApplicationRow
              label="부원 지원서"
              statusLabel="제출 완료"
              statusClass={STATUS_CLASS.SUBMITTED}
              onClick={onOpenMember}
            />
          ) : null}
        </div>
      ) : (
        <p className="typo-pc-b3 text-gray-700">제출한 지원서가 없습니다.</p>
      )}
    </section>
  )
}
