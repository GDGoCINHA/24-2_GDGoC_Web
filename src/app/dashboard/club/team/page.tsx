'use client'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import { ADMIN_ACCENT_BUTTON, ADMIN_GHOST_BUTTON } from '@/components/admin/dashboard/adminStyles'
import { MOCK_TEAM_WEEKS } from '@/mock/clubMock'
import type { ClubWeekState } from '@/types/club'
import { cn } from '@/utils/cn'

const STATE_LABEL: Partial<Record<ClubWeekState, string>> = {
  SATISFIED: '충족',
  MISSED: '미충족',
  REST: '쉬는 주',
  PENDING_REVIEW: '검토 중'
}

const STATE_CLASS: Partial<Record<ClubWeekState, string>> = {
  SATISFIED: 'bg-admin-tag text-admin-ok',
  MISSED: 'bg-admin-badge text-admin-badge-ink',
  REST: 'border border-dashed border-admin-line-strong text-admin-ink-muted',
  PENDING_REVIEW: 'bg-admin-badge text-admin-accent'
}

const CARD =
  'flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-[22px] shadow-admin'
const FIELD =
  'resize-y rounded-xl border border-admin-line bg-admin-base px-4 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-accent'

/**
 * 팀 상세·완주 확정 (C 담당). 계산상 미충족이어도 확정할 수 있다 — 확정 전에 한 번 더 묻는다.
 */
export default function ClubTeamPage() {
  // TODO(C): GET /api/v1/clubs/{id}/completion 과 운영진 쓰기 API 로 바꾼다.
  const checks = [
    { label: '매주 인정 활동', value: '6 / 7주 (쉬는 주 1)', ok: false },
    { label: '팀원 4명 이상', value: '5명', ok: true },
    { label: '목표', value: '결과 제출됨 · 확인 전', ok: false }
  ]

  return (
    <ClubAdminFrame
      eyebrow="취업 준비 · 이끔이 박지아 · 5 / 6명"
      title="프론트엔드 취준반"
      current="현황"
      aside={
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ADMIN_GHOST_BUTTON}>
            활동 기간 수정
          </button>
          <button type="button" className={ADMIN_GHOST_BUTTON}>
            이끔이 교체
          </button>
          <button type="button" className={ADMIN_GHOST_BUTTON}>
            상태: 운영 중
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-5 mobile:grid-cols-1">
        <section className={CARD}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-semibold">
              주차별 활동{' '}
              <span className="text-[13px] font-normal text-admin-ink-muted">
                09.01 – 10.26 · 참석 비율 50%
              </span>
            </h2>
            <span className="text-[13px] text-admin-ink-muted">체크하면 쉬는 주</span>
          </div>
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-admin-ink-soft">
                <th className="px-1.5 py-2 font-medium">주</th>
                <th className="px-1.5 py-2 font-medium">인정 활동</th>
                <th className="px-1.5 py-2 font-medium">상태</th>
                <th className="px-1.5 py-2 text-right font-medium">쉬는 주</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAM_WEEKS.map((week) => (
                <tr key={week.date} className="border-t border-admin-line-row">
                  <td className="px-1.5 py-[11px] text-admin-ink-muted">{week.date}</td>
                  <td className="px-1.5 py-[11px]">{week.acts}</td>
                  <td className="px-1.5 py-[11px]">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-[12px]',
                        STATE_CLASS[week.state]
                      )}
                    >
                      {STATE_LABEL[week.state]}
                    </span>
                  </td>
                  <td className="px-1.5 py-[11px] text-right">
                    <input
                      type="checkbox"
                      defaultChecked={week.state === 'REST'}
                      aria-label={`${week.date} 주 쉬는 주`}
                      className="size-[18px] cursor-pointer accent-admin-accent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="flex flex-col gap-5">
          <section className={CARD}>
            <h2 className="text-[17px] font-semibold">목표</h2>
            <div className="text-[14px] leading-[1.6]">
              전원 포트폴리오 사이트 배포 + 모의 면접 2회
            </div>
            <div className="text-[13px] text-admin-ink-muted">최종 결과 · 10월 25일 제출</div>
            <div className="text-[14px] leading-[1.6]">
              5명 전원 배포 완료, 모의 면접 평균 2.2회. 증빙 링크 5개 첨부.
            </div>
            <div className="mt-1 flex gap-2">
              <button type="button" className={ADMIN_GHOST_BUTTON}>
                미달성
              </button>
              <button type="button" className={ADMIN_ACCENT_BUTTON}>
                달성 확인
              </button>
            </div>
          </section>

          <section className={CARD}>
            <h2 className="text-[17px] font-semibold">완주 판정</h2>
            {checks.map((row) => (
              <div key={row.label} className="flex justify-between gap-3 text-[14px]">
                <span className="text-admin-ink-muted">{row.label}</span>
                <span className={row.ok ? 'text-admin-ok' : 'text-admin-accent'}>{row.value}</span>
              </div>
            ))}
            <div className="rounded-xl border border-admin-line-accent bg-admin-badge px-3 py-2.5 text-[13px] leading-[1.55] text-admin-badge-ink">
              계산상 기준 미충족이에요. 그래도 완주로 확정할 수 있고, 확정 전에 한 번 더 확인해요.
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] text-admin-ink-muted">메모 (선택)</span>
              <textarea
                rows={2}
                placeholder="예: 4주차는 학과 시험 주간이라 인정"
                className={FIELD}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ADMIN_GHOST_BUTTON}>
                미완주
              </button>
              <button type="button" className={ADMIN_ACCENT_BUTTON}>
                완주 확정
              </button>
              <button type="button" className={cn(ADMIN_GHOST_BUTTON, 'ml-auto')}>
                카카오톡 공유
              </button>
            </div>
          </section>
        </div>
      </div>
    </ClubAdminFrame>
  )
}
