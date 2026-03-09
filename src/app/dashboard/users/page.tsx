'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Loader from '@/components/ui/common/Loader'
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

const ROLE_RANK: Record<string, number> = {
  GUEST: 0,
  MEMBER: 1,
  CORE: 2,
  LEAD: 3,
  ORGANIZER: 4,
  ADMIN: 5
}

const isTeamAssignableRole = (role: string) => role === 'CORE' || role === 'LEAD'

export default function DashboardUsersPage() {
  const { apiClient } = useAuthenticatedApi()
  const { user: me } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
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
          ...(query.trim() ? { q: query.trim() } : {})
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
  }, [apiClient, page, query])

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
        return target.userRole === 'MEMBER' || target.userRole === 'CORE'
      }

      return target.userRole === 'GUEST' || target.userRole === 'MEMBER'
    }

    return false
  }

  const allowedRoleOptions = (target: UserSummary) => {
    if (!myRole) return []

    const base = ROLE_OPTIONS.filter((role) => (ROLE_RANK[myRole] ?? -1) > (ROLE_RANK[role] ?? -1))
    if (myRole === 'LEAD') return base.filter((role) => role === 'MEMBER' || role === 'CORE')
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
      alert(e?.response?.data?.message || '유저 권한/팀 수정에 실패했습니다.')
      setDrafts((prev) => ({
        ...prev,
        [target.id]: { userRole: target.userRole, team: target.team }
      }))
    } finally {
      setSavingUserId((prev) => (prev === target.id ? null : prev))
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white pc:px-10">
      <Loader isLoading={loading} />

      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 pc:flex-row pc:items-center pc:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="typo-h4 mobile:typo-m-h3">Users Dashboard</h1>
            <Link
              href="/dashboard/members"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              Members
            </Link>
            <Link
              href="/dashboard/mbti"
              className="inline-flex h-9 items-center rounded-lg border border-white/20 px-3 typo-pc-c2 text-white hover:border-white"
            >
              MBTI
            </Link>
          </div>
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
              placeholder="이름 검색"
              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 text-white outline-none focus:border-white pc:w-[260px]"
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

        <div className="rounded-xl border border-white/10 bg-gray-100/30 p-4">
          <p className="typo-pc-b3 text-gray-700">
            전체 {totalElements}명 / 페이지 {page} of {totalPages}
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red bg-red-400/30 p-4 typo-pc-b3 text-red">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">ID</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">이름</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">이메일</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">학과</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">학번</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">권한</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">팀</th>
                <th className="px-4 py-3 typo-pc-b3 text-gray-700">수정</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center typo-pc-b3 text-gray-700">
                    조회된 유저가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10 bg-black">
                    {(() => {
                      const editable = canEditTarget(user)
                      const draft = getDraft(user)
                      const roleOptions = allowedRoleOptions(user)
                      const teamOptions = allowedTeamValues()
                      const teamEditable = editable && isTeamAssignableRole(draft.userRole)
                      const isSaving = savingUserId === user.id

                      return (
                        <>
                          <td className="px-4 py-3 typo-pc-b3">{user.id}</td>
                          <td className="px-4 py-3 typo-pc-b3">{user.name}</td>
                          <td className="px-4 py-3 typo-pc-b3">{user.email}</td>
                          <td className="px-4 py-3 typo-pc-b3">{user.major || '-'}</td>
                          <td className="px-4 py-3 typo-pc-b3">{user.studentId || '-'}</td>
                          <td className="px-4 py-3">
                            {editable ? (
                              <select
                                value={draft.userRole}
                                disabled={isSaving}
                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                className="h-9 min-w-[120px] rounded-md border border-gray-300 bg-gray-100 px-2 typo-pc-c2 text-white"
                              >
                                {roleOptions.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="typo-pc-b3">{user.userRole}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editable ? (
                              <select
                                value={teamEditable ? (draft.team ?? teamOptions[0] ?? '') : ''}
                                disabled={!teamEditable || isSaving}
                                onChange={(e) => handleTeamChange(user, e.target.value)}
                                className="h-9 min-w-[120px] rounded-md border border-gray-300 bg-gray-100 px-2 typo-pc-c2 text-white disabled:opacity-40"
                              >
                                <option value="">-</option>
                                {teamOptions.map((team) => (
                                  <option key={team} value={team}>
                                    {TEAM_OPTIONS.find((item) => item.value === team)?.label ?? team}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="typo-pc-b3">
                                {TEAM_OPTIONS.find((item) => item.value === user.team)?.label || user.team || '-'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editable ? (
                              <button
                                type="button"
                                disabled={!hasChanges(user) || isSaving}
                                onClick={() => handleSave(user)}
                                className="rounded-md bg-red px-3 py-1 typo-pc-c2 text-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isSaving ? '저장중' : '저장'}
                              </button>
                            ) : (
                              <span className="typo-pc-c2 text-gray-700">수정 불가</span>
                            )}
                          </td>
                        </>
                      )
                    })()}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-white/20 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`rounded-md px-3 py-1 ${
                  p === page ? 'bg-red text-white' : 'border border-white/20 text-white'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-white/20 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
