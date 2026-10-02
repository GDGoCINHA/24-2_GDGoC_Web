'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ClubAdminFrame } from '@/components/club/admin/ClubAdminFrame'
import {
  ADMIN_ACCENT_BUTTON,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON
} from '@/components/admin/dashboard/adminStyles'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { readClubError } from '@/services/club/clubClient'
import {
  approveActivity,
  fetchReviewQueue,
  requestActivityRevision
} from '@/services/club/clubCompletionClient'
import type { ClubReviewItem } from '@/types/club'
import { cn } from '@/utils/cn'

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']
const formatDay = (date: string) => {
  const d = new Date(`${date}T00:00:00`)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`
}

/**
 * 인증 검토 (C 담당). 인증 완료하면 그 기록은 리더가 더 이상 고칠 수 없다.
 *
 * `?clubId=` 를 주면 그 팀 것만 본다 (현황 표의 「검토 대기」 숫자에서 들어올 때).
 */
export default function ClubReviewPage() {
  const searchParams = useSearchParams()
  const clubIdParam = Number(searchParams.get('clubId') ?? 0) || undefined
  const { apiClient } = useAuthenticatedApi()
  const [queue, setQueue] = useState<ClubReviewItem[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchReviewQueue(apiClient, { status: 'PENDING', clubId: clubIdParam })
      .then((list) => {
        setQueue(list)
        setError(null)
        setSelectedId((prev) =>
          prev !== null && list.some((item) => item.activityId === prev)
            ? prev
            : (list[0]?.activityId ?? null)
        )
      })
      .catch((err) => setError(readClubError(err, '검토 목록을 불러오지 못했어요.')))
  }, [apiClient, clubIdParam])

  useEffect(load, [load])

  const current = queue?.find((item) => item.activityId === selectedId) ?? null

  const decide = async (action: 'approve' | 'revise') => {
    if (!current) return
    if (action === 'revise' && reason.trim() === '') {
      setError('보완 요청 사유를 적어 주세요.')
      return
    }
    if (
      action === 'approve' &&
      !current.requiredSatisfied &&
      !window.confirm('필요 참석 인원을 채우지 못한 기록이에요. 그래도 인증 완료할까요?')
    ) {
      return
    }
    setBusy(true)
    try {
      if (action === 'approve') await approveActivity(apiClient, current.activityId)
      else await requestActivityRevision(apiClient, current.activityId, reason.trim())
      setReason('')
      setSelectedId(null)
      load()
    } catch (err) {
      setError(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ClubAdminFrame
      eyebrow="Clubs"
      title="인증 검토"
      current="인증 검토"
      aside={
        <span className="text-[14px] text-admin-ink-soft">
          확인 중 {queue?.length ?? '…'}건
          {clubIdParam && (
            <>
              {' · '}
              <Link href="/dashboard/club/review" className="text-admin-accent">
                전체 보기
              </Link>
            </>
          )}
        </span>
      }
    >
      {error && <div className={cn(ADMIN_ERROR_BANNER, 'mb-4')}>{error}</div>}
      {queue !== null && queue.length === 0 && (
        <p className="py-16 text-center text-[15px] text-admin-ink-dim">
          검토를 기다리는 기록이 없어요.
        </p>
      )}
      {queue !== null && queue.length > 0 && (
        <div className="grid grid-cols-[360px_minmax(0,1fr)] items-start gap-5 mobile:grid-cols-1">
          <ul className="overflow-hidden rounded-[20px] border border-admin-line-soft bg-admin-card shadow-admin">
            {queue.map((item) => (
              <li key={item.activityId}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(item.activityId)
                    setReason('')
                  }}
                  className={cn(
                    'block w-full border-b border-admin-line-row px-[18px] py-3.5 text-left text-[14px] transition-colors',
                    item.activityId === current?.activityId
                      ? 'bg-admin-badge'
                      : 'hover:bg-admin-row-hover'
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{item.clubName}</span>
                    <span className="text-[12px] text-admin-ink-soft">
                      {formatDay(item.activityDate)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-2 text-[12px]">
                    <span className="text-admin-ink-muted">
                      참석 {item.attendedCount} / {item.rosterCount}
                    </span>
                    <span
                      className={item.requiredSatisfied ? 'text-admin-ok' : 'text-admin-accent'}
                    >
                      {item.requiredSatisfied ? '기준 충족' : '기준 미달'}
                    </span>
                    {item.resubmitted && <span className="text-admin-accent">재제출</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {current && (
            <div className="flex flex-col gap-[18px] rounded-[20px] border border-admin-line-soft bg-admin-card p-6 shadow-admin">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="text-[13px] text-admin-accent">{current.clubName}</div>
                  <div className="mt-1 text-[20px] font-semibold">
                    {formatDay(current.activityDate)} 모임
                  </div>
                </div>
                <Link
                  href={`/dashboard/club/team?id=${current.clubId}`}
                  className="text-[13px] text-admin-accent"
                >
                  팀 현황 보기 →
                </Link>
              </div>
              {current.photoUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {current.photoUrls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-[4/3] overflow-hidden rounded-xl bg-admin-thead"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-admin-accent">사진이 없어요.</p>
              )}
              <p className="whitespace-pre-line text-[15px] leading-[1.65]">{current.content}</p>
              {current.progressNote && (
                <p className="whitespace-pre-line text-[14px] leading-[1.6] text-admin-ink-muted">
                  목표 진행: {current.progressNote}
                </p>
              )}
              {current.resubmitted && current.revisionReason && (
                <div className="rounded-xl border border-admin-line-accent bg-admin-badge px-3 py-2.5 text-[13px] leading-[1.55] text-admin-badge-ink">
                  지난 보완 요청: {current.revisionReason}
                </div>
              )}
              <div className="flex flex-col gap-2.5 rounded-[14px] border border-admin-line-soft px-4 py-3.5">
                <div className="flex justify-between gap-3 text-[14px]">
                  <span className="text-admin-ink-muted">출석 (활동일 당시 명단 기준)</span>
                  <span
                    className={current.requiredSatisfied ? 'text-admin-ok' : 'text-admin-accent'}
                  >
                    {current.attendedCount} / {current.rosterCount} · 필요 {current.required}명
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.roster.map((person) =>
                    person.attended ? (
                      <span
                        key={person.userId}
                        className="rounded-full bg-admin-tag px-2.5 py-1 text-[12px] text-admin-ok"
                      >
                        {person.name} ✓
                      </span>
                    ) : (
                      <span
                        key={person.userId}
                        className="rounded-full border border-admin-line px-2.5 py-1 text-[12px] text-admin-ink-soft"
                      >
                        {person.name}
                      </span>
                    )
                  )}
                </div>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-[13px] text-admin-ink-muted">
                  보완 요청 사유 (보완 요청할 때만)
                </span>
                <textarea
                  rows={2}
                  value={reason}
                  maxLength={1000}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="예: 모임 장면이 보이는 사진을 추가해 주세요"
                  className="resize-y rounded-xl border border-admin-line bg-admin-base px-4 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-accent"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide('revise')}
                  className={ADMIN_GHOST_BUTTON}
                >
                  보완 요청
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide('approve')}
                  className={ADMIN_ACCENT_BUTTON}
                >
                  인증 완료
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </ClubAdminFrame>
  )
}
