'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Loader from '@/components/ui/common/Loader'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'

type MbtiResultRow = {
  id: number
  name: string
  studentId: string
  mbtiType: string
  updatedAt: string
  createdAt: string
}

type MbtiResultPage = {
  content?: MbtiResultRow[]
}

type MbtiResultListResponse = {
  code: number
  message: string
  data?: MbtiResultPage | MbtiResultRow[]
  meta?: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

type MbtiStatsResponse = {
  code: number
  message: string
  data?: {
    totalCount: number
    typeCounts: Array<{
      mbtiType: string
      count: number
    }>
  }
}

type CsvCandidate = {
  name: string
  studentId: string
}

type TeamMatchingResponse = {
  code: number
  message: string
  data?: {
    totalCandidates: number
    uniqueCandidates: number
    matchedCount: number
    unmatchedCount: number
    teamSize: number
    teamCount: number
    teams: Array<{
      teamNumber: number
      members: Array<{
        name: string
        studentId: string
        mbtiType: string
      }>
    }>
    unmatchedCandidates: Array<{
      name: string
      studentId: string
      reason: string
    }>
  }
}

const splitCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }

    current += char
  }

  result.push(current)
  return result.map((item) => item.trim())
}

const parseCsvCandidates = (raw: string): CsvCandidate[] => {
  const lines = raw
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return []
  }

  const rows = lines.map(splitCsvLine)
  const firstRow = rows[0]
  const normalizedHeader = firstRow.map((cell) => cell.toLowerCase())

  const nameColumn = normalizedHeader.findIndex(
    (cell) => cell.includes('이름') || cell.includes('name')
  )
  const studentIdColumn = normalizedHeader.findIndex(
    (cell) => cell.includes('학번') || cell.includes('student') || cell.includes('id')
  )

  const hasHeader = nameColumn >= 0 && studentIdColumn >= 0
  const dataRows = hasHeader ? rows.slice(1) : rows

  const resolvedNameColumn = hasHeader ? nameColumn : 0
  const resolvedStudentIdColumn = hasHeader ? studentIdColumn : 1

  if (!hasHeader && firstRow.length < 2) {
    return []
  }

  return dataRows
    .map((row) => ({
      name: (row[resolvedNameColumn] ?? '').trim(),
      studentId: (row[resolvedStudentIdColumn] ?? '').trim()
    }))
    .filter((item) => item.name !== '' && item.studentId !== '')
}

export default function DashboardMbtiPage() {
  const { apiClient } = useAuthenticatedApi()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rows, setRows] = useState<MbtiResultRow[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')

  const [typeCounts, setTypeCounts] = useState<Array<{ mbtiType: string; count: number }>>([])

  const [teamSize, setTeamSize] = useState(4)
  const [csvCandidates, setCsvCandidates] = useState<CsvCandidate[]>([])
  const [csvFileName, setCsvFileName] = useState('')
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchingError, setMatchingError] = useState<string | null>(null)
  const [matchingResult, setMatchingResult] = useState<TeamMatchingResponse['data'] | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<MbtiResultListResponse>('/admin/game/mbti/results', {
        params: {
          page: page - 1,
          size: 50,
          sort: 'updatedAt',
          dir: 'DESC',
          ...(query.trim() ? { q: query.trim() } : {})
        }
      })

      const payload = response.data?.data
      const content = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : []

      setRows(content)
      setTotalPages(response.data?.meta?.totalPages || 1)
      setTotalElements(response.data?.meta?.totalElements || 0)
    } catch (e: any) {
      setRows([])
      setTotalPages(1)
      setTotalElements(0)
      setError(e?.response?.data?.message || 'MBTI 결과 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [apiClient, page, query])

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get<MbtiStatsResponse>('/game/mbti/result/stats')
      const counts = Array.isArray(response.data?.data?.typeCounts)
        ? response.data.data.typeCounts
        : []
      setTypeCounts(counts)
    } catch {
      setTypeCounts([])
    }
  }, [apiClient])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  const handleCsvUpload = async (file: File) => {
    const raw = await file.text()
    const parsed = parseCsvCandidates(raw)

    if (parsed.length === 0) {
      setCsvCandidates([])
      setCsvFileName(file.name)
      setMatchingError('CSV에서 이름/학번 데이터를 읽지 못했습니다. 헤더(이름, 학번) 또는 2열 형식을 확인해 주세요.')
      return
    }

    setCsvCandidates(parsed)
    setCsvFileName(file.name)
    setMatchingError(null)
    setMatchingResult(null)
  }

  const handleRunMatching = async () => {
    if (csvCandidates.length === 0) {
      setMatchingError('먼저 이름, 학번 CSV를 업로드해 주세요.')
      return
    }

    setMatchingLoading(true)
    setMatchingError(null)

    try {
      const response = await apiClient.post<TeamMatchingResponse>('/admin/game/mbti/team-matching', {
        candidates: csvCandidates,
        teamSize
      })
      setMatchingResult(response.data?.data ?? null)
    } catch (e: any) {
      setMatchingResult(null)
      setMatchingError(e?.response?.data?.message || '팀 매칭에 실패했습니다.')
    } finally {
      setMatchingLoading(false)
    }
  }

  const sortedTypeCounts = useMemo(
    () => [...typeCounts].sort((a, b) => b.count - a.count || a.mbtiType.localeCompare(b.mbtiType)),
    [typeCounts]
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
      <Loader isLoading={loading || matchingLoading} />

      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="typo-h4 mobile:typo-m-h3">MBTI Admin Dashboard</h1>
          <Link
            href="/dashboard/users"
            className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
          >
            Users
          </Link>
          <Link
            href="/dashboard/members"
            className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
          >
            Members
          </Link>
        </div>

        <div className="grid gap-4 pc:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
            <p className="typo-pc-b3 text-gray-700">저장된 MBTI 결과</p>
            <p className="mt-1 text-2xl font-semibold text-white">{totalElements}명</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
            <p className="typo-pc-b3 text-gray-700">유형 분포</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sortedTypeCounts.length === 0 ? (
                <span className="typo-pc-c2 text-gray-700">집계 데이터 없음</span>
              ) : (
                sortedTypeCounts.map((item) => (
                  <span
                    key={item.mbtiType}
                    className="inline-flex rounded-full border border-white/20 px-3 py-1 typo-pc-c2"
                  >
                    {item.mbtiType} {item.count}명
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black p-4">
          <div className="flex flex-col gap-3 pc:flex-row pc:items-center pc:justify-between">
            <h2 className="typo-pc-h4">MBTI 결과 조회</h2>
            <div className="flex w-full gap-2 pc:w-auto">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1)
                    setQuery(searchInput)
                  }
                }}
                placeholder="이름/학번/유형 검색"
                className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white pc:w-[300px]"
              />
              <button
                type="button"
                onClick={() => {
                  setPage(1)
                  setQuery(searchInput)
                }}
                className="h-11 rounded-lg bg-red px-4 typo-pc-b3 text-white"
              >
                검색
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">
              {error}
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 typo-pc-b3 text-gray-700">이름</th>
                  <th className="px-4 py-3 typo-pc-b3 text-gray-700">학번</th>
                  <th className="px-4 py-3 typo-pc-b3 text-gray-700">유형</th>
                  <th className="px-4 py-3 typo-pc-b3 text-gray-700">수정 시각</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center typo-pc-b3 text-gray-700">
                      조회된 MBTI 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-white/10 bg-black">
                      <td className="px-4 py-3 typo-pc-b3">{row.name}</td>
                      <td className="px-4 py-3 typo-pc-b3">{row.studentId}</td>
                      <td className="px-4 py-3 typo-pc-b3">{row.mbtiType}</td>
                      <td className="px-4 py-3 typo-pc-b3 text-gray-700">
                        {row.updatedAt ? new Date(row.updatedAt).toLocaleString('ko-KR') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="h-9 rounded-lg border border-white/20 px-3 typo-pc-c2 disabled:opacity-50"
            >
              이전
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-9 min-w-9 rounded-lg border px-3 typo-pc-c2 ${
                  pageNumber === page
                    ? 'border-white bg-white text-black'
                    : 'border-white/20 text-white hover:border-white'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-9 rounded-lg border border-white/20 px-3 typo-pc-c2 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black p-4">
          <h2 className="typo-pc-h4">CSV 기반 팀 매칭</h2>
          <p className="mt-1 typo-pc-c2 text-gray-700">
            이름, 학번 CSV를 업로드하면 저장된 MBTI 결과와 매칭해 팀을 자동 분배합니다.
          </p>

          <div className="mt-4 grid gap-3 pc:grid-cols-[1fr_auto_auto] pc:items-center">
            <label className="flex h-11 cursor-pointer items-center rounded-lg border border-white/20 px-3 typo-pc-c2 hover:border-white">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  void handleCsvUpload(file)
                }}
              />
              {csvFileName || 'CSV 파일 선택'}
            </label>

            <label className="flex items-center gap-2 typo-pc-c2">
              팀 인원
              <input
                type="number"
                min={2}
                max={10}
                value={teamSize}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (Number.isNaN(value)) return
                  setTeamSize(Math.min(10, Math.max(2, value)))
                }}
                className="h-11 w-20 rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white"
              />
            </label>

            <button
              type="button"
              onClick={handleRunMatching}
              className="h-11 rounded-lg bg-red px-4 typo-pc-b3 text-white"
            >
              팀 매칭 실행
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-gray-100/30 p-3 typo-pc-c2 text-gray-700">
            CSV 후보 인원: {csvCandidates.length}명
          </div>

          {matchingError ? (
            <div className="mt-3 rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">
              {matchingError}
            </div>
          ) : null}

          {matchingResult ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 pc:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-gray-100/30 p-3">
                  <p className="typo-pc-c2 text-gray-700">원본 후보</p>
                  <p className="typo-pc-h4 text-white">{matchingResult.totalCandidates}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-gray-100/30 p-3">
                  <p className="typo-pc-c2 text-gray-700">중복 제거 후</p>
                  <p className="typo-pc-h4 text-white">{matchingResult.uniqueCandidates}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-gray-100/30 p-3">
                  <p className="typo-pc-c2 text-gray-700">매칭 성공</p>
                  <p className="typo-pc-h4 text-white">{matchingResult.matchedCount}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-gray-100/30 p-3">
                  <p className="typo-pc-c2 text-gray-700">결과 없음</p>
                  <p className="typo-pc-h4 text-white">{matchingResult.unmatchedCount}</p>
                </div>
              </div>

              <div className="grid gap-4 pc:grid-cols-2">
                {matchingResult.teams.map((team) => (
                  <div key={team.teamNumber} className="rounded-xl border border-white/10 bg-black p-4">
                    <p className="typo-pc-h4 text-white">Team {team.teamNumber}</p>
                    <ul className="mt-3 space-y-2">
                      {team.members.map((member) => (
                        <li
                          key={`${team.teamNumber}-${member.studentId}`}
                          className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2"
                        >
                          <span className="typo-pc-b3">
                            {member.name} ({member.studentId})
                          </span>
                          <span className="rounded-full border border-white/20 px-2 py-1 typo-pc-c2">
                            {member.mbtiType}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {matchingResult.unmatchedCandidates.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-black p-4">
                  <p className="typo-pc-h4 text-white">매칭 실패 목록</p>
                  <ul className="mt-3 space-y-2">
                    {matchingResult.unmatchedCandidates.map((candidate) => (
                      <li
                        key={`${candidate.studentId}-${candidate.name}`}
                        className="rounded-lg border border-white/10 px-3 py-2 typo-pc-b3"
                      >
                        {candidate.name} ({candidate.studentId}) - {candidate.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
