'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import HomecomingConsentPanel from '@/components/homecoming/HomecomingConsentPanel'
import HomecomingEditModal from '@/components/homecoming/HomecomingEditModal'
import { readErrorMessage } from '@/components/homecoming/readErrorMessage'
import {
  ADMIN_CAPTION,
  ADMIN_CONTAINER,
  ADMIN_EMPTY_CELL,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION,
  ADMIN_PAGE,
  ADMIN_PILL,
  ADMIN_PILL_SELECT,
  ADMIN_SEARCH_FIELD,
  ADMIN_SEARCH_INPUT,
  ADMIN_TABLE_CARD,
  ADMIN_TD,
  ADMIN_TD_MUTED,
  ADMIN_TH,
  ADMIN_TITLE,
  ADMIN_TR
} from '@/components/admin/dashboard/adminStyles'
import Loader from '@/components/ui/common/Loader'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  cancelHomecomingApplication,
  downloadHomecomingCsv,
  fetchHomecomingApplications,
  fetchHomecomingSummary
} from '@/services/homecoming/homecomingAdminClient'
import {
  ATTEND_LABEL,
  ATTEND_TYPES,
  CONSENT_STATE_LABEL,
  type AttendType,
  type HomecomingApplication,
  type HomecomingStatus,
  type HomecomingSummary
} from '@/types/homecoming'
import { formatDate } from '@/utils/formatDate'

const HEADER_LINKS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '초대장', href: '/homecoming/' }
]

const STATUS_CHOICES: { value: HomecomingStatus | ''; label: string }[] = [
  { value: 'ACTIVE', label: '신청만' },
  { value: '', label: '취소 포함 전체' },
  { value: 'CANCELED', label: '취소만' }
]

type Tab = 'applications' | 'consents'

/**
 * 2026 홈커밍데이 신청 관리. 명세상 회장·HR 담당자만 쓴다 — 서버가 ORGANIZER 이상 또는 HR 팀 CORE 이상으로 막고,
 * 대시보드 목록도 같은 조건일 때만 이 화면을 보여준다.
 *
 * 신청자는 직접 고치거나 취소할 수 없어 변경 요청은 모두 여기서 처리한다.
 */
export default function HomecomingAdminPage() {
  const { apiClient } = useAuthenticatedApi()

  const [tab, setTab] = useState<Tab>('applications')
  const [rows, setRows] = useState<HomecomingApplication[]>([])
  const [summary, setSummary] = useState<HomecomingSummary | null>(null)
  const [status, setStatus] = useState<HomecomingStatus | ''>('ACTIVE')
  const [attendType, setAttendType] = useState<AttendType | ''>('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<HomecomingApplication | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        fetchHomecomingApplications(apiClient, {
          status: status || undefined,
          attendType: attendType || undefined
        }),
        fetchHomecomingSummary(apiClient)
      ])
      setRows(list)
      setSummary(sum)
    } catch (e) {
      setError(readErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [apiClient, status, attendType])

  useEffect(() => {
    if (tab === 'applications') void load()
  }, [load, tab])

  /** 이름·전화번호로 Notion 명단과 대조할 때 쓴다. 하이픈 유무와 관계없이 찾는다. */
  const visibleRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return rows
    const digits = keyword.replace(/\D/g, '')
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(keyword) ||
        (digits.length >= 3 && row.phone.replace(/\D/g, '').includes(digits))
    )
  }, [rows, query])

  const handleCsv = async (kind: 'nametags' | 'applications') => {
    setError(null)
    try {
      const blob = await downloadHomecomingCsv(apiClient, kind)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = kind === 'nametags' ? '홈커밍데이_명찰.csv' : '홈커밍데이_신청명단.csv'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(readErrorMessage(e))
    }
  }

  const handleCancel = async (row: HomecomingApplication) => {
    const reason = window.prompt(
      `${row.name}(${row.phone}) 님의 신청을 취소합니다.\n집계·명찰에서 빠집니다. 사유를 적어주세요 (선택).`,
      ''
    )
    if (reason === null) return
    setError(null)
    try {
      await cancelHomecomingApplication(apiClient, row.id, reason.trim())
      await load()
    } catch (e) {
      setError(readErrorMessage(e))
    }
  }

  return (
    <main className={ADMIN_PAGE}>
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading && tab === 'applications'} />

      <section className={`${ADMIN_CONTAINER} pt-[clamp(20px,2.5vw,32px)]`}>
        <p data-admin-reveal className={ADMIN_CAPTION}>
          2026 홈커밍데이 · 12.19 SAT
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className={ADMIN_TITLE}>홈커밍 신청 관리</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={ADMIN_GHOST_BUTTON}
              onClick={() => handleCsv('nametags')}
            >
              명찰 CSV
            </button>
            <button
              type="button"
              className={ADMIN_GHOST_BUTTON}
              onClick={() => handleCsv('applications')}
            >
              전체 명단 CSV
            </button>
          </div>
        </div>

        <div data-admin-reveal className="mt-5 flex gap-2" role="tablist" aria-label="보기 전환">
          {(
            [
              ['applications', '신청'],
              ['consents', '장기 등록']
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`rounded-full px-[18px] py-2 text-[14px] transition-colors ${
                tab === value
                  ? 'bg-admin-accent text-admin-accent-ink'
                  : 'border border-admin-line text-admin-ink-muted hover:text-admin-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className={ADMIN_ERROR_BANNER}>{error}</p>}

        {tab === 'consents' ? (
          <HomecomingConsentPanel />
        ) : (
          <>
            {summary && <SummaryCards summary={summary} />}

            <div data-admin-reveal className="mt-5 flex flex-wrap items-center gap-3">
              <label className={ADMIN_PILL}>
                <span className="text-[13px] text-admin-ink-dim">범위</span>
                <select
                  className={ADMIN_PILL_SELECT}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as HomecomingStatus | '')}
                >
                  {STATUS_CHOICES.map((choice) => (
                    <option key={choice.label} value={choice.value} className={ADMIN_OPTION}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ADMIN_PILL}>
                <span className="text-[13px] text-admin-ink-dim">참석</span>
                <select
                  className={ADMIN_PILL_SELECT}
                  value={attendType}
                  onChange={(e) => setAttendType(e.target.value as AttendType | '')}
                >
                  <option value="" className={ADMIN_OPTION}>
                    전체 유형
                  </option>
                  {ATTEND_TYPES.map((type) => (
                    <option key={type} value={type} className={ADMIN_OPTION}>
                      {ATTEND_LABEL[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ADMIN_SEARCH_FIELD}>
                <span className="sr-only">이름·전화번호 검색</span>
                <input
                  className={ADMIN_SEARCH_INPUT}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="이름 또는 전화번호"
                />
              </label>
              <p className="text-[13px] text-admin-ink-dim">{visibleRows.length}명</p>
            </div>

            <div data-admin-reveal className={`${ADMIN_TABLE_CARD} mt-5`}>
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr>
                    <th className={ADMIN_TH}>이름</th>
                    <th className={ADMIN_TH}>전화번호</th>
                    <th className={ADMIN_TH}>참석</th>
                    <th className={ADMIN_TH}>Notion</th>
                    <th className={ADMIN_TH}>활동</th>
                    <th className={ADMIN_TH}>도착</th>
                    <th className={ADMIN_TH}>문의·요청</th>
                    <th className={ADMIN_TH}>초청·인재풀</th>
                    <th className={ADMIN_TH}>신청일</th>
                    <th className={ADMIN_TH}>
                      <span className="sr-only">관리</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 && !loading ? (
                    <tr>
                      <td className={ADMIN_EMPTY_CELL} colSpan={10}>
                        {rows.length === 0 ? '아직 신청이 없습니다.' : '검색 결과가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row) => {
                      const canceled = row.status === 'CANCELED'
                      return (
                        <tr key={row.id} className={`${ADMIN_TR} ${canceled ? 'opacity-55' : ''}`}>
                          <td className={ADMIN_TD}>
                            {row.name}
                            {canceled && (
                              <span
                                className="ml-1.5 text-[12px] text-admin-ink-dim"
                                title={row.cancelReason ?? undefined}
                              >
                                (취소)
                              </span>
                            )}
                          </td>
                          <td className={`${ADMIN_TD_MUTED} tabular-nums`}>{row.phone}</td>
                          <td className={ADMIN_TD}>{row.attendLabel}</td>
                          <td className={ADMIN_TD_MUTED}>{row.notionStatus}</td>
                          <td className={ADMIN_TD_MUTED}>{row.activitySummary || '—'}</td>
                          <td className={ADMIN_TD_MUTED}>
                            {row.attendType === 'main' || row.attendType === 'both'
                              ? row.late
                                ? `${row.arrivalTime} 늦참`
                                : '정시'
                              : '—'}
                          </td>
                          <td
                            className={`${ADMIN_TD_MUTED} max-w-[220px] truncate`}
                            title={row.message ?? undefined}
                          >
                            {row.message ?? ''}
                          </td>
                          <td className={ADMIN_TD_MUTED}>
                            {CONSENT_STATE_LABEL[row.eventInvite]} ·{' '}
                            {CONSENT_STATE_LABEL[row.talentPool]}
                          </td>
                          <td className={ADMIN_TD_MUTED}>{formatDate(row.submittedAt)}</td>
                          <td className={ADMIN_TD}>
                            {!canceled && (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  className={ADMIN_GHOST_BUTTON}
                                  onClick={() => setEditing(row)}
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  className={ADMIN_GHOST_BUTTON}
                                  onClick={() => handleCancel(row)}
                                >
                                  취소
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {editing && (
        <HomecomingEditModal
          application={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            void load()
          }}
        />
      )}
    </main>
  )
}

function SummaryCards({ summary }: { summary: HomecomingSummary }) {
  const cards: { label: string; value: number; note?: string }[] = [
    { label: '응답', value: summary.total, note: `취소 ${summary.canceled}` },
    { label: '본 행사', value: summary.mainEventAttendees, note: '명찰 수 · main+both' },
    { label: '뒤풀이', value: summary.afterPartyAttendees, note: 'after+both' },
    { label: '늦참', value: summary.lateArrivals },
    { label: '미정', value: summary.maybe },
    { label: '불참', value: summary.no }
  ]
  return (
    <div data-admin-reveal className="mt-5">
      <div className="grid grid-cols-2 gap-3 pc:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[16px] border border-admin-line-soft bg-admin-card px-4 py-3.5 shadow-admin"
          >
            <p className="text-[12px] text-admin-ink-dim">{card.label}</p>
            <p className="mt-1 text-[24px] font-semibold tabular-nums text-admin-ink">
              {card.value}
            </p>
            {card.note && <p className="text-[12px] text-admin-ink-dim">{card.note}</p>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-admin-ink-dim">
        유형별: 본 행사만 {summary.main} · 뒤풀이만 {summary.after} · 둘 다 {summary.both} · 미정{' '}
        {summary.maybe} · 불참 {summary.no}
      </p>
    </div>
  )
}
