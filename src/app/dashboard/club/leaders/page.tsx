'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import { ClubTermCard } from '@/components/club/admin/ClubTermCard'
import {
  ADMIN_ACCENT_BUTTON_SM,
  ADMIN_GHOST_BUTTON
} from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { approveClub, fetchClubs, readClubError, rejectClub } from '@/services/club/clubClient'
import { CLUB_CATEGORY_LABEL, type ClubSummary } from '@/types/club'

const CARD =
  'flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-[22px] shadow-admin'

/** 개설 승인(A 담당), 기수 설정(C 담당). 개설하면 PENDING 으로 생기고 여기서 공개 여부를 정한다. */
export default function ClubLeadersPage() {
  const { apiClient } = useAuthenticatedApi()
  const [pending, setPending] = useState<ClubSummary[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchClubs(apiClient, { status: 'PENDING', size: 100 })
      .then(({ items }) => setPending(items))
      .catch((err) => setMessage(readClubError(err)))
  }, [apiClient])

  useEffect(load, [load])

  const run = async (action: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    setMessage(null)
    try {
      await action()
      load()
    } catch (err) {
      setMessage(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ClubAdminFrame eyebrow="Clubs" title="개설 승인 · 기수" current="개설 승인·기수">
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-5 mobile:grid-cols-1">
        <section className={CARD}>
          <h2 className="text-[17px] font-semibold">
            개설 승인 대기 <span className="text-admin-accent">{pending.length}</span>
          </h2>
          {message && <p className="text-[13px] text-admin-ink-muted">{message}</p>}
          {pending.length === 0 && (
            <p className="text-[13px] text-admin-ink-soft">기다리는 소모임이 없어요.</p>
          )}
          {pending.map((club) => (
            <div
              key={club.id}
              className="flex flex-wrap items-center gap-3 rounded-[14px] border border-admin-line-soft px-4 py-3.5"
            >
              <div className="min-w-0 flex-[1_1_260px]">
                <div className="text-[15px] font-semibold">
                  {club.name}{' '}
                  <span className="text-[12px] font-normal text-admin-ink-muted">
                    {CLUB_CATEGORY_LABEL[club.category]} · 리더 {club.leaderName}
                  </span>
                </div>
                <div className="mt-1.5 text-[13px] leading-[1.55] text-admin-ink-muted">
                  {club.summary}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Link href={`/club/detail/?id=${club.id}`} className={ADMIN_GHOST_BUTTON}>
                  자세히
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const reason = window.prompt('반려 사유 (리더에게 보여요)')
                    if (reason === null) return
                    void run(() => rejectClub(apiClient, club.id, reason.trim() || null))
                  }}
                  className={ADMIN_GHOST_BUTTON}
                >
                  반려
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => approveClub(apiClient, club.id),
                      `「${club.name}」을 게시판에 공개할까요?`
                    )
                  }
                  className={ADMIN_ACCENT_BUTTON_SM}
                >
                  승인
                </button>
              </div>
            </div>
          ))}
        </section>

        <ClubTermCard />
      </div>
    </ClubAdminFrame>
  )
}
