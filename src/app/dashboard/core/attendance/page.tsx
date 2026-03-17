'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Loader from '@/components/ui/common/Loader'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { unwrapApiResponse } from '@/utils/api/unwrap'

type AttendanceStatus = 'PRESENT' | 'LATE' | 'PRE_ARRANGED' | 'ABSENT'

type DateListResponse = {
  dates?: string[]
}

type TeamMember = {
  id: string
  name: string
}

type TeamResponse = {
  id: string
  name: string
  members?: TeamMember[]
}

type AttendanceMember = {
  userId: string
  name: string
  team: string
  status: AttendanceStatus
  statusLabel?: string
  lastModifiedAt?: string | null
}

type DaySummaryTeam = {
  teamId: string
  teamName: string
  present: number
  late: number
  preArranged: number
  absent: number
  total: number
}

type DaySummaryResponse = {
  date: string
  perTeam: DaySummaryTeam[]
  present: number
  late: number
  preArranged: number
  absent: number
  total: number
}

const ROLE_RANK: Record<string, number> = {
  GUEST: 0,
  MEMBER: 1,
  CORE: 2,
  LEAD: 3,
  ORGANIZER: 4,
  ADMIN: 5
}

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus
  label: string
  badgeClassName: string
  buttonClassName: string
}> = [
  {
    value: 'PRESENT',
    label: '출석',
    badgeClassName: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    buttonClassName: 'border-emerald-400/40 text-emerald-200 hover:border-emerald-300'
  },
  {
    value: 'LATE',
    label: '지각',
    badgeClassName: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    buttonClassName: 'border-amber-400/40 text-amber-200 hover:border-amber-300'
  },
  {
    value: 'PRE_ARRANGED',
    label: '사전 승인',
    badgeClassName: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
    buttonClassName: 'border-sky-400/40 text-sky-200 hover:border-sky-300'
  },
  {
    value: 'ABSENT',
    label: '결석',
    badgeClassName: 'border-red/40 bg-red/10 text-red',
    buttonClassName: 'border-red/40 text-red hover:border-red'
  }
]

const STATUS_META = STATUS_OPTIONS.reduce<Record<AttendanceStatus, (typeof STATUS_OPTIONS)[number]>>(
  (acc, option) => {
    acc[option.value] = option
    return acc
  },
  {} as Record<AttendanceStatus, (typeof STATUS_OPTIONS)[number]>
)

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

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

const todayString = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export default function DashboardCoreAttendancePage() {
  const { apiClient, authorizedFetch } = useAuthenticatedApi()
  const { user } = useAuth()

  const myRole = user?.userRole ?? 'GUEST'
  const myTeam = user?.team ?? null
  const myRoleRank = ROLE_RANK[myRole] ?? 0
  const canManageAttendance = myRoleRank >= ROLE_RANK.LEAD
  const canSelectTeam = myRoleRank >= ROLE_RANK.ORGANIZER || (myRole === 'LEAD' && myTeam === 'HR')

  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [selectedTeam, setSelectedTeam] = useState('ALL')
  const [members, setMembers] = useState<AttendanceMember[]>([])
  const [summary, setSummary] = useState<DaySummaryResponse | null>(null)
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({})
  const [newDate, setNewDate] = useState(todayString())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState<'daily' | 'matrix' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const effectiveTeamParam = useMemo(() => {
    if (!canSelectTeam) return undefined
    return selectedTeam === 'ALL' ? undefined : selectedTeam
  }, [canSelectTeam, selectedTeam])

  const fetchBaseData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [datesResponse, teamsResponse] = await Promise.all([
        apiClient.get('/core-attendance/meetings'),
        apiClient.get('/core-attendance/meetings/teams')
      ])

      const nextDates = unwrapApiResponse<DateListResponse>(datesResponse.data)?.dates ?? []
      const nextTeams = unwrapApiResponse<TeamResponse[]>(teamsResponse.data) ?? []

      setDates(nextDates)
      setTeams(nextTeams)
      setSelectedDate((prev) => {
        if (prev && nextDates.includes(prev)) return prev
        return nextDates[0] ?? ''
      })
      setSelectedTeam((prev) => {
        if (!canSelectTeam) return myTeam ?? 'ALL'
        if (prev === 'ALL') return prev
        return nextTeams.some((team) => team.id === prev) ? prev : 'ALL'
      })
    } catch (e: any) {
      setDates([])
      setTeams([])
      setMembers([])
      setSummary(null)
      setError(e?.response?.data?.message || '출석 기본 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [apiClient, canSelectTeam, myTeam])

  const fetchAttendanceData = useCallback(
    async (date: string) => {
      if (!date) {
        setMembers([])
        setSummary(null)
        setAttendanceDraft({})
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = effectiveTeamParam ? { team: effectiveTeamParam } : undefined
        const [membersResponse, summaryResponse] = await Promise.all([
          apiClient.get(`/core-attendance/meetings/${date}/members`, { params }),
          apiClient.get(`/core-attendance/meetings/${date}/summary`, { params })
        ])

        const nextMembers = unwrapApiResponse<AttendanceMember[]>(membersResponse.data) ?? []
        const nextSummary = unwrapApiResponse<DaySummaryResponse>(summaryResponse.data)

        setMembers(nextMembers)
        setSummary(nextSummary)
        setAttendanceDraft(
          nextMembers.reduce<Record<string, AttendanceStatus>>((acc, member) => {
            acc[member.userId] = member.status ?? 'ABSENT'
            return acc
          }, {})
        )
      } catch (e: any) {
        setMembers([])
        setSummary(null)
        setAttendanceDraft({})
        setError(e?.response?.data?.message || '출석 현황을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [apiClient, effectiveTeamParam]
  )

  useEffect(() => {
    void fetchBaseData()
  }, [fetchBaseData])

  useEffect(() => {
    void fetchAttendanceData(selectedDate)
  }, [fetchAttendanceData, selectedDate])

  const visibleTeams = useMemo(() => {
    if (summary?.perTeam?.length) return summary.perTeam
    return teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      present: 0,
      late: 0,
      preArranged: 0,
      absent: team.members?.length ?? 0,
      total: team.members?.length ?? 0
    }))
  }, [summary, teams])

  const attendanceDirty = useMemo(
    () => members.some((member) => attendanceDraft[member.userId] !== member.status),
    [attendanceDraft, members]
  )

  const setMemberStatus = (userId: string, status: AttendanceStatus) => {
    if (!canManageAttendance) return
    setAttendanceDraft((prev) => ({
      ...prev,
      [userId]: status
    }))
  }

  const handleSaveAttendance = async () => {
    if (!selectedDate || !canManageAttendance || members.length === 0) return

    const grouped = members.reduce<Record<AttendanceStatus, number[]>>(
      (acc, member) => {
        const status = attendanceDraft[member.userId] ?? 'ABSENT'
        acc[status].push(Number(member.userId))
        return acc
      },
      {
        PRESENT: [],
        LATE: [],
        PRE_ARRANGED: [],
        ABSENT: []
      }
    )

    setSaving(true)
    try {
      const requests = (Object.entries(grouped) as Array<[AttendanceStatus, number[]]>)
        .filter(([, userIds]) => userIds.length > 0)
        .map(([status, userIds]) =>
          apiClient.put(`/core-attendance/meetings/${selectedDate}/attendance`, {
            userIds,
            status
          })
        )

      if (requests.length > 0) {
        await Promise.all(requests)
      }

      await fetchAttendanceData(selectedDate)
      alert('출석 현황을 저장했습니다.')
    } catch (e: any) {
      alert(e?.response?.data?.message || '출석 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateDate = async () => {
    if (!newDate || !canManageAttendance) return

    setCreating(true)
    try {
      await apiClient.post('/core-attendance/meetings', { date: newDate })
      await fetchBaseData()
      setSelectedDate(newDate)
    } catch (e: any) {
      alert(e?.response?.data?.message || '출석 일정을 추가하지 못했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteDate = async () => {
    if (!selectedDate || !canManageAttendance) return
    if (!window.confirm(`${selectedDate} 출석 일정을 삭제할까요?`)) return

    setDeleting(true)
    try {
      await apiClient.delete(`/core-attendance/meetings/${selectedDate}`)
      await fetchBaseData()
    } catch (e: any) {
      alert(e?.response?.data?.message || '출석 일정을 삭제하지 못했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const downloadCsv = useCallback(
    async (path: string, filename: string, mode: 'daily' | 'matrix') => {
      setDownloading(mode)
      try {
        const response = await authorizedFetch(path)
        if (!response.ok) {
          throw new Error('download_failed')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
      } catch {
        alert('CSV 다운로드에 실패했습니다.')
      } finally {
        setDownloading(null)
      }
    },
    [authorizedFetch]
  )

  const totalStatusCards = [
    { label: '출석', value: summary?.present ?? 0, tone: STATUS_META.PRESENT.badgeClassName },
    { label: '지각', value: summary?.late ?? 0, tone: STATUS_META.LATE.badgeClassName },
    { label: '사전 승인', value: summary?.preArranged ?? 0, tone: STATUS_META.PRE_ARRANGED.badgeClassName },
    { label: '결석', value: summary?.absent ?? 0, tone: STATUS_META.ABSENT.badgeClassName }
  ]

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white pc:px-10">
      <Loader isLoading={loading || saving || creating || deleting} />

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <div className="flex flex-col gap-4 pc:flex-row pc:items-center pc:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="typo-h4 mobile:typo-m-h3">Core Attendance</h1>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/core/application"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              Core 지원서
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-100/30 px-4 py-3 typo-pc-b3 text-gray-700">
            {canManageAttendance
              ? 'Lead 이상은 출석, 지각, 사전 승인, 결석 상태를 기록할 수 있습니다.'
              : 'Core 권한은 출석 현황 조회만 가능합니다.'}
          </div>
        </div>

        <div className="grid gap-4 pc:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-white/10 bg-gray-100/30 p-5">
            <div className="flex flex-col gap-4 pc:flex-row pc:items-end pc:justify-between">
              <div className="space-y-2">
                <p className="typo-pc-c2 text-gray-700">Meeting Date</p>
                <div className="flex flex-wrap gap-2">
                  {dates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-full border px-4 py-2 typo-pc-c2 transition ${
                        selectedDate === date
                          ? 'border-white bg-white text-black'
                          : 'border-white/15 text-white hover:border-white/40'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                  {dates.length === 0 ? (
                    <div className="rounded-full border border-white/10 px-4 py-2 typo-pc-c2 text-gray-700">
                      등록된 일정이 없습니다.
                    </div>
                  ) : null}
                </div>
              </div>

              {canManageAttendance ? (
                <div className="flex flex-col gap-2 pc:items-end">
                  <label className="typo-pc-c2 text-gray-700" htmlFor="attendance-date-input">
                    일정 추가
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id="attendance-date-input"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="h-11 rounded-lg border border-white/15 bg-black px-3 text-white outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={handleCreateDate}
                      disabled={creating || !newDate}
                      className="h-11 rounded-lg bg-red px-4 typo-pc-b3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      일정 추가
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDate}
                      disabled={deleting || !selectedDate}
                      className="h-11 rounded-lg border border-red px-4 typo-pc-b3 text-red disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      선택 일정 삭제
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-100/30 p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="typo-pc-c2 text-gray-700">Scope</p>
                <div className="flex flex-wrap gap-2">
                  {canSelectTeam ? (
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="h-11 min-w-[180px] rounded-lg border border-white/15 bg-black px-3 text-white outline-none focus:border-white"
                    >
                      <option value="ALL">전체 팀</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="inline-flex h-11 items-center rounded-lg border border-white/15 px-4 typo-pc-b3 text-white">
                      {myTeam ?? '소속 팀 없음'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!selectedDate || downloading !== null}
                  onClick={() =>
                    selectedDate
                      ? downloadCsv(
                          `/core-attendance/meetings/${selectedDate}/summary.csv${
                            effectiveTeamParam ? `?team=${effectiveTeamParam}` : ''
                          }`,
                          `attendance-${selectedDate}.csv`,
                          'daily'
                        )
                      : undefined
                  }
                  className="h-11 rounded-lg border border-white/20 px-4 typo-pc-b3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading === 'daily' ? '다운로드 중...' : '당일 요약 CSV'}
                </button>
                <button
                  type="button"
                  disabled={downloading !== null}
                  onClick={() =>
                    downloadCsv(
                      `/core-attendance/meetings/summary.csv${
                        effectiveTeamParam ? `?team=${effectiveTeamParam}` : ''
                      }`,
                      'attendance-summary.csv',
                      'matrix'
                    )
                  }
                  className="h-11 rounded-lg border border-white/20 px-4 typo-pc-b3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading === 'matrix' ? '다운로드 중...' : '전체 매트릭스 CSV'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {error ? (
          <div className="rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 pc:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-white/10 bg-gray-100/30 p-5">
            <div className="space-y-1">
              <p className="typo-pc-c2 text-gray-700">Summary</p>
              <h2 className="typo-pc-h4 text-white">{selectedDate ? formatDate(selectedDate) : '날짜를 선택해 주세요.'}</h2>
              <p className="typo-pc-b3 text-gray-700">총 {summary?.total ?? 0}명 기준</p>
            </div>

            <div className="mt-5 grid gap-3 mobile:grid-cols-2">
              {totalStatusCards.map((card) => (
                <div key={card.label} className={`rounded-xl border p-4 ${card.tone}`}>
                  <p className="typo-pc-c2">{card.label}</p>
                  <p className="mt-2 typo-pc-h4">{card.value}명</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {visibleTeams.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 typo-pc-b3 text-gray-700">
                  팀 정보가 없습니다.
                </div>
              ) : (
                visibleTeams.map((team) => (
                  <div key={team.teamId} className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="typo-pc-b2 text-white">{team.teamName}</p>
                        <p className="typo-pc-c2 text-gray-700">{team.total}명</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 mobile:grid-cols-2">
                      <div className="rounded-lg border border-white/10 px-3 py-2 typo-pc-c2 text-white">
                        출석 {team.present}
                      </div>
                      <div className="rounded-lg border border-white/10 px-3 py-2 typo-pc-c2 text-white">
                        지각 {team.late}
                      </div>
                      <div className="rounded-lg border border-white/10 px-3 py-2 typo-pc-c2 text-white">
                        사전 승인 {team.preArranged}
                      </div>
                      <div className="rounded-lg border border-white/10 px-3 py-2 typo-pc-c2 text-white">
                        결석 {team.absent}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-100/30 p-5">
            <div className="flex flex-col gap-3 pc:flex-row pc:items-center pc:justify-between">
              <div>
                <p className="typo-pc-c2 text-gray-700">Members</p>
                <h2 className="typo-pc-h4 text-white">출석 대상 {members.length}명</h2>
              </div>
              {canManageAttendance ? (
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={!selectedDate || !attendanceDirty || saving}
                  className="h-11 rounded-lg bg-red px-4 typo-pc-b3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '출석 저장'}
                </button>
              ) : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-3 typo-pc-b3 text-gray-700">이름</th>
                    <th className="px-4 py-3 typo-pc-b3 text-gray-700">팀</th>
                    <th className="px-4 py-3 typo-pc-b3 text-gray-700">상태</th>
                    <th className="px-4 py-3 typo-pc-b3 text-gray-700">최종 수정</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center typo-pc-b3 text-gray-700">
                        선택한 날짜의 출석 대상이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => {
                      const currentStatus = attendanceDraft[member.userId] ?? member.status
                      const currentMeta = STATUS_META[currentStatus]
                      return (
                        <tr key={member.userId} className="border-t border-white/10 bg-black">
                          <td className="px-4 py-3 typo-pc-b3 text-white">{member.name}</td>
                          <td className="px-4 py-3 typo-pc-b3 text-gray-700">{member.team}</td>
                          <td className="px-4 py-3">
                            {canManageAttendance ? (
                              <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((option) => {
                                  const selected = currentStatus === option.value
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setMemberStatus(member.userId, option.value)}
                                      className={`rounded-full border px-3 py-1 typo-pc-c2 transition ${
                                        selected ? `${option.badgeClassName} border-current` : option.buttonClassName
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <span className={`inline-flex rounded-full border px-3 py-1 typo-pc-c2 ${currentMeta.badgeClassName}`}>
                                {member.statusLabel ?? currentMeta.label}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 typo-pc-c2 text-gray-700">
                            {formatDateTime(member.lastModifiedAt)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
