'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import {
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
import { MOCK_ADMIN_CLUBS, MOCK_OPEN_REQUESTS, MOCK_REVIEW_QUEUE } from '@/mock/clubMock'
import { CLUB_WARNING_LABEL, type ClubWarning } from '@/types/club'
import { cn } from '@/utils/cn'

type Filter = 'ALL' | 'ANY' | ClubWarning
const FILTERS: Filter[] = [
  'ALL',
  'ANY',
  'WEEK_MISSED',
  'MEMBERS_UNDER_4',
  'PERIOD_NOT_SET',
  'GOAL_NOT_SET',
  'OVER_CAPACITY'
]

/**
 * 운영진 소모임 현황 (C 담당). 시스템은 막지 않고 경고로만 보여준다 — 판단은 여기서 한다.
 */
export default function ClubAdminDashboardPage() {
  const [filter, setFilter] = useState<Filter>('ALL')
  // TODO(C): GET /api/v1/admin/clubs?termId=&warning= 로 바꾼다.
  const rows = useMemo(
    () =>
      MOCK_ADMIN_CLUBS.filter((row) =>
        filter === 'ALL'
          ? true
          : filter === 'ANY'
            ? row.warnings.length > 0
            : row.warnings.includes(filter)
      ),
    [filter]
  )
  const countOf = (value: Filter) =>
    value === 'ALL'
      ? MOCK_ADMIN_CLUBS.length
      : value === 'ANY'
        ? MOCK_ADMIN_CLUBS.filter((row) => row.warnings.length > 0).length
        : MOCK_ADMIN_CLUBS.filter((row) => row.warnings.includes(value)).length

  const stats = [
    { label: '운영 중인 소모임', value: MOCK_ADMIN_CLUBS.length, href: null, accent: false },
    {
      label: '인증 검토 대기',
      value: MOCK_REVIEW_QUEUE.length,
      href: '/dashboard/club/review',
      accent: true
    },
    { label: '경고 있는 팀', value: countOf('ANY'), href: null, accent: false },
    {
      label: '개설 신청 대기',
      value: MOCK_OPEN_REQUESTS.length,
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
            <select className={ADMIN_PILL_SELECT}>
              <option className={ADMIN_OPTION}>2026-2학기</option>
              <option className={ADMIN_OPTION}>2026-1학기</option>
            </select>
          </label>
          <button type="button" className={ADMIN_GHOST_BUTTON}>
            CSV 내보내기
          </button>
        </div>
      }
    >
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
            {rows.map((row) => (
              <tr key={row.id} className={ADMIN_TR}>
                <td className={ADMIN_TD}>
                  <Link
                    href={`/dashboard/club/team?id=${row.id}`}
                    className="font-semibold hover:text-admin-accent"
                  >
                    {row.name}
                  </Link>
                  <div className="mt-0.5 text-[12px] text-admin-ink-soft">이끔이 {row.leader}</div>
                </td>
                <td className={ADMIN_TD_MUTED}>{row.period}</td>
                <td className={ADMIN_TD}>{row.members}</td>
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
                <td className={ADMIN_TD_MUTED}>{row.goal}</td>
                <td className={cn(ADMIN_TD, 'text-admin-accent')}>{row.pendingReviews}</td>
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
                <td className={ADMIN_TD_MUTED}>{row.completion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ClubAdminFrame>
  )
}
