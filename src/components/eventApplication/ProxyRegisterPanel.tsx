'use client'

import { useState } from 'react'

import {
  ADMIN_ACCENT_BUTTON_SM,
  ADMIN_GHOST_BUTTON,
  ADMIN_SEARCH_FIELD,
  ADMIN_SEARCH_INPUT
} from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { formatMajorLabel } from '@/constant/majorOptions'
import { registerProxyApplicant } from '@/services/eventApplication/eventApplicationClient'

interface UserHit {
  id: number
  name: string
  major: string
  studentId: string
}

/**
 * 신청하지 않고 현장에 온 사람을 운영진이 대신 등록한다.
 *
 * 서버가 마감·정원을 따지지 않는다 — 이미 온 사람을 돌려보낼 수 없기 때문이다.
 */
export default function ProxyRegisterPanel({
  eventBoardId,
  onRegistered
}: {
  eventBoardId: number
  onRegistered: () => void
}) {
  const { apiClient } = useAuthenticatedApi()

  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<UserHit[] | null>(null)
  const [markAttended, setMarkAttended] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const search = async () => {
    if (query.trim() === '') return
    setBusy(true)
    setMessage(null)
    try {
      const response = await apiClient.get('/admin/users', {
        params: { page: 0, size: 10, sort: 'name', dir: 'ASC', q: query.trim() }
      })
      const payload = response.data?.data
      setHits(Array.isArray(payload) ? payload : (payload?.content ?? []))
    } catch (e) {
      setMessage(readErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const register = async (user: UserHit) => {
    setBusy(true)
    setMessage(null)
    try {
      await registerProxyApplicant(apiClient, eventBoardId, user.id, markAttended)
      setMessage(`${user.name} 님을 등록했습니다.`)
      setHits(null)
      setQuery('')
      onRegistered()
    } catch (e) {
      setMessage(readErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-admin-ink">현장 등록</p>
        <label className="flex items-center gap-2 text-[13px] text-admin-ink-muted">
          <input
            type="checkbox"
            checked={markAttended}
            onChange={(e) => setMarkAttended(e.target.checked)}
            className="size-[15px] cursor-pointer accent-admin-accent"
          />
          참석까지 함께 처리
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className={ADMIN_SEARCH_FIELD}>
          <input
            className={ADMIN_SEARCH_INPUT}
            placeholder="이름 또는 학번으로 찾기"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void search()
              }
            }}
          />
        </label>
        <button
          type="button"
          className={ADMIN_GHOST_BUTTON}
          disabled={busy || query.trim() === ''}
          onClick={search}
        >
          찾기
        </button>
      </div>

      {hits != null && hits.length === 0 && (
        <p className="text-[13px] text-admin-ink-dim">일치하는 사람이 없습니다.</p>
      )}

      {hits != null && hits.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {hits.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-admin-line-row px-3.5 py-2.5"
            >
              <span className="text-[14px] text-admin-ink">
                {user.name}
                <span className="ml-2 text-[13px] text-admin-ink-dim">
                  {user.studentId || '-'} · {formatMajorLabel(user.major)}
                </span>
              </span>
              <button
                type="button"
                className={ADMIN_ACCENT_BUTTON_SM}
                disabled={busy}
                onClick={() => register(user)}
              >
                등록
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && <p className="text-[13px] text-admin-ink-muted">{message}</p>}
    </div>
  )
}

const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? '처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
