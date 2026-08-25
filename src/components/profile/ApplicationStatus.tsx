'use client'

import type {
  ApplicationStatusValue,
  MyCoreApplication,
  MyMemberApplication
} from '@/types/profile'
import { cn } from '@/utils/cn'

const STATUS_CLASS: Record<ApplicationStatusValue, string> = {
  SUBMITTED: 'bg-[rgba(126,150,200,0.22)] text-[#A9BBE0]',
  IN_REVIEW: 'bg-[rgba(224,162,78,0.22)] text-[#E9C48A]',
  ACCEPTED: 'bg-[rgba(134,192,143,0.22)] text-[#A6D0AC]',
  REJECTED: 'bg-[rgba(217,117,106,0.22)] text-[#E5A79F]'
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
      className="flex w-full items-center gap-3.5 overflow-hidden rounded-full border border-[rgba(240,234,228,0.09)] bg-[rgba(240,234,228,0.05)] text-left transition-colors hover:bg-[rgba(240,234,228,0.09)]"
    >
      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-[22px] py-[15px] text-[15px] text-dusk-ink-400">
        {label}
      </span>
      {/* 좁은 화면에서는 상태 칸에 자리를 내준다. 줄이 두 줄로 접히면 알약 모양이 깨진다. */}
      <span className="shrink-0 text-xs text-dusk-ink-800 mobile:hidden" aria-hidden>
        내용 보기
      </span>
      <span
        className={cn(
          'shrink-0 px-[22px] py-[15px] text-center text-sm mobile:min-w-[104px] pc:min-w-[140px]',
          statusClass
        )}
      >
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
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.02em]">활동 및 신청 현황</h2>

      {loading ? (
        <p className="mt-6 text-[15px] text-dusk-ink-800">불러오는 중…</p>
      ) : error ? (
        <p className="mt-6 text-[15px] text-signal-err">{error}</p>
      ) : hasAny ? (
        <div className="mt-6 flex flex-col gap-3">
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
        <p className="mt-6 text-[15px] text-dusk-ink-800">제출한 지원서가 없습니다.</p>
      )}
    </section>
  )
}
