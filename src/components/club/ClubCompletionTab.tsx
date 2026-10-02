'use client'

import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { MOCK_COMPLETION } from '@/mock/clubMock'
import type { ClubMembership, ClubWeekState } from '@/types/club'
import { cn } from '@/utils/cn'

const WEEK_LABEL: Record<ClubWeekState, string> = {
  SATISFIED: '충족',
  MISSED: '미충족',
  REST: '쉬는 주',
  PENDING_REVIEW: '검토 중',
  CURRENT: '이번 주',
  UPCOMING: '예정'
}

const WEEK_CLASS: Record<ClubWeekState, string> = {
  SATISFIED: 'bg-[rgba(134,192,143,0.16)] text-signal-ok',
  MISSED: 'bg-[rgba(217,117,106,0.16)] text-signal-err',
  REST: 'border border-dashed border-dusk-line-dashed text-dusk-ink-700',
  PENDING_REVIEW: 'bg-[rgba(224,162,78,0.14)] text-tag-event',
  CURRENT: 'border border-ember text-dusk-ink-100',
  UPCOMING: 'border border-dusk-line-soft text-dusk-ink-800'
}

const LEGEND: ClubWeekState[] = ['SATISFIED', 'MISSED', 'PENDING_REVIEW', 'REST', 'CURRENT']

/** 상세 「목표·완주」 탭 (C 담당). 계산값은 참고용이고, 확정은 운영진이 한다. */
export function ClubCompletionTab({
  clubId,
  myMembership
}: {
  clubId: number
  myMembership: ClubMembership | null
}) {
  // TODO(C): GET /api/v1/clubs/{clubId}/completion 으로 바꾼다.
  void clubId
  const data = MOCK_COMPLETION
  const isLeader = Boolean(myMembership?.isLeader)
  const satisfied = data.weeks.filter((week) => week.state === 'SATISFIED').length
  const pending = data.weeks.filter((week) => week.state === 'PENDING_REVIEW').length

  const criteria = [
    {
      label: '매주 활동 1회 이상',
      value: pending ? `${satisfied}주 충족 · ${pending}주 검토 중` : `${satisfied}주 충족`,
      ok: pending === 0
    },
    { label: '팀원 4명 이상', value: `${data.memberCount}명`, ok: data.memberCount >= 4 },
    {
      label: '목표 달성',
      value: data.goalStatus === 'ACHIEVED' ? '달성 확인' : '결과 제출 전',
      ok: data.goalStatus === 'ACHIEVED'
    }
  ]

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mobile:grid-cols-1">
        <div className="flex flex-col gap-2 rounded-[20px] border border-dusk-line p-5">
          <div className="text-xs text-dusk-ink-800">팀 목표</div>
          <div className="text-base leading-[1.55]">{data.goal ?? '아직 등록하지 않았어요'}</div>
          <div className="mt-2 text-xs text-dusk-ink-800">달성 기준</div>
          <div className="text-sm leading-[1.55] text-dusk-ink-400">{data.goalCriteria ?? '-'}</div>
        </div>
        <div className="flex flex-col gap-3 rounded-[20px] border border-dusk-line p-5">
          <div className="text-xs text-dusk-ink-800">완주 기준</div>
          {criteria.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-sm">
              <span className="text-dusk-ink-200">{row.label}</span>
              <span className={row.ok ? 'text-signal-ok' : 'text-tag-event'}>{row.value}</span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-dusk-line-soft pt-3 text-sm">
            <span className="text-dusk-ink-700">완주 확정</span>
            <span className="text-dusk-ink-400">진행 중</span>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">주차별 활동</h2>
          <div className="flex flex-wrap gap-3.5 text-xs text-dusk-ink-700">
            {LEGEND.map((state) => (
              <span key={state} className="inline-flex items-center gap-1.5">
                <span aria-hidden className={cn('size-2.5 rounded-[3px]', WEEK_CLASS[state])} />
                {WEEK_LABEL[state]}
              </span>
            ))}
          </div>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
          {data.weeks.map((week, index) => (
            <li
              key={week.weekStart}
              className={cn('rounded-xl px-3 py-2.5', WEEK_CLASS[week.state])}
            >
              <div className="text-xs opacity-80">{index + 1}주차</div>
              <div className="mt-0.5 text-[13px]">{week.weekStart}</div>
              <div className="mt-2 text-xs font-semibold">{WEEK_LABEL[week.state]}</div>
            </li>
          ))}
        </ol>
        {isLeader && (
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className={cn(DUSK_GHOST_BUTTON, 'px-4 py-2 text-[13px]')}>
              쉬는 주 지정
            </button>
            <button type="button" className={cn(DUSK_GHOST_BUTTON, 'px-4 py-2 text-[13px]')}>
              목표 수정
            </button>
            <button type="button" className={cn(DUSK_PRIMARY_BUTTON, 'px-4 py-2 text-[13px]')}>
              최종 결과 제출
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
