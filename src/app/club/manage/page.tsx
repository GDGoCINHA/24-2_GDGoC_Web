'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ClubFixRequestSection } from '@/components/club/ClubFixRequestSection'
import { ClubBackLink, ClubLeaderTag } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_DANGER_BUTTON,
  DUSK_GHOST_BUTTON,
  DUSK_PRIMARY_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { formatMajorLabel } from '@/constant/majorOptions'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  fetchClubApplicants,
  fetchClubDetail,
  fetchClubMembers,
  handleClubMember,
  handOverLeader,
  readClubError,
  updateClub
} from '@/services/club/clubClient'
import { fetchSchedules } from '@/services/club/scheduleClient'
import type { ClubDetail, ClubMember } from '@/types/club'
import { cn } from '@/utils/cn'

const SMALL = 'px-4 py-2 text-[13px]'

/** 리더 관리 화면. 신청 처리·멤버(A), 출석 수정 요청(B). 리더가 아니면 서버가 403. */
export default function ClubManagePage() {
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('id') ?? 0)
  const { apiClient } = useAuthenticatedApi()
  const [club, setClub] = useState<ClubDetail | null>(null)
  const [applicants, setApplicants] = useState<ClubMember[]>([])
  const [members, setMembers] = useState<ClubMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    if (!clubId) return
    Promise.all([
      fetchClubDetail(apiClient, clubId),
      fetchClubApplicants(apiClient, clubId),
      fetchClubMembers(apiClient, clubId)
    ])
      .then(([detail, pending, active]) => {
        setClub(detail)
        setApplicants(pending)
        setMembers(active)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '관리 화면을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  /**
   * 「출석 QR 띄우기」 가 열 일정 — 다음 일정(오늘 것 포함). 없으면 null, 받는 중이면 undefined.
   * 관리 화면 본 로딩과 따로 받는다 — 일정 조회가 실패해도 신청·멤버 관리는 떠야 한다.
   */
  const [nextScheduleId, setNextScheduleId] = useState<number | null | undefined>(undefined)
  useEffect(() => {
    if (!clubId) return
    fetchSchedules(apiClient, clubId, 'upcoming')
      .then((upcoming) => setNextScheduleId(upcoming[0]?.id ?? null))
      .catch(() => setNextScheduleId(null))
  }, [apiClient, clubId])

  const run = async (action: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    try {
      await action()
      load()
    } catch (err) {
      window.alert(readClubError(err))
    } finally {
      setBusy(false)
    }
  }

  if (error || !club) {
    return (
      <main className="min-h-screen">
        <ClubSiteHeader />
        <p className="py-24 text-center text-[15px] text-dusk-ink-800">{error ?? '불러오는 중…'}</p>
      </main>
    )
  }

  const recruiting = club.recruitStatus === 'RECRUITING'
  const overCapacity =
    club.capacity !== null && club.memberCount + applicants.length > club.capacity

  const scheduleEditHref = `/club/schedule/edit/?clubId=${clubId}`
  const shortcuts: { label: string; href: string; primary: boolean; hint?: string }[] = [
    { label: '활동 기록 작성', href: `/club/activity/edit/?clubId=${clubId}`, primary: true },
    { label: '일정 등록', href: scheduleEditHref, primary: false },
    // QR 은 어느 일정의 출석인지 알아야 한다. 다가오는 일정이 없으면 일정부터 만들게 보낸다.
    nextScheduleId
      ? {
          label: '출석 QR 띄우기',
          href: `/club/schedule/qr/?clubId=${clubId}&id=${nextScheduleId}`,
          primary: false
        }
      : {
          label: '출석 QR 띄우기',
          href: scheduleEditHref,
          primary: false,
          hint: nextScheduleId === null ? '먼저 일정을 등록해 주세요' : undefined
        },
    { label: '정보·기간 수정', href: `/club/new/?id=${clubId}`, primary: false }
  ]

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-9 px-[clamp(20px,5vw,44px)] pb-24 pt-11 mobile:pt-6">
        <div>
          <ClubBackLink href={`/club/detail/?id=${clubId}`} label={club.name} />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            소모임 관리
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mobile:grid-cols-2">
          {shortcuts.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex min-h-14 flex-col justify-center rounded-[14px] px-4 text-sm',
                item.primary
                  ? 'bg-ember font-medium text-ember-ink'
                  : 'border border-[rgba(240,234,228,0.16)] text-dusk-ink-100'
              )}
            >
              {item.label}
              {item.hint && <span className="mt-0.5 text-xs text-dusk-ink-800">{item.hint}</span>}
            </Link>
          ))}
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">
              참여 신청 <span className="text-ember">{applicants.length}</span>
            </h2>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  updateClub(apiClient, clubId, {
                    recruitStatus: recruiting ? 'CLOSED' : 'RECRUITING'
                  })
                )
              }
              className={cn(DUSK_GHOST_BUTTON, SMALL)}
            >
              {recruiting ? '모집 중 · 마감하기' : '모집 마감 · 다시 열기'}
            </button>
          </div>
          {applicants.length === 0 && (
            <p className="text-sm text-dusk-ink-800">기다리는 신청이 없어요.</p>
          )}
          {applicants.map((applicant) => (
            <div
              key={applicant.memberId}
              className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-dusk-line px-[18px] py-4"
            >
              <div className="min-w-0 flex-[1_1_300px]">
                <div className="text-[15px] font-semibold">
                  {applicant.name}{' '}
                  <span className="text-[13px] font-normal text-dusk-ink-800">
                    {applicant.major ? formatMajorLabel(applicant.major) : ''}
                  </span>
                </div>
                {applicant.applyMessage && (
                  <div className="mt-1.5 text-sm leading-[1.55] text-dusk-ink-400">
                    {applicant.applyMessage}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => handleClubMember(apiClient, clubId, applicant.memberId, 'reject'),
                      `${applicant.name} 님의 신청을 거절할까요?`
                    )
                  }
                  className={cn(DUSK_GHOST_BUTTON, SMALL)}
                >
                  거절
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(() => handleClubMember(apiClient, clubId, applicant.memberId, 'approve'))
                  }
                  className={cn(DUSK_PRIMARY_BUTTON, SMALL)}
                >
                  승인
                </button>
              </div>
            </div>
          ))}
          {/* 정원은 막지 않는다. 넘는다는 사실만 알린다. */}
          {overCapacity && (
            <div className="rounded-[10px] border border-[rgba(224,162,78,0.4)] bg-[rgba(224,162,78,0.08)] px-3.5 py-2.5 text-[13px] text-tag-event">
              모두 승인하면 정원 {club.capacity}명을 넘어요. 승인은 그대로 돼요.
            </div>
          )}
        </section>

        <ClubFixRequestSection clubId={clubId} />

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">멤버 {members.length}명</h2>
          <ul className="overflow-hidden rounded-[14px] border border-dusk-line">
            {members.map((member) => (
              <li
                key={member.memberId}
                className="flex flex-wrap items-center gap-3 border-b border-dusk-line-soft px-[18px] py-3 last:border-b-0"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-dusk-slot text-[13px] text-dusk-ink-400">
                  {member.name.slice(0, 1)}
                </span>
                <span className="text-[15px]">{member.name}</span>
                {member.isLeader && <ClubLeaderTag />}
                {!member.isLeader && (
                  <div className="ml-auto flex gap-1.5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await handOverLeader(apiClient, clubId, member.userId)
                          // 넘긴 뒤에는 리더가 아니라 이 화면이 403 이다.
                          window.location.assign(`/club/detail/?id=${clubId}`)
                        }, `${member.name} 님에게 리더를 넘길까요? 넘기면 관리 화면을 쓸 수 없어요.`)
                      }
                      className={cn(DUSK_GHOST_BUTTON, 'min-h-9 px-3 py-1 text-xs')}
                    >
                      리더 넘기기
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => handleClubMember(apiClient, clubId, member.memberId, 'kick'),
                          `${member.name} 님을 내보낼까요?`
                        )
                      }
                      className={cn(DUSK_DANGER_BUTTON, 'min-h-9 px-3 py-1 text-xs')}
                    >
                      내보내기
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
