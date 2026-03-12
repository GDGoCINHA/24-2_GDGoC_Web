'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Loader from '@/components/ui/common/Loader'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'

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
      const response = await apiClient.get<RecruitCoreApplicationPageResponse>('/admin/recruit/core/applications', {
        params: {
          session: session.trim(),
          page: page - 1,
          size: 20,
          ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
          ...(selectedTeam !== 'ALL' ? { team: selectedTeam } : {})
        }
      })

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

        const nextStatus = response.data?.resultStatus ?? (action === 'accept' ? 'ACCEPTED' : 'REJECTED')
        setApplications((prev) =>
          prev.map((item) =>
            item.applicationId === selectedApplicationId ? { ...item, resultStatus: nextStatus } : item
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
          alert(updatedRole ? `합격 처리되었습니다. 사용자 권한이 ${updatedRole}로 변경되었습니다.` : '합격 처리되었습니다.')
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

  const pageNumbers = useMemo(() => {
    const maxVisible = 7
    const pages: number[] = []
    const start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [page, totalPages])

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white pc:px-10">
      <Loader isLoading={loading || detailLoading} />

      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 pc:flex-row pc:items-center pc:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="typo-h4 mobile:typo-m-h3">Core Applications Dashboard</h1>
            <Link href="/dashboard/users" className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 hover:border-white">Users</Link>
            <Link href="/dashboard/members" className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 hover:border-white">Members</Link>
            <Link href="/dashboard/mbti" className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 hover:border-white">MBTI</Link>
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-white/10 bg-gray-100/30 p-4 pc:grid-cols-[180px_180px_180px_auto]">
          <input
            value={session}
            onChange={(e) => {
              setPage(1)
              setSession(e.target.value)
            }}
            placeholder="예: 2026-1"
            className="h-11 rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white"
          />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setPage(1)
              setSelectedStatus(e.target.value as RecruitCoreResultStatus | 'ALL')
            }}
            className="h-11 rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={selectedTeam}
            onChange={(e) => {
              setPage(1)
              setSelectedTeam(e.target.value as (typeof TEAM_OPTIONS)[number])
            }}
            className="h-11 rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white"
          >
            {TEAM_OPTIONS.map((team) => (
              <option key={team} value={team}>
                {team === 'ALL' ? '전체 팀' : team}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end rounded-lg border border-white/10 bg-black px-4 typo-pc-c2 text-gray-700">
            총 {totalElements}건
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-white/10 bg-gray-100/30">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-4 py-3 text-left typo-pc-b3 text-gray-700">이름</th>
                  <th className="px-4 py-3 text-left typo-pc-b3 text-gray-700">학번</th>
                  <th className="px-4 py-3 text-left typo-pc-b3 text-gray-700">전공</th>
                  <th className="px-4 py-3 text-left typo-pc-b3 text-gray-700">지원 팀</th>
                  <th className="px-4 py-3 text-left typo-pc-b3 text-gray-700">상태</th>
                  <th className="px-4 py-3 text-left typo-pc-b3 text-gray-700">제출일</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center typo-pc-b3 text-gray-700">
                      조회된 지원서가 없습니다.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr
                      key={application.applicationId}
                      onClick={() => void openDetail(application.applicationId)}
                      className="cursor-pointer border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 typo-pc-b3">{application.name}</td>
                      <td className="px-4 py-3 typo-pc-b3">{application.studentId}</td>
                      <td className="px-4 py-3 typo-pc-b3">{application.major}</td>
                      <td className="px-4 py-3 typo-pc-b3">{application.team}</td>
                      <td className="px-4 py-3 typo-pc-b3">{application.resultStatus}</td>
                      <td className="px-4 py-3 typo-pc-b3">{formatDateTime(application.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="h-10 rounded-lg border border-white/10 px-3 typo-pc-c2 disabled:opacity-40"
          >
            이전
          </button>
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`h-10 min-w-10 rounded-lg px-3 typo-pc-c2 ${
                pageNumber === page ? 'bg-red text-white' : 'border border-white/10 text-gray-700'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="h-10 rounded-lg border border-white/10 px-3 typo-pc-c2 disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>

      {selectedApplicationId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-full w-full max-w-[900px] overflow-y-auto rounded-2xl border border-white/10 bg-black p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="typo-pc-h4 text-white">코어 지원서 상세</h2>
                <p className="mt-1 typo-pc-c2 text-gray-700">
                  {detail ? `${detail.snapshot.name} / ${detail.team} / ${detail.resultStatus}` : '상세 로딩 중'}
                </p>
              </div>
              <button type="button" onClick={closeDetail} className="rounded-lg border border-white/10 px-3 py-2 typo-pc-c2">
                닫기
              </button>
            </div>

            {detailError ? <div className="mt-4 rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">{detailError}</div> : null}

            {detail ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-3 pc:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
                    <p className="typo-pc-c2 text-gray-700">기본 정보</p>
                    <div className="mt-3 space-y-2 typo-pc-b3">
                      <p>이름: {detail.snapshot.name}</p>
                      <p>학번: {detail.snapshot.studentId}</p>
                      <p>전공: {detail.snapshot.major}</p>
                      <p>전화번호: {detail.snapshot.phone}</p>
                      <p>이메일: {detail.snapshot.email}</p>
                      <p>지원 팀: {detail.team}</p>
                      <p>제출 시각: {formatDateTime(detail.createdAt)}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
                    <p className="typo-pc-c2 text-gray-700">검토 정보</p>
                    <div className="mt-3 space-y-2 typo-pc-b3">
                      <p>상태: {detail.resultStatus}</p>
                      <p>검토 시각: {formatDateTime(detail.review?.reviewedAt)}</p>
                      <p>검토자 ID: {detail.review?.reviewedBy ?? '-'}</p>
                      <p>기존 메모: {detail.review?.resultNote || '-'}</p>
                    </div>
                  </div>
                </div>

                {[
                  ['지원 동기', detail.motivation],
                  ['하고 싶은 일', detail.wish],
                  ['강점', detail.strengths],
                  ['다짐', detail.pledge]
                ].map(([label, value]) => (
                  <section key={label} className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
                    <p className="typo-pc-c2 text-gray-700">{label}</p>
                    <p className="mt-3 whitespace-pre-wrap typo-pc-b3 text-white">{value}</p>
                  </section>
                ))}

                <section className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
                  <p className="typo-pc-c2 text-gray-700">첨부 파일</p>
                  <div className="mt-3 space-y-2">
                    {detail.fileUrls.length > 0 ? (
                      detail.fileUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-all typo-pc-b3 text-[#9EC0FF] underline"
                        >
                          {url}
                        </a>
                      ))
                    ) : (
                      <p className="typo-pc-b3 text-gray-700">첨부 파일이 없습니다.</p>
                    )}
                  </div>
                </section>

                {detail.resultStatus === 'SUBMITTED' || detail.resultStatus === 'IN_REVIEW' ? (
                  <section className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
                    <p className="typo-pc-c2 text-gray-700">처리 메모</p>
                    <textarea
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      rows={5}
                      placeholder="합격/불합격 처리 메모를 입력해 주세요."
                      className="mt-3 w-full rounded-xl border border-gray-300 bg-black px-4 py-3 typo-pc-b3 text-white outline-none focus:border-white"
                    />
                    <label className="mt-3 flex items-center gap-2 typo-pc-c2 text-gray-700">
                      <input
                        type="checkbox"
                        checked={overwriteTeamIfExists}
                        onChange={(e) => setOverwriteTeamIfExists(e.target.checked)}
                      />
                      accept 시 기존 팀이 있어도 지원 팀으로 덮어쓰기
                    </label>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDecision('reject')}
                        disabled={decisionLoading !== null}
                        className="h-11 rounded-lg border border-red px-4 typo-pc-b3 text-red disabled:opacity-50"
                      >
                        불합격
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDecision('accept')}
                        disabled={decisionLoading !== null}
                        className="h-11 rounded-lg bg-red px-4 typo-pc-b3 text-white disabled:opacity-50"
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
