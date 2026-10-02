'use client'

import { MOCK_MY_ATTENDANCE, MOCK_SCHEDULES } from '@/mock/clubMock'
import type { ClubMembership } from '@/types/club'
import { cn } from '@/utils/cn'

/** 상세 「일정·출석」 탭 (B 담당). */
export function ClubScheduleTab({
  clubId,
  myMembership
}: {
  clubId: number
  myMembership: ClubMembership | null
}) {
  // TODO(B): GET /api/v1/clubs/{clubId}/schedules, 내 출석 조회로 바꾼다.
  void clubId
  const isMember = myMembership?.status === 'ACTIVE'
  const [next, ...rest] = MOCK_SCHEDULES

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-6 mobile:grid-cols-1">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">다음 일정</h2>
        {next && (
          <div className="flex flex-col gap-3 rounded-[20px] border border-[rgba(208,129,85,0.45)] bg-dusk-raise p-5">
            <div className="text-[13px] text-ember">{next.startsAt}</div>
            <div className="text-lg font-semibold">{next.title}</div>
            <div className="text-sm text-dusk-ink-700">{next.location ?? '온라인'}</div>
            {isMember && (
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  className={cn(
                    'min-h-11 flex-1 rounded-full border text-sm',
                    next.myResponse === 'ATTEND'
                      ? 'border-ember bg-[rgba(208,129,85,0.18)] text-dusk-ink-100'
                      : 'border-[rgba(240,234,228,0.2)] text-dusk-ink-400'
                  )}
                >
                  참석 예정
                </button>
                <button
                  type="button"
                  className={cn(
                    'min-h-11 flex-1 rounded-full border text-sm',
                    next.myResponse === 'ABSENT'
                      ? 'border-ember bg-[rgba(208,129,85,0.18)] text-dusk-ink-100'
                      : 'border-[rgba(240,234,228,0.2)] text-dusk-ink-400'
                  )}
                >
                  불참 예정
                </button>
              </div>
            )}
            <div className="text-[13px] text-dusk-ink-800">
              참석 예정 {next.attendCount}명 · 불참 {next.absentCount}명 · 미응답{' '}
              {next.noResponseCount}명
            </div>
          </div>
        )}
        {rest.map((schedule) => (
          <div
            key={schedule.id}
            className="flex flex-wrap justify-between gap-2 rounded-[14px] border border-dusk-line px-[18px] py-3.5 text-sm"
          >
            <span>
              {schedule.startsAt} · {schedule.title}
            </span>
            <span className="text-dusk-ink-800">{schedule.location ?? '온라인'}</span>
          </div>
        ))}
      </section>

      {isMember && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">내 출석</h2>
          <div className="overflow-hidden rounded-[20px] border border-dusk-line">
            {MOCK_MY_ATTENDANCE.map((row) => (
              <div
                key={row.date}
                className="flex items-center justify-between gap-3 border-b border-dusk-line-soft px-[18px] py-3.5 text-sm last:border-b-0"
              >
                <span className="text-dusk-ink-200">{row.date}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-[3px] text-xs',
                      row.attended
                        ? 'bg-[rgba(134,192,143,0.20)] text-signal-ok'
                        : 'bg-[rgba(217,117,106,0.18)] text-signal-err'
                    )}
                  >
                    {row.attended ? '출석' : '결석'}
                  </span>
                  {/* 인증 완료된 기록은 고칠 수 없으므로 수정 요청도 받지 않는다. */}
                  {row.locked ? (
                    <span className="text-xs text-dusk-ink-800">인증 완료</span>
                  ) : (
                    <button type="button" className="min-h-9 text-[13px] text-ember">
                      수정 요청
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
