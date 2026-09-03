'use client'

import { useCallback, useEffect, useState } from 'react'

import Loader from '@/components/ui/common/Loader'
import AdminCategoryNav from '@/components/admin/dashboard/AdminCategoryNav'
import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import AdminPagination from '@/components/admin/dashboard/AdminPagination'
import {
  ADMIN_ACCENT_BUTTON,
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
import { formatMajorLabel } from '@/constant/majorOptions'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { hasAtLeast } from '@/utils/auth/role'

type RecruitCoreResultStatus = 'SUBMITTED' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED'

type RecruitCoreApplicantSummary = {
  applicationId: number
  name: string
  studentId: string
  major: string
  team: string
  resultStatus: RecruitCoreResultStatus
  session: string
  createdAt: string
}

type RecruitCoreApplicantDetail = {
  applicationId: number
  session: string
  snapshot: {
    name: string
    studentId: string
    phone: string
    major: string
    email: string
  }
  team: string
  motivation: string
  wish: string
  strengths: string
  pledge: string
  fileUrls: string[]
  resultStatus: RecruitCoreResultStatus
  review: {
    reviewedAt: string | null
    reviewedBy: number | null
    resultNote: string | null
  } | null
  createdAt: string
  updatedAt: string
}

type RecruitCoreApplicationPageResponse = {
  content?: RecruitCoreApplicantSummary[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  last?: boolean
}

type RecruitCoreDecisionResponse = {
  applicationId: number
  resultStatus: RecruitCoreResultStatus
  reviewedAt: string | null
  reviewedBy: number | null
  userUpdated?: {
    userRole: string
    team: string | null
  } | null
}

const STATUS_OPTIONS: Array<{ label: string; value: RecruitCoreResultStatus | 'ALL' }> = [
  { label: '전체', value: 'ALL' },
  { label: '제출', value: 'SUBMITTED' },
  { label: '검토 중', value: 'IN_REVIEW' },
  { label: '합격', value: 'ACCEPTED' },
  { label: '불합격', value: 'REJECTED' }
]

const TEAM_OPTIONS = ['ALL', 'HQ', 'HR', 'PR_DESIGN', 'TECH', 'BD'] as const

/** 표에 enum 을 그대로 보여 주면 읽는 사람이 매번 번역해야 한다. */
const STATUS_LABEL: Record<RecruitCoreResultStatus, string> = {
  SUBMITTED: '제출',
  IN_REVIEW: '검토 중',
  ACCEPTED: '합격',
  REJECTED: '불합격'
}

const STATUS_TONE: Record<RecruitCoreResultStatus, string> = {
  SUBMITTED: 'text-admin-ink-muted',
  IN_REVIEW: 'text-admin-ink-muted',
  ACCEPTED: 'text-signal-ok',
  REJECTED: 'text-signal-err'
}

const HEADER_LINKS = [
  { label: '← 대시보드', href: '/dashboard' },
  { label: '온보딩 화면', href: '/' }
]

const SIBLING_SCREENS = [
  { label: 'Users', href: '/dashboard/users' },
  { label: 'Members', href: '/dashboard/members' },
  { label: 'Core 출석', href: '/dashboard/core/attendance' }
]

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const currentRecruitSession = () => {
  const now = new Date()
  const semester = now.getMonth() + 1 <= 6 ? 1 : 2
  return `${now.getFullYear()}-${semester}`
}

export default function DashboardCoreApplicationsPage() {
  const { apiClient } = useAuthenticatedApi()
  const { user } = useAuth()
  const canDecide = hasAtLeast(user?.userRole, 'LEAD')

  const [session, setSession] = useState(currentRecruitSession())
  const [selectedStatus, setSelectedStatus] = useState<RecruitCoreResultStatus | 'ALL'>('ALL')
  const [selectedTeam, setSelectedTeam] = useState<(typeof TEAM_OPTIONS)[number]>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<RecruitCoreApplicantSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
  const [detail, setDetail] = useState<RecruitCoreApplicantDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [decisionNote, setDecisionNote] = useState('')
  const [overwriteTeamIfExists, setOverwriteTeamIfExists] = useState(true)
  const [decisionLoading, setDecisionLoading] = useState<'accept' | 'reject' | null>(null)

  const fetchApplications = useCallback(async () => {
    if (!session.trim()) {
      setApplications([])
      setTotalPages(1)
      setTotalElements(0)
      setError('세션 값을 입력해 주세요.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<RecruitCoreApplicationPageResponse>(
        '/admin/recruit/core/applications',
        {
          params: {
            session: session.trim(),
            page: page - 1,
            size: 20,
            ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
            ...(selectedTeam !== 'ALL' ? { team: selectedTeam } : {})
          }
        }
      )

      setApplications(response.data?.content ?? [])
      setTotalPages(response.data?.totalPages || 1)
      setTotalElements(response.data?.totalElements || 0)
    } catch (e: any) {
      setApplications([])
      setTotalPages(1)
      setTotalElements(0)
      setError(e?.response?.data?.message || '코어 지원서 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [apiClient, page, selectedStatus, selectedTeam, session])

  useEffect(() => {
    void fetchApplications()
  }, [fetchApplications])

  const openDetail = useCallback(
    async (applicationId: number) => {
      setSelectedApplicationId(applicationId)
      setDetailLoading(true)
      setDetailError(null)
      setDecisionNote('')
      setOverwriteTeamIfExists(true)

      try {
        const response = await apiClient.get<RecruitCoreApplicantDetail>(
          `/admin/recruit/core/applications/${applicationId}`
        )
        setDetail(response.data)
      } catch (e: any) {
        setDetail(null)
        setDetailError(e?.response?.data?.message || '지원서 상세를 불러오지 못했습니다.')
      } finally {
        setDetailLoading(false)
      }
    },
    [apiClient]
  )

  const closeDetail = () => {
    setSelectedApplicationId(null)
    setDetail(null)
    setDetailError(null)
    setDecisionNote('')
    setDecisionLoading(null)
  }

  const handleDecision = useCallback(
    async (action: 'accept' | 'reject') => {
      if (!selectedApplicationId || !detail) return
      if (!decisionNote.trim()) {
        alert('처리 메모를 입력해 주세요.')
        return
      }

      try {
        setDecisionLoading(action)
        const response = await apiClient.post<RecruitCoreDecisionResponse>(
          `/admin/recruit/core/applications/${selectedApplicationId}/${action}`,
          action === 'accept'
            ? {
                resultNote: decisionNote.trim(),
                overwriteTeamIfExists
              }
            : {
                resultNote: decisionNote.trim()
              }
        )

        const nextStatus =
          response.data?.resultStatus ?? (action === 'accept' ? 'ACCEPTED' : 'REJECTED')
        setApplications((prev) =>
          prev.map((item) =>
            item.applicationId === selectedApplicationId
              ? { ...item, resultStatus: nextStatus }
              : item
          )
        )
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                resultStatus: nextStatus,
                review: {
                  reviewedAt: response.data?.reviewedAt ?? new Date().toISOString(),
                  reviewedBy: response.data?.reviewedBy ?? null,
                  resultNote: decisionNote.trim()
                }
              }
            : prev
        )

        if (action === 'accept') {
          const updatedRole = response.data?.userUpdated?.userRole
          alert(
            updatedRole
              ? `합격 처리되었습니다. 사용자 권한이 ${updatedRole}로 변경되었습니다.`
              : '합격 처리되었습니다.'
          )
        } else {
          alert('불합격 처리되었습니다.')
        }
      } catch (e: any) {
        alert(e?.response?.data?.message || '지원서 처리에 실패했습니다.')
      } finally {
        setDecisionLoading(null)
      }
    },
    [apiClient, decisionNote, detail, overwriteTeamIfExists, selectedApplicationId]
  )

  return (
    <div className={ADMIN_PAGE}>
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading || detailLoading} />

      <section className={`${ADMIN_CONTAINER} pt-[clamp(20px,2.5vw,32px)]`}>
        <p data-admin-reveal className={ADMIN_CAPTION}>
          Core Applications
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className={ADMIN_TITLE}>코어 지원서</h1>
          <span className="text-[14px] text-admin-ink-soft">
            전체 {totalElements}건 · 페이지 {page} / {totalPages}
          </span>
        </div>

        <AdminCategoryNav category="멤버 · 지원" current="Core 지원서" siblings={SIBLING_SCREENS} />

        <div data-admin-reveal className="mt-3 flex flex-wrap items-center gap-2.5">
          <label className={ADMIN_SEARCH_FIELD}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">세션</span>
            <input
              type="text"
              value={session}
              onChange={(e) => {
                setPage(1)
                setSession(e.target.value)
              }}
              placeholder="예: 2026-1"
              className={ADMIN_SEARCH_INPUT}
            />
          </label>

          <label className={ADMIN_PILL}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">상태</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setPage(1)
                setSelectedStatus(e.target.value as RecruitCoreResultStatus | 'ALL')
              }}
              className={ADMIN_PILL_SELECT}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className={ADMIN_OPTION}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={ADMIN_PILL}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">팀</span>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setPage(1)
                setSelectedTeam(e.target.value as (typeof TEAM_OPTIONS)[number])
              }}
              className={ADMIN_PILL_SELECT}
            >
              {TEAM_OPTIONS.map((team) => (
                <option key={team} value={team} className={ADMIN_OPTION}>
                  {team === 'ALL' ? '전체' : team}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p role="alert" className={ADMIN_ERROR_BANNER}>
            {error}
          </p>
        ) : null}
      </section>

      <section data-admin-reveal className={`${ADMIN_CONTAINER} pt-4`}>
        <div className={ADMIN_TABLE_CARD}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['이름', '학과 · 학번', '지원 팀', '상태', '제출 시각'].map((label) => (
                  <th key={label} className={ADMIN_TH}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className={ADMIN_EMPTY_CELL}>
                    조회된 지원서가 없습니다.
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application.applicationId}
                    onClick={() => void openDetail(application.applicationId)}
                    className={`${ADMIN_TR} cursor-pointer`}
                  >
                    <td className={`${ADMIN_TD} whitespace-nowrap text-[15px]`}>
                      {application.name}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="block break-keep text-[14px] text-admin-ink-muted">
                        {formatMajorLabel(application.major)}
                      </span>
                      <span className="mt-[3px] block text-[12px] tabular-nums text-admin-ink-dim">
                        {application.studentId || '-'}
                      </span>
                    </td>
                    <td className={`${ADMIN_TD_MUTED} whitespace-nowrap`}>{application.team}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      <span
                        className={`text-[13px] ${STATUS_TONE[application.resultStatus] ?? 'text-admin-ink-muted'}`}
                      >
                        {STATUS_LABEL[application.resultStatus] ?? application.resultStatus}
                      </span>
                    </td>
                    <td className={`${ADMIN_TD_MUTED} whitespace-nowrap tabular-nums`}>
                      {formatDateTime(application.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />

      {selectedApplicationId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-admin-base/80 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-full w-full max-w-[900px] overflow-y-auto rounded-[20px] border border-admin-line-soft bg-admin-card p-6 shadow-admin-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-admin-ink">
                  코어 지원서 상세
                </h2>
                <p className="mt-1 text-[13px] text-admin-ink-dim">
                  {detail
                    ? `${detail.snapshot.name} · ${detail.team} · ${STATUS_LABEL[detail.resultStatus] ?? detail.resultStatus}`
                    : '상세 로딩 중'}
                </p>
              </div>
              <button type="button" onClick={closeDetail} className={ADMIN_GHOST_BUTTON}>
                닫기
              </button>
            </div>

            {detailError ? (
              <p role="alert" className={ADMIN_ERROR_BANNER}>
                {detailError}
              </p>
            ) : null}

            {detail ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 pc:grid-cols-2">
                  <div className="rounded-2xl border border-admin-line-soft bg-admin-base p-4">
                    <p className={ADMIN_CAPTION}>기본 정보</p>
                    <dl className="mt-3 space-y-1.5 text-[14px]">
                      {[
                        ['이름', detail.snapshot.name],
                        ['학번', detail.snapshot.studentId],
                        ['전공', formatMajorLabel(detail.snapshot.major)],
                        ['전화번호', detail.snapshot.phone],
                        ['이메일', detail.snapshot.email],
                        ['지원 팀', detail.team],
                        ['제출 시각', formatDateTime(detail.createdAt)]
                      ].map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <dt className="w-20 shrink-0 text-admin-ink-dim">{label}</dt>
                          <dd className="min-w-0 break-all text-admin-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="rounded-2xl border border-admin-line-soft bg-admin-base p-4">
                    <p className={ADMIN_CAPTION}>검토 정보</p>
                    <dl className="mt-3 space-y-1.5 text-[14px]">
                      {[
                        ['상태', STATUS_LABEL[detail.resultStatus] ?? detail.resultStatus],
                        ['검토 시각', formatDateTime(detail.review?.reviewedAt)],
                        ['검토자 ID', String(detail.review?.reviewedBy ?? '-')],
                        ['기존 메모', detail.review?.resultNote || '-']
                      ].map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <dt className="w-20 shrink-0 text-admin-ink-dim">{label}</dt>
                          <dd className="min-w-0 break-keep text-admin-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                {[
                  ['지원 동기', detail.motivation],
                  ['하고 싶은 일', detail.wish],
                  ['강점', detail.strengths],
                  ['다짐', detail.pledge]
                ].map(([label, value]) => (
                  <section
                    key={label}
                    className="rounded-2xl border border-admin-line-soft bg-admin-base p-4"
                  >
                    <p className={ADMIN_CAPTION}>{label}</p>
                    <p className="mt-2.5 whitespace-pre-wrap break-keep text-[14px] leading-[1.7] text-admin-ink">
                      {value}
                    </p>
                  </section>
                ))}

                <section className="rounded-2xl border border-admin-line-soft bg-admin-base p-4">
                  <p className={ADMIN_CAPTION}>첨부 파일</p>
                  <div className="mt-2.5 space-y-2">
                    {detail.fileUrls.length > 0 ? (
                      detail.fileUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-all text-[14px] text-admin-accent underline underline-offset-2"
                        >
                          {url}
                        </a>
                      ))
                    ) : (
                      <p className="text-[14px] text-admin-ink-dim">첨부 파일이 없습니다.</p>
                    )}
                  </div>
                </section>

                {detail.resultStatus === 'SUBMITTED' || detail.resultStatus === 'IN_REVIEW' ? (
                  <section className="rounded-2xl border border-admin-line-soft bg-admin-base p-4">
                    <p className={ADMIN_CAPTION}>처리 메모</p>
                    <textarea
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      rows={5}
                      placeholder="합격/불합격 처리 메모를 입력해 주세요."
                      className="mt-2.5 w-full rounded-xl border border-admin-line bg-admin-card px-4 py-3 text-[14px] text-admin-ink outline-none transition-colors duration-200 focus:border-admin-accent"
                    />
                    <label className="mt-3 flex items-center gap-2 text-[13px] text-admin-ink-muted">
                      <input
                        type="checkbox"
                        checked={overwriteTeamIfExists}
                        onChange={(e) => setOverwriteTeamIfExists(e.target.checked)}
                        className="accent-admin-accent"
                      />
                      합격 처리할 때 기존 팀이 있어도 지원 팀으로 덮어쓰기
                    </label>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDecision('reject')}
                        disabled={decisionLoading !== null || !canDecide}
                        className="whitespace-nowrap rounded-full border border-signal-err px-5 py-2.5 text-[14px] text-signal-err transition-colors duration-200 hover:bg-signal-err/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        불합격
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDecision('accept')}
                        disabled={decisionLoading !== null || !canDecide}
                        className={ADMIN_ACCENT_BUTTON}
                      >
                        합격 처리
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
