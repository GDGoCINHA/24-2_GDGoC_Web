'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import { KakaoShareButton } from '@/components/club/ClubUi'
import { WEEK_LABEL } from '@/components/club/ClubCompletionTab'
import {
  ADMIN_ACCENT_BUTTON,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON
} from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { deleteClubByStaff, fetchClubDetail, readClubError } from '@/services/club/clubClient'
import {
  confirmClubCompletion,
  fetchClubCompletion,
  fetchClubTerms,
  judgeClubGoal,
  saveRestWeeks,
  shortDate,
  thisMonday,
  updateClubPeriodByStaff,
  weekStateOf
} from '@/services/club/clubCompletionClient'
import {
  CLUB_CATEGORY_LABEL,
  CLUB_COMPLETION_STATUS_LABEL,
  CLUB_GOAL_STATUS_LABEL,
  CLUB_STATUS_LABEL,
  CLUB_WARNING_LABEL,
  type ClubCompletion,
  type ClubDetail,
  type ClubTerm,
  type ClubWeekState
} from '@/types/club'
import { cn } from '@/utils/cn'

const STATE_CLASS: Record<ClubWeekState, string> = {
  SATISFIED: 'bg-admin-tag text-admin-ok',
  MISSED: 'bg-admin-badge text-admin-badge-ink',
  REST: 'border border-dashed border-admin-line-strong text-admin-ink-muted',
  PENDING_REVIEW: 'bg-admin-badge text-admin-accent',
  CURRENT: 'border border-admin-accent text-admin-ink',
  UPCOMING: 'border border-admin-line text-admin-ink-soft'
}

const CARD =
  'flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-[22px] shadow-admin'
const FIELD =
  'resize-y rounded-xl border border-admin-line bg-admin-base px-4 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-accent'

/**
 * 팀 상세·완주 확정 (C 담당). 계산상 미충족이어도 확정할 수 있다 — 확정 전에 한 번 더 묻는다.
 */
export default function ClubTeamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('id') ?? 0)
  const { apiClient } = useAuthenticatedApi()
  const [club, setClub] = useState<ClubDetail | null>(null)
  const [data, setData] = useState<ClubCompletion | null>(null)
  const [term, setTerm] = useState<ClubTerm | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [memo, setMemo] = useState('')
  const [editingPeriod, setEditingPeriod] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const load = useCallback(() => {
    if (!clubId) return
    fetchClubDetail(apiClient, clubId)
      .then((detail) => {
        setClub(detail)
        fetchClubTerms(apiClient)
          .then((terms) => setTerm(terms.find((t) => t.id === detail.termId) ?? null))
          .catch(() => setTerm(null))
      })
      .catch((err) => setError(readClubError(err, '소모임을 불러오지 못했어요.')))
    fetchClubCompletion(apiClient, clubId)
      .then((next) => {
        setData(next)
        setMemo((prev) => prev || next.completionMemo || '')
      })
      .catch((err) => setError(readClubError(err, '완주 현황을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      load()
    } catch (err) {
      setError(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  if (!clubId) {
    return (
      <ClubAdminFrame eyebrow="Clubs" title="팀 현황" current="현황">
        <p className="text-admin-ink-dim">소모임을 고르세요.</p>
      </ClubAdminFrame>
    )
  }
  if (!club || !data) {
    return (
      <ClubAdminFrame eyebrow="Clubs" title="팀 현황" current="현황">
        {error ? (
          <div className={ADMIN_ERROR_BANNER}>{error}</div>
        ) : (
          <p className="text-admin-ink-dim">불러오는 중…</p>
        )}
      </ClubAdminFrame>
    )
  }

  const monday = thisMonday()
  const target = data.weeks.filter((w) => !w.rest)
  const satisfied = target.filter((w) => w.satisfied === true).length
  const restCount = data.weeks.length - target.length
  const checks = [
    {
      label: '매주 인정 활동',
      value: data.period
        ? `${satisfied} / ${target.length}주${restCount ? ` (쉬는 주 ${restCount})` : ''}`
        : '활동 기간 미설정',
      ok: data.period !== null && target.length > 0 && satisfied === target.length
    },
    { label: '팀원 4명 이상', value: `${data.memberCount}명`, ok: data.memberCountSatisfied },
    {
      label: '목표',
      value: CLUB_GOAL_STATUS_LABEL[data.goalStatus],
      ok: data.goalStatus === 'ACHIEVED'
    }
  ]

  const toggleRest = (weekStart: string) => {
    const next = data.restWeeks.includes(weekStart)
      ? data.restWeeks.filter((w) => w !== weekStart)
      : [...data.restWeeks, weekStart]
    void run(async () => {
      await saveRestWeeks(apiClient, clubId, next)
    })
  }

  const confirm = (status: 'COMPLETED' | 'FAILED') => {
    if (
      status === 'COMPLETED' &&
      !data.eligible &&
      !window.confirm('계산상 완주 기준을 채우지 못했어요. 그래도 완주로 확정할까요?')
    ) {
      return
    }
    if (status === 'FAILED' && !window.confirm('미완주로 확정할까요?')) return
    void run(() => confirmClubCompletion(apiClient, clubId, status, memo.trim() || null))
  }

  const headcount = `${data.memberCount}${club.capacity ? ` / ${club.capacity}` : ''}명`
  const statusLabel = CLUB_STATUS_LABEL[club.status]

  return (
    <ClubAdminFrame
      eyebrow={`${CLUB_CATEGORY_LABEL[club.category]} · 리더 ${club.leaderName} · ${headcount}`}
      title={club.name}
      current="현황"
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-admin-ink-muted">상태: {statusLabel}</span>
          <button
            type="button"
            onClick={() => {
              setStart(club.startDate ?? '')
              setEnd(club.endDate ?? '')
              setEditingPeriod((prev) => !prev)
            }}
            className={ADMIN_GHOST_BUTTON}
          >
            활동 기간 수정
          </button>
          <Link href={`/club/detail/?id=${clubId}`} className={ADMIN_GHOST_BUTTON}>
            소모임 화면
          </Link>
          <button
            type="button"
            onClick={async () => {
              const typed = window.prompt(
                `일정·활동 기록·게시글까지 모두 지워지고 되돌릴 수 없어요. 삭제하려면 소모임 이름(${club.name})을 입력해 주세요.`
              )
              if (typed === null) return
              if (typed.trim() !== club.name) {
                window.alert('이름이 달라 삭제하지 않았어요.')
                return
              }
              try {
                await deleteClubByStaff(apiClient, clubId)
                router.push('/dashboard/club')
              } catch (err) {
                setError(readClubError(err))
              }
            }}
            className="min-h-9 px-2 text-[13px] text-admin-ink-muted hover:text-signal-err"
          >
            소모임 삭제
          </button>
        </div>
      }
    >
      {error && <div className={cn(ADMIN_ERROR_BANNER, 'mb-4')}>{error}</div>}
      {data.warnings.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {data.warnings.map((warning) => (
            <span
              key={warning}
              className="rounded-full bg-admin-tag px-2.5 py-0.5 text-[12px] text-admin-tag-ink"
            >
              {CLUB_WARNING_LABEL[warning]}
            </span>
          ))}
        </div>
      )}
      {editingPeriod && (
        <div className={cn(CARD, 'mb-5 flex-row flex-wrap items-end')}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-admin-ink-muted">시작</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-admin-ink-muted">끝</span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={FIELD}
            />
          </label>
          <button
            type="button"
            disabled={busy || !start || !end}
            onClick={() =>
              run(async () => {
                await updateClubPeriodByStaff(apiClient, clubId, start, end)
                setEditingPeriod(false)
              })
            }
            className={ADMIN_ACCENT_BUTTON}
          >
            저장
          </button>
          {start && end && end < start && (
            <span className="text-[13px] text-admin-accent">끝이 시작보다 앞이에요.</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-5 mobile:grid-cols-1">
        <section className={CARD}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-semibold">
              주차별 활동{' '}
              <span className="text-[13px] font-normal text-admin-ink-muted">
                {data.period
                  ? `${shortDate(data.period.startDate)} – ${shortDate(data.period.endDate)}`
                  : '기간 미설정'}
                {term && ` · 참석 비율 ${Math.round(term.attendanceRatio * 100)}%`}
              </span>
            </h2>
            <span className="text-[13px] text-admin-ink-muted">체크하면 쉬는 주 (바로 저장)</span>
          </div>
          {!data.period ? (
            <p className="text-[14px] text-admin-ink-soft">
              활동 기간이 없어 주차를 계산하지 않았어요. 위 「활동 기간 수정」에서 정할 수 있어요.
            </p>
          ) : (
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
                {data.weeks.map((week) => {
                  const state = weekStateOf(week, monday)
                  const counted = week.activities.filter((a) => a.counted).length
                  const records = week.activities.length
                  return (
                    <tr key={week.weekStart} className="border-t border-admin-line-row">
                      <td className="px-1.5 py-[11px] text-admin-ink-muted">
                        {shortDate(week.weekStart)}
                      </td>
                      <td className="px-1.5 py-[11px]">
                        {records === 0
                          ? '—'
                          : counted === records
                            ? `${counted}회`
                            : `${counted}회 (기록 ${records}건)`}
                      </td>
                      <td className="px-1.5 py-[11px]">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[12px]',
                            STATE_CLASS[state]
                          )}
                        >
                          {WEEK_LABEL[state]}
                        </span>
                      </td>
                      <td className="px-1.5 py-[11px] text-right">
                        <input
                          type="checkbox"
                          checked={week.rest}
                          disabled={busy}
                          onChange={() => toggleRest(week.weekStart)}
                          aria-label={`${shortDate(week.weekStart)} 주 쉬는 주`}
                          className="size-[18px] cursor-pointer accent-admin-accent"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {(data.pendingActivityCount > 0 || data.outOfPeriodActivityCount > 0) && (
            <p className="text-[13px] text-admin-ink-muted">
              {data.pendingActivityCount > 0 && (
                <Link
                  href={`/dashboard/club/review?clubId=${clubId}`}
                  className="text-admin-accent"
                >
                  검토 대기 {data.pendingActivityCount}건 →
                </Link>
              )}
              {data.pendingActivityCount > 0 && data.outOfPeriodActivityCount > 0 && ' · '}
              {data.outOfPeriodActivityCount > 0 &&
                `기간 밖 기록 ${data.outOfPeriodActivityCount}건은 계산에서 빠짐`}
            </p>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className={CARD}>
            <h2 className="text-[17px] font-semibold">목표</h2>
            <div className="whitespace-pre-line text-[14px] leading-[1.6]">
              {data.goal ?? '아직 등록하지 않았어요'}
            </div>
            {data.goalCriteria && (
              <div className="whitespace-pre-line text-[13px] text-admin-ink-muted">
                기준: {data.goalCriteria}
              </div>
            )}
            <div className="text-[13px] text-admin-ink-muted">
              {CLUB_GOAL_STATUS_LABEL[data.goalStatus]}
            </div>
            {data.goalResult && (
              <div className="whitespace-pre-line text-[14px] leading-[1.6]">{data.goalResult}</div>
            )}
            {data.goalEvidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 text-[13px]">
                {data.goalEvidenceUrls.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-admin-accent underline"
                  >
                    증빙 {index + 1}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => judgeClubGoal(apiClient, clubId, 'NOT_ACHIEVED'))}
                className={ADMIN_GHOST_BUTTON}
              >
                미달성
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => judgeClubGoal(apiClient, clubId, 'ACHIEVED'))}
                className={ADMIN_ACCENT_BUTTON}
              >
                달성 확인
              </button>
            </div>
          </section>

          <section className={CARD}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-semibold">완주 판정</h2>
              <span
                className={cn(
                  'text-[13px]',
                  data.completionStatus === 'COMPLETED' ? 'text-admin-ok' : 'text-admin-ink-muted'
                )}
              >
                {CLUB_COMPLETION_STATUS_LABEL[data.completionStatus]}
                {data.confirmedAt && ` · ${data.confirmedAt.slice(0, 10)}`}
              </span>
            </div>
            {checks.map((row) => (
              <div key={row.label} className="flex justify-between gap-3 text-[14px]">
                <span className="text-admin-ink-muted">{row.label}</span>
                <span className={row.ok ? 'text-admin-ok' : 'text-admin-accent'}>{row.value}</span>
              </div>
            ))}
            {!data.eligible && (
              <div className="rounded-xl border border-admin-line-accent bg-admin-badge px-3 py-2.5 text-[13px] leading-[1.55] text-admin-badge-ink">
                계산상 기준 미충족이에요. 그래도 완주로 확정할 수 있고, 확정 전에 한 번 더 확인해요.
              </div>
            )}
            {data.pendingActivityCount > 0 && (
              <div className="text-[13px] text-admin-accent">
                아직 검토하지 않은 기록이 {data.pendingActivityCount}건 있어요.
              </div>
            )}
            <label className="flex flex-col gap-2">
              <span className="text-[13px] text-admin-ink-muted">메모 (선택)</span>
              <textarea
                rows={2}
                value={memo}
                maxLength={1000}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 4주차는 학과 시험 주간이라 인정"
                className={FIELD}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => confirm('FAILED')}
                className={ADMIN_GHOST_BUTTON}
              >
                미완주
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => confirm('COMPLETED')}
                className={ADMIN_ACCENT_BUTTON}
              >
                완주 확정
              </button>
              {data.completionStatus === 'COMPLETED' && (
                <KakaoShareButton
                  compact
                  className={cn(ADMIN_GHOST_BUTTON, 'ml-auto')}
                  title={`${club.termName} 소모임 완주 — ${club.name}`}
                  description={`${club.name} 팀이 이번 기수 활동을 완주했어요.`}
                  imageUrl={club.imageUrl}
                  path={`/club/detail/?id=${clubId}`}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </ClubAdminFrame>
  )
}
