'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import Loader from '@/components/ui/common/Loader'
import { formatMajorLabel } from '@/constant/majorOptions'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'

type UserSummary = {
  id: number
  name: string
  major: string
  studentId: string
  email: string
  userRole: string
  team: string | null
}

type UserPageData = {
  content?: UserSummary[]
}

type UserListResponse = {
  code: number
  message: string
  data?: UserPageData | UserSummary[]
  meta?: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

type UserDraft = {
  userRole: string
  team: string | null
}

const ROLE_OPTIONS = ['GUEST', 'MEMBER', 'CORE', 'LEAD', 'ORGANIZER', 'ADMIN'] as const
const TEAM_OPTIONS = [
  { value: 'HQ', label: 'HQ' },
  { value: 'HR', label: 'HR' },
  { value: 'PR_DESIGN', label: 'PR·DESIGN' },
  { value: 'TECH', label: 'TECH' },
  { value: 'BD', label: 'BD' }
] as const

const ROLE_FILTER_OPTIONS = ['GUEST', 'MEMBER', 'CORE', 'LEAD', 'ORGANIZER'] as const

const ROLE_RANK: Record<string, number> = {
  GUEST: 0,
  MEMBER: 1,
  CORE: 2,
  LEAD: 3,
  ORGANIZER: 4,
  ADMIN: 5
}

const HEADER_LINKS = [
  { label: '← 대시보드', href: '/dashboard' },
  { label: '온보딩 화면', href: '/' }
]

/** 같은 카테고리(멤버 · 지원)의 형제 화면만 노출한다. 허브의 그룹 구성과 같다. */
const SIBLING_SCREENS = [
  { label: 'Members', href: '/dashboard/members' },
  { label: 'Core 지원서', href: '/dashboard/core/application' }
]

const isTeamAssignableRole = (role: string) => role === 'CORE' || role === 'LEAD'

const selectClassName =
  'w-full min-w-[96px] cursor-pointer rounded-[10px] border border-admin-line bg-admin-card px-2.5 py-2 text-[14px] text-admin-ink outline-none transition-colors duration-200 hover:border-admin-accent disabled:cursor-not-allowed disabled:opacity-40'

const pillClassName =
  'flex items-center gap-2.5 rounded-full border border-admin-line bg-admin-card px-4 py-2.5'

export default function DashboardUsersPage() {
  const { apiClient } = useAuthenticatedApi()
  const { user: me } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [teamFilter, setTeamFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [drafts, setDrafts] = useState<Record<number, UserDraft>>({})
  const [savingUserId, setSavingUserId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<UserListResponse>('/admin/users', {
        params: {
          page: page - 1,
          size: 20,
          sort: 'name',
          dir: 'ASC',
          ...(query.trim() ? { q: query.trim() } : {}),
          ...(roleFilter !== 'ALL' ? { role: roleFilter } : {}),
          ...(teamFilter !== 'ALL' ? { team: teamFilter } : {})
        }
      })

      const payload = response.data?.data
      const content = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : []
      setUsers(content)
      setDrafts(
        content.reduce<Record<number, UserDraft>>((acc, item) => {
          acc[item.id] = { userRole: item.userRole, team: item.team }
          return acc
        }, {})
      )
      setTotalPages(response.data?.meta?.totalPages || 1)
      setTotalElements(response.data?.meta?.totalElements || 0)
    } catch (e: any) {
      setError(e?.response?.data?.message || '유저 목록 조회에 실패했습니다.')
      setUsers([])
      setTotalPages(1)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }, [apiClient, page, query, roleFilter, teamFilter])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const pageNumbers = useMemo(() => {
    const maxVisible = 7
    const pages: number[] = []
    const start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [page, totalPages])

  const myRole = me?.userRole ?? null
  const myTeam = me?.team ?? null
  const myId = typeof me?.id === 'number' ? me.id : null

  const canEditTarget = (target: UserSummary) => {
    if (!myRole) return false
    if (myId !== null && target.id === myId) return false

    const meRank = ROLE_RANK[myRole] ?? -1
    const targetRank = ROLE_RANK[target.userRole] ?? -1
    if (meRank <= targetRank) return false

    if (myRole === 'ADMIN') return true
    if (myRole === 'ORGANIZER') return target.userRole !== 'ADMIN'

    if (myRole === 'LEAD' || myRole === 'CORE') {
      if (!myTeam) return false
      if (myTeam !== 'HR' && target.team !== myTeam) return false

      if (myRole === 'LEAD') {
        return (
          target.userRole === 'GUEST' || target.userRole === 'MEMBER' || target.userRole === 'CORE'
        )
      }

      return target.userRole === 'GUEST' || target.userRole === 'MEMBER'
    }

    return false
  }

  const allowedRoleOptions = (target: UserSummary) => {
    if (!myRole) return []

    const base = ROLE_OPTIONS.filter((role) => (ROLE_RANK[myRole] ?? -1) > (ROLE_RANK[role] ?? -1))
    if (myRole === 'LEAD')
      return base.filter((role) => role === 'GUEST' || role === 'MEMBER' || role === 'CORE')
    if (myRole === 'CORE') return base.filter((role) => role === 'GUEST' || role === 'MEMBER')
    return base
  }

  const allowedTeamValues = () => {
    if ((myRole === 'CORE' || myRole === 'LEAD') && myTeam && myTeam !== 'HR') {
      return [myTeam]
    }
    return TEAM_OPTIONS.map((team) => team.value)
  }

  const getDraft = (target: UserSummary) =>
    drafts[target.id] ?? { userRole: target.userRole, team: target.team }

  const hasChanges = (target: UserSummary) => {
    const draft = getDraft(target)
    return draft.userRole !== target.userRole || (draft.team ?? null) !== (target.team ?? null)
  }

  const dirtyUsers = users.filter((user) => canEditTarget(user) && hasChanges(user))

  const handleRoleChange = (target: UserSummary, nextRole: string) => {
    const teamValues = allowedTeamValues()
    setDrafts((prev) => {
      const current = prev[target.id] ?? { userRole: target.userRole, team: target.team }
      let nextTeam: string | null = current.team

      if (!isTeamAssignableRole(nextRole)) {
        nextTeam = null
      } else if (!nextTeam || !teamValues.includes(nextTeam)) {
        nextTeam = teamValues[0] ?? null
      }

      return {
        ...prev,
        [target.id]: {
          userRole: nextRole,
          team: nextTeam
        }
      }
    })
  }

  const handleTeamChange = (target: UserSummary, nextTeam: string) => {
    setDrafts((prev) => {
      const current = prev[target.id] ?? { userRole: target.userRole, team: target.team }
      return {
        ...prev,
        [target.id]: {
          ...current,
          team: nextTeam
        }
      }
    })
  }

  const handleSave = async (target: UserSummary) => {
    if (!canEditTarget(target)) return
    if (!hasChanges(target)) return

    const draft = getDraft(target)
    const payload = {
      role: draft.userRole,
      team: isTeamAssignableRole(draft.userRole) ? draft.team : null
    }

    try {
      setSavingUserId(target.id)
      await apiClient.patch(`/admin/users/${target.id}/role-team`, payload)
      setUsers((prev) =>
        prev.map((item) =>
          item.id === target.id ? { ...item, userRole: payload.role, team: payload.team } : item
        )
      )
    } catch (e: any) {
      setError(e?.response?.data?.message || '유저 권한/팀 수정에 실패했습니다.')
      setDrafts((prev) => ({
        ...prev,
        [target.id]: { userRole: target.userRole, team: target.team }
      }))
    } finally {
      setSavingUserId((prev) => (prev === target.id ? null : prev))
    }
  }

  /** 순차 저장. 한 건이 실패해도 나머지는 계속 간다 — 실패분만 드래프트가 되돌아온다. */
  const handleSaveAll = async () => {
    for (const target of dirtyUsers) {
      await handleSave(target)
    }
  }

  const runSearch = () => {
    setPage(1)
    setQuery(searchInput)
  }

  return (
    <div className="min-h-screen bg-admin-base pb-12 font-pretendard text-admin-ink">
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading} />

      <section className="mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-[clamp(20px,2.5vw,32px)]">
        <p data-admin-reveal className="text-[12px] uppercase tracking-[0.14em] text-admin-ink-dim">
          Users
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(22px,2.4vw,30px)] font-semibold leading-[1.2] tracking-[-0.03em]">
            유저 권한 · 팀 관리
          </h1>
          <span className="text-[14px] text-admin-ink-soft">
            전체 {totalElements}명 · 페이지 {page} / {totalPages}
          </span>
        </div>

        <div data-admin-reveal className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 whitespace-nowrap text-[13px] text-admin-ink-dim">멤버 · 지원</span>
          <span className="whitespace-nowrap rounded-full border border-admin-line-current px-3.5 py-1.5 text-[13px] text-admin-ink">
            Users
          </span>
          {SIBLING_SCREENS.map((screen) => (
            <Link
              key={screen.href}
              href={screen.href}
              className="whitespace-nowrap rounded-full border border-admin-line px-3.5 py-1.5 text-[13px] text-admin-ink-muted transition-colors duration-[250ms] hover:border-admin-accent hover:text-admin-ink"
            >
              {screen.label}
            </Link>
          ))}
        </div>

        <div data-admin-reveal className="mt-3 flex flex-wrap items-center gap-2.5">
          <label className="flex min-w-0 flex-1 basis-[300px] items-center gap-2.5 rounded-full border border-admin-line bg-admin-card px-4 py-2.5 shadow-admin transition duration-[250ms] focus-within:border-admin-accent focus-within:shadow-admin-ring">
            <span aria-hidden="true" className="text-[14px] text-admin-ink-dim">
              ⌕
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') runSearch()
              }}
              onBlur={runSearch}
              placeholder="이름 · 이메일 · 학번 검색"
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-admin-ink outline-none"
            />
          </label>

          <label className={pillClassName}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">권한</span>
            <select
              value={roleFilter}
              onChange={(event) => {
                setPage(1)
                setRoleFilter(event.target.value)
              }}
              className="cursor-pointer border-0 bg-transparent text-[15px] text-admin-ink outline-none"
            >
              <option value="ALL" className="bg-admin-card text-admin-ink">
                전체
              </option>
              {ROLE_FILTER_OPTIONS.map((role) => (
                <option key={role} value={role} className="bg-admin-card text-admin-ink">
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className={pillClassName}>
            <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">팀</span>
            <select
              value={teamFilter}
              onChange={(event) => {
                setPage(1)
                setTeamFilter(event.target.value)
              }}
              className="cursor-pointer border-0 bg-transparent text-[15px] text-admin-ink outline-none"
            >
              <option value="ALL" className="bg-admin-card text-admin-ink">
                전체
              </option>
              {TEAM_OPTIONS.map((team) => (
                <option
                  key={team.value}
                  value={team.value}
                  className="bg-admin-card text-admin-ink"
                >
                  {team.label}
                </option>
              ))}
            </select>
          </label>

          {dirtyUsers.length > 0 ? (
            <button
              type="button"
              onClick={() => void handleSaveAll()}
              disabled={savingUserId !== null}
              className="whitespace-nowrap rounded-full bg-admin-accent px-5 py-2.5 text-[14px] font-medium text-admin-accent-ink transition-colors duration-200 hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              변경 {dirtyUsers.length}건 저장
            </button>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-admin-line bg-admin-card px-5 py-4 text-[14px] text-signal-err"
          >
            {error}
          </p>
        ) : null}
      </section>

      <section
        data-admin-reveal
        className="mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-4"
      >
        <div className="overflow-hidden rounded-[20px] border border-admin-line-soft bg-admin-card shadow-admin">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID', '이름', '이메일', '학과 · 학번', '권한', '팀'].map((label) => (
                  <th
                    key={label}
                    className="whitespace-nowrap border-b border-admin-line-soft bg-admin-thead px-3.5 py-2.5 text-left text-[12px] font-medium tracking-[0.06em] text-admin-ink-dim"
                  >
                    {label}
                  </th>
                ))}
                <th className="whitespace-nowrap border-b border-admin-line-soft bg-admin-thead px-3.5 py-2.5 text-right text-[12px] font-medium tracking-[0.06em] text-admin-ink-dim">
                  수정
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-[72px] text-center text-[15px] text-admin-ink-dim"
                  >
                    조회된 유저가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const editable = canEditTarget(user)
                  const draft = getDraft(user)
                  const roleOptions = allowedRoleOptions(user)
                  const teamOptions = allowedTeamValues()
                  const teamEditable = editable && isTeamAssignableRole(draft.userRole)
                  const isSaving = savingUserId === user.id
                  const dirty = editable && hasChanges(user)

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-admin-line-row transition-colors duration-[250ms] hover:bg-admin-row-hover"
                    >
                      <td className="px-3.5 py-2.5 text-[14px] tabular-nums text-admin-ink-dim">
                        {user.id}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 text-[15px] text-admin-ink">
                        {user.name}
                      </td>
                      <td className="break-all px-3.5 py-2.5 text-[14px] text-admin-ink-soft">
                        {user.email}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="block break-keep text-[14px] text-admin-ink-muted">
                          {formatMajorLabel(user.major)}
                        </span>
                        <span className="mt-[3px] block text-[12px] tabular-nums text-admin-ink-dim">
                          {user.studentId || '-'}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {editable ? (
                          <select
                            value={draft.userRole}
                            disabled={isSaving}
                            onChange={(event) => handleRoleChange(user, event.target.value)}
                            className={selectClassName}
                          >
                            {roleOptions.map((role) => (
                              <option
                                key={role}
                                value={role}
                                className="bg-admin-card text-admin-ink"
                              >
                                {role}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[14px] text-admin-ink-soft">{user.userRole}</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {teamEditable ? (
                          <select
                            value={draft.team ?? teamOptions[0] ?? ''}
                            disabled={isSaving}
                            onChange={(event) => handleTeamChange(user, event.target.value)}
                            className={selectClassName}
                          >
                            {teamOptions.map((team) => (
                              <option
                                key={team}
                                value={team}
                                className="bg-admin-card text-admin-ink"
                              >
                                {TEAM_OPTIONS.find((item) => item.value === team)?.label ?? team}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[14px] text-admin-ink-soft">
                            {TEAM_OPTIONS.find((item) => item.value === user.team)?.label ||
                              user.team ||
                              '—'}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 text-right">
                        {dirty ? (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleSave(user)}
                            className="whitespace-nowrap rounded-full bg-admin-accent px-[18px] py-2 text-[13px] font-medium text-admin-accent-ink transition-colors duration-200 hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving ? '저장중' : '저장'}
                          </button>
                        ) : (
                          <span className="text-[12px] text-admin-ink-faint">
                            {editable ? '변경 없음' : '수정 불가'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 ? (
        <section className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 px-[clamp(20px,4vw,40px)] pt-5">
          <span className="text-[13px] text-admin-ink-dim">
            페이지 {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="whitespace-nowrap rounded-full border border-admin-line px-[18px] py-2.5 text-[14px] text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            {pageNumbers.map((p) =>
              p === page ? (
                <span
                  key={p}
                  className="min-w-[38px] rounded-full bg-admin-accent py-2.5 text-center text-[14px] tabular-nums text-admin-accent-ink"
                >
                  {p}
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className="min-w-[38px] rounded-full border border-admin-line py-2.5 text-[14px] tabular-nums text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink"
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="whitespace-nowrap rounded-full border border-admin-line px-[18px] py-2.5 text-[14px] text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
