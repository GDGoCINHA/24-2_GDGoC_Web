'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Loader from '@/components/ui/common/Loader'
import AdminCategoryNav from '@/components/admin/dashboard/AdminCategoryNav'
import AdminHeader from '@/components/admin/dashboard/AdminHeader'
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
  ADMIN_TABLE_CARD,
  ADMIN_TD,
  ADMIN_TD_MUTED,
  ADMIN_TH,
  ADMIN_TITLE,
  ADMIN_TR
} from '@/components/admin/dashboard/adminStyles'
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

const STATUS_META = STATUS_OPTIONS.reduce<
  Record<AttendanceStatus, (typeof STATUS_OPTIONS)[number]>
>(
  (acc, option) => {
    acc[option.value] = option
    return acc
  },
  {} as Record<AttendanceStatus, (typeof STATUS_OPTIONS)[number]>
)

const HEADER_LINKS = [
  { label: '← 대시보드', href: '/dashboard' },
  { label: '온보딩 화면', href: '/' }
]

const SIBLING_SCREENS = [
  { label: 'Users', href: '/dashboard/users' },
  { label: 'Members', href: '/dashboard/members' },
  { label: 'Core 지원서', href: '/dashboard/core/application' }
]

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
    {
      label: '사전 승인',
      value: summary?.preArranged ?? 0,
      tone: STATUS_META.PRE_ARRANGED.badgeClassName
    },
    { label: '결석', value: summary?.absent ?? 0, tone: STATUS_META.ABSENT.badgeClassName }
  ]

  return (
    <main className={ADMIN_PAGE}>
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading || saving || creating || deleting} />

      <section className={`${ADMIN_CONTAINER} pt-[clamp(20px,2.5vw,32px)]`}>
        <p data-admin-reveal className={ADMIN_CAPTION}>
          Core Attendance
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className={ADMIN_TITLE}>코어 출석</h1>
          <span className="break-keep text-[13px] text-admin-ink-dim">
            {canManageAttendance
              ? 'Lead 이상은 출석 상태를 기록할 수 있습니다.'
              : 'Core 권한은 조회만 가능합니다.'}
          </span>
        </div>

        <AdminCategoryNav category="멤버 · 지원" current="Core 출석" siblings={SIBLING_SCREENS} />

        {/* 날짜 · 범위 · 내려받기 — 표를 보기 전에 정하는 것들이라 한 줄에 모은다 */}
        <div data-admin-reveal className="mt-3 flex flex-wrap items-center gap-2.5">
          <label className={ADMIN_PILL}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">팀</span>
            {canSelectTeam ? (
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className={ADMIN_PILL_SELECT}
              >
                <option value="ALL" className={ADMIN_OPTION}>
                  전체
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className={ADMIN_OPTION}>
                    {team.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="whitespace-nowrap text-[15px] text-admin-ink">
                {myTeam ?? '소속 없음'}
              </span>
            )}
          </label>

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
            className={ADMIN_GHOST_BUTTON}
          >
            {downloading === 'daily' ? '내려받는 중…' : '당일 요약 CSV'}
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
            className={ADMIN_GHOST_BUTTON}
          >
            {downloading === 'matrix' ? '내려받는 중…' : '전체 매트릭스 CSV'}
          </button>
        </div>

        <div data-admin-reveal className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 whitespace-nowrap text-[13px] text-admin-ink-dim">모임 날짜</span>
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] tabular-nums transition-colors duration-200 ${
                selectedDate === date
                  ? 'border-admin-accent bg-admin-tag text-admin-ink'
                  : 'border-admin-line text-admin-ink-muted hover:border-admin-accent hover:text-admin-ink'
              }`}
            >
              {date}
            </button>
          ))}
          {dates.length === 0 ? (
            <span className="text-[13px] text-admin-ink-dim">등록된 일정이 없습니다.</span>
          ) : null}

          {canManageAttendance ? (
            <span className="ml-auto flex flex-wrap items-center gap-2">
              <input
                id="attendance-date-input"
                type="date"
                aria-label="추가할 일정 날짜"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-full border border-admin-line bg-admin-card px-3.5 py-1.5 text-[13px] text-admin-ink outline-none transition-colors duration-200 focus:border-admin-accent"
              />
              <button
                type="button"
                onClick={handleCreateDate}
                disabled={creating || !newDate}
                className={ADMIN_GHOST_BUTTON}
              >
                일정 추가
              </button>
              <button
                type="button"
                onClick={handleDeleteDate}
                disabled={deleting || !selectedDate}
                className="whitespace-nowrap rounded-full border border-signal-err px-[18px] py-2 text-[13px] text-signal-err transition-colors duration-200 hover:bg-signal-err/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                선택 일정 삭제
              </button>
            </span>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className={ADMIN_ERROR_BANNER}>
            {error}
          </p>
        ) : null}
      </section>

      <section className={`${ADMIN_CONTAINER} grid gap-4 pt-4 pc:grid-cols-[0.85fr_1.15fr]`}>
        <div
          data-admin-reveal
          className="rounded-[20px] border border-admin-line-soft bg-admin-card p-5 shadow-admin"
        >
          <p className={ADMIN_CAPTION}>Summary</p>
          <h2 className="mt-1.5 break-keep text-[17px] font-semibold text-admin-ink">
            {selectedDate ? formatDate(selectedDate) : '날짜를 선택해 주세요.'}
          </h2>
          <p className="mt-1 text-[13px] text-admin-ink-dim">총 {summary?.total ?? 0}명 기준</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {totalStatusCards.map((card) => (
              <div key={card.label} className={`rounded-xl border px-3 py-2.5 ${card.tone}`}>
                <p className="text-[12px]">{card.label}</p>
                <p className="mt-1 text-[19px] font-semibold tabular-nums">{card.value}명</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {visibleTeams.length === 0 ? (
              <p className="rounded-xl border border-admin-line-soft bg-admin-base px-3 py-2.5 text-[13px] text-admin-ink-dim">
                팀 정보가 없습니다.
              </p>
            ) : (
              visibleTeams.map((team) => (
                <div
                  key={team.teamId}
                  className="rounded-xl border border-admin-line-soft bg-admin-base px-3 py-2.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[14px] text-admin-ink">{team.teamName}</p>
                    <p className="text-[12px] tabular-nums text-admin-ink-dim">{team.total}명</p>
                  </div>
                  <p className="mt-1.5 text-[12px] tabular-nums text-admin-ink-soft">
                    출석 {team.present} · 지각 {team.late} · 사전 승인 {team.preArranged} · 결석{' '}
                    {team.absent}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div data-admin-reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className={ADMIN_CAPTION}>Members</p>
              <h2 className="mt-1.5 text-[17px] font-semibold text-admin-ink">
                출석 대상 {members.length}명
              </h2>
            </div>
            {canManageAttendance ? (
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={!selectedDate || !attendanceDirty || saving}
                className={ADMIN_ACCENT_BUTTON}
              >
                {saving ? '저장 중…' : '출석 저장'}
              </button>
            ) : null}
          </div>

          <div className={`${ADMIN_TABLE_CARD} mt-3`}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['이름', '팀', '상태', '최종 수정'].map((label) => (
                    <th key={label} className={ADMIN_TH}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={ADMIN_EMPTY_CELL}>
                      선택한 날짜의 출석 대상이 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const currentStatus = attendanceDraft[member.userId] ?? member.status
                    const currentMeta = STATUS_META[currentStatus]

                    return (
                      <tr key={member.userId} className={ADMIN_TR}>
                        <td className={`${ADMIN_TD} whitespace-nowrap text-[15px]`}>
                          {member.name}
                        </td>
                        <td className={`${ADMIN_TD_MUTED} whitespace-nowrap`}>{member.team}</td>
                        <td className="px-3.5 py-2.5">
                          {canManageAttendance ? (
                            <div className="flex flex-wrap gap-1.5">
                              {STATUS_OPTIONS.map((option) => {
                                const selected = currentStatus === option.value
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setMemberStatus(member.userId, option.value)}
                                    className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] transition-colors duration-200 ${
                                      selected
                                        ? `${option.badgeClassName} border-current`
                                        : 'border-admin-line text-admin-ink-dim hover:border-admin-accent hover:text-admin-ink'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] ${currentMeta.badgeClassName}`}
                            >
                              {member.statusLabel ?? currentMeta.label}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-[12px] tabular-nums text-admin-ink-dim">
                          {formatDateTime(member.lastModifiedAt)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
