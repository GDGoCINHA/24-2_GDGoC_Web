'use client'

import { useCallback, useEffect, useState } from 'react'

import { ADMIN_ACCENT_BUTTON, ADMIN_GHOST_BUTTON } from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import {
  createClubTerm,
  fetchClubTerms,
  updateClubTerm
} from '@/services/club/clubCompletionClient'
import type { ClubTerm } from '@/types/club'
import { cn } from '@/utils/cn'

const CARD =
  'flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-[22px] shadow-admin'
const FIELD =
  'rounded-xl border border-admin-line bg-admin-base px-4 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-accent'

/**
 * 기수 설정 (C 담당) — `/dashboard/club/leaders` 오른쪽 칸. 이름과 참석 비율만 있다. 활동 기간은 소모임마다 둔다.
 *
 * 맨 위(가장 최근) 기수를 고칠 수 있게 열어 두고, 「새 기수 만들기」를 누르면 빈 칸으로 바뀐다.
 * 비율을 바꾸면 그 기수 모든 팀의 필요 참석 인원이 다시 계산된다.
 */
export function ClubTermCard() {
  const { apiClient } = useAuthenticatedApi()
  const [terms, setTerms] = useState<ClubTerm[] | null>(null)
  /** null 이면 새 기수 */
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [percent, setPercent] = useState(50)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const edit = (term: ClubTerm | null) => {
    setEditingId(term?.id ?? null)
    setName(term?.name ?? '')
    setPercent(term ? Math.round(term.attendanceRatio * 100) : 50)
    setMessage(null)
  }

  const load = useCallback(
    (focusId?: number) =>
      fetchClubTerms(apiClient)
        .then((list) => {
          setTerms(list)
          edit(list.find((t) => t.id === focusId) ?? list[0] ?? null)
        })
        .catch((err) => setMessage(readClubError(err, '기수를 불러오지 못했어요.'))),
    [apiClient]
  )

  useEffect(() => {
    void load()
  }, [load])

  const valid = name.trim() !== '' && Number.isInteger(percent) && percent >= 1 && percent <= 100

  const save = async () => {
    if (!valid) return
    setBusy(true)
    setMessage(null)
    try {
      const payload = { name: name.trim(), attendanceRatio: percent / 100 }
      const saved =
        editingId === null
          ? await createClubTerm(apiClient, payload)
          : await updateClubTerm(apiClient, editingId, payload)
      await load(saved.id)
      setMessage('저장했어요.')
    } catch (err) {
      setMessage(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  // 예시는 6명 기준. 서버와 같은 올림(ceil)이다.
  const example = Math.ceil((6 * percent) / 100)

  return (
    <section className={CARD}>
      <h2 className="text-[17px] font-semibold">기수</h2>
      <div className="flex flex-col gap-3 rounded-[14px] border border-admin-line-accent p-4">
        <div className="text-[13px] text-admin-ink-muted">
          {editingId === null ? '새 기수' : '기수 수정'}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-admin-ink-muted">기수 이름</span>
          <input
            type="text"
            value={name}
            maxLength={100}
            placeholder="예: 2026-2학기"
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-admin-ink-muted">회차별 참석 비율 (%)</span>
          <input
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className={cn(FIELD, 'w-[120px]')}
          />
          <span className="text-[12px] text-admin-ink-soft">
            {valid
              ? `팀원 6명이면 회차마다 ${example}명 이상 참석해야 인정돼요`
              : '1 ~ 100 사이 정수로 적어 주세요'}
          </span>
        </label>
        {message && <p className="text-[13px] text-admin-ink-muted">{message}</p>}
        <button
          type="button"
          disabled={busy || !valid}
          onClick={save}
          className={cn(ADMIN_ACCENT_BUTTON, 'self-end')}
        >
          저장
        </button>
      </div>
      {terms?.map((term) => (
        <button
          key={term.id}
          type="button"
          onClick={() => edit(term)}
          className={cn(
            'flex justify-between px-1 pt-3 text-left text-[14px] transition-colors hover:text-admin-ink',
            term.id === editingId ? 'text-admin-ink' : 'text-admin-ink-muted'
          )}
        >
          <span>{term.name}</span>
          <span>참석 비율 {Math.round(term.attendanceRatio * 100)}%</span>
        </button>
      ))}
      {terms?.length === 0 && (
        <p className="px-1 text-[13px] text-admin-ink-soft">
          아직 기수가 없어요. 소모임을 열려면 기수가 하나 있어야 해요.
        </p>
      )}
      <button
        type="button"
        onClick={() => edit(null)}
        className={cn(ADMIN_GHOST_BUTTON, 'self-start')}
      >
        새 기수 만들기
      </button>
    </section>
  )
}
