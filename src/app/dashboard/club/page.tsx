'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import {
  ADMIN_EMPTY_CELL,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION,
  ADMIN_PILL,
  ADMIN_PILL_SELECT,
  ADMIN_TABLE_CARD,
  ADMIN_TD,
  ADMIN_TD_MUTED,
  ADMIN_TH,
  ADMIN_TR
} from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchClubs, readClubError } from '@/services/club/clubClient'
import {
  downloadAdminClubsCsv,
  fetchAdminClubs,
  fetchClubTerms,
  shortDate
} from '@/services/club/clubCompletionClient'
import {
  CLUB_COMPLETION_STATUS_LABEL,
  CLUB_GOAL_STATUS_LABEL,
  CLUB_WARNING_LABEL,
  type AdminClubRow,
  type ClubTerm,
  type ClubWarning
} from '@/types/club'
import { cn } from '@/utils/cn'

type Filter = 'ALL' | 'ANY' | ClubWarning
const FILTERS: Filter[] = [
  'ALL',
  'ANY',
  'WEEK_MISSED',
  'MEMBERS_UNDER_4',
  'PERIOD_NOT_SET',
  'GOAL_NOT_SET',
  'OUT_OF_PERIOD',
  'OVER_CAPACITY'
]

/**
 * 운영진 소모임 현황 (C 담당). 시스템은 막지 않고 경고로만 보여준다 — 판단은 여기서 한다.
 *
 * 한 기수의 팀은 많아야 수십 개라 전체를 한 번 받아 화면에서 거른다. 필터 칩의 숫자를 함께 보여 주려는 것이다.
 */
export default function ClubAdminDashboardPage() {
  const { apiClient } = useAuthenticatedApi()
  const [terms, setTerms] = useState<ClubTerm[]>([])
  const [termId, setTermId] = useState<number | null>(null)
  const [allRows, setAllRows] = useState<AdminClubRow[] | null>(null)
  const [pendingClubs, setPendingClubs] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClubTerms(apiClient)
      .then((list) => {
        setTerms(list)
        // 기수가 하나도 없으면 null 로 두고, 서버도 빈 목록을 준다.
        setTermId((prev) => prev ?? list[0]?.id ?? null)
        if (list.length === 0) setAllRows([])
      })
      .catch((err) => setError(readClubError(err, '기수를 불러오지 못했어요.')))
    fetchClubs(apiClient, { status: 'PENDING', size: 1 })
      .then(({ meta }) => setPendingClubs(meta.totalElements))
      .catch(() => setPendingClubs(null))
  }, [apiClient])

  const load = useCallback(() => {
    if (termId === null) return
    setAllRows(null)
    fetchAdminClubs(apiClient, { termId })
      .then((rows) => {
        setAllRows(rows)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '현황을 불러오지 못했어요.')))
  }, [apiClient, termId])

  useEffect(load, [load])

  const source = useMemo(() => allRows ?? [], [allRows])
  const matches = useCallback(
    (row: AdminClubRow, value: Filter) =>
      value === 'ALL'
        ? true
        : value === 'ANY'
          ? row.warnings.length > 0
          : row.warnings.includes(value),
    []
  )
  const rows = useMemo(
    () => source.filter((row) => matches(row, filter)),
    [source, filter, matches]
  )
  const countOf = (value: Filter) => source.filter((row) => matches(row, value)).length
  const pendingReviews = source.reduce((sum, row) => sum + row.pendingReviewCount, 0)

  const exportCsv = async () => {
    try {
      const blob = await downloadAdminClubsCsv(apiClient, termId ?? undefined)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      const termName = terms.find((t) => t.id === termId)?.name ?? '소모임'
      anchor.download = `${termName}_소모임현황.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(readClubError(err, 'CSV 를 내려받지 못했어요.'))
    }
  }

  const stats = [
    { label: '소모임', value: source.length, href: null, accent: false },
    {
      label: '인증 검토 대기',
      value: pendingReviews,
      href: '/dashboard/club/review',
      accent: true
    },
    { label: '경고 있는 팀', value: countOf('ANY'), href: null, accent: false },
    {
      label: '개설 승인 대기',
      value: pendingClubs ?? '—',
      href: '/dashboard/club/leaders',
      accent: false
    }
  ]

  return (
    <ClubAdminFrame
      eyebrow="Clubs"
      title="소모임 현황"
      current="현황"
      aside={
        <div className="flex flex-wrap gap-2">
          <label className={ADMIN_PILL}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">기수</span>
            <select
              className={ADMIN_PILL_SELECT}
              value={termId ?? ''}
              onChange={(e) => setTermId(Number(e.target.value))}
              disabled={terms.length === 0}
            >
              {terms.length === 0 && <option className={ADMIN_OPTION}>기수 없음</option>}
              {terms.map((term) => (
                <option key={term.id} value={term.id} className={ADMIN_OPTION}>
                  {term.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={exportCsv}
            disabled={termId === null}
            className={ADMIN_GHOST_BUTTON}
          >
            CSV 내보내기
          </button>
        </div>
      }
    >
      {error && <div className={cn(ADMIN_ERROR_BANNER, 'mb-4')}>{error}</div>}

      <div className="grid grid-cols-4 gap-3 mobile:grid-cols-2">
        {stats.map((stat) => {
          const body = (
            <>
              <div className="text-[13px] text-admin-ink-muted">{stat.label}</div>
              <div
                className={cn(
                  'mt-2 text-[30px] font-semibold tracking-[-0.02em]',
                  stat.accent && 'text-admin-accent'
                )}
              >
                {stat.value}
              </div>
            </>
          )
          const box =
            'rounded-[20px] border border-admin-line-soft bg-admin-card px-5 py-[18px] shadow-admin'
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className={cn(box, 'transition-colors hover:border-admin-accent')}
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label} className={box}>
              {body}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors',
              filter === value
                ? 'border-admin-line-current bg-admin-badge text-admin-ink'
                : 'border-admin-line text-admin-ink-muted hover:border-admin-accent hover:text-admin-ink'
            )}
          >
            {value === 'ALL' ? '전체' : value === 'ANY' ? '경고 있음' : CLUB_WARNING_LABEL[value]}{' '}
            {countOf(value)}
          </button>
        ))}
      </div>

      <div className={cn(ADMIN_TABLE_CARD, 'mt-4 overflow-x-auto')}>
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr>
              {[
                '소모임',
                '활동 기간',
                '인원',
                '주차 충족',
                '목표',
                '검토 대기',
                '경고',
                '완주'
              ].map((head) => (
                <th key={head} className={ADMIN_TH}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows === null && (
              <tr>
                <td colSpan={8} className={ADMIN_EMPTY_CELL}>
                  불러오는 중…
                </td>
              </tr>
            )}
            {allRows !== null && rows.length === 0 && (
              <tr>
                <td colSpan={8} className={ADMIN_EMPTY_CELL}>
                  {terms.length === 0
                    ? '기수가 없어요. 개설 승인·기수 화면에서 먼저 만들어 주세요.'
                    : '해당하는 소모임이 없어요.'}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.clubId} className={ADMIN_TR}>
                <td className={ADMIN_TD}>
                  <Link
                    href={`/dashboard/club/team?id=${row.clubId}`}
                    className="font-semibold hover:text-admin-accent"
                  >
                    {row.name}
                  </Link>
                  <div className="mt-0.5 text-[12px] text-admin-ink-soft">
                    리더 {row.leaderName}
                    {row.status !== 'ACTIVE' && ` · ${row.status === 'ENDED' ? '종료' : '숨김'}`}
                  </div>
                </td>
                <td className={ADMIN_TD_MUTED}>
                  {row.startDate && row.endDate
                    ? `${shortDate(row.startDate)} – ${shortDate(row.endDate)}`
                    : '미설정'}
                </td>
                <td className={ADMIN_TD}>
                  {row.memberCount}
                  {row.capacity ? ` / ${row.capacity}` : ''}
                </td>
                <td className={ADMIN_TD}>
                  {row.targetWeeks > 0 ? (
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-admin-line">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            row.satisfiedWeeks === row.targetWeeks
                              ? 'bg-admin-ok'
                              : 'bg-admin-accent'
                          )}
                          style={{
                            width: `${Math.round((row.satisfiedWeeks / row.targetWeeks) * 100)}%`
                          }}
                        />
                      </div>
                      <span>
                        {row.satisfiedWeeks} / {row.targetWeeks}주
                      </span>
                    </div>
                  ) : (
                    '—'
                  )}
                  {row.restWeeks > 0 && (
                    <div className="mt-0.5 text-[12px] text-admin-ink-soft">
                      쉬는 주 {row.restWeeks}
                    </div>
                  )}
                </td>
                <td className={ADMIN_TD_MUTED}>{CLUB_GOAL_STATUS_LABEL[row.goalStatus]}</td>
                <td className={cn(ADMIN_TD, 'text-admin-accent')}>
                  {row.pendingReviewCount > 0 ? (
                    <Link
                      href={`/dashboard/club/review?clubId=${row.clubId}`}
                      className="hover:underline"
                    >
                      {row.pendingReviewCount}
                    </Link>
                  ) : (
                    0
                  )}
                </td>
                <td className={ADMIN_TD}>
                  <div className="flex flex-wrap gap-1">
                    {row.warnings.map((warning) => (
                      <span
                        key={warning}
                        className="whitespace-nowrap rounded-full bg-admin-tag px-2.5 py-0.5 text-[12px] text-admin-tag-ink"
                      >
                        {CLUB_WARNING_LABEL[warning]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={ADMIN_TD_MUTED}>
                  {CLUB_COMPLETION_STATUS_LABEL[row.completionStatus]}
                  {row.completionStatus === 'IN_PROGRESS' && row.eligible && (
                    <div className="mt-0.5 text-[12px] text-admin-ok">기준 충족</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ClubAdminFrame>
  )
}
