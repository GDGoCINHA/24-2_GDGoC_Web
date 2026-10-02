'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ClubCompletionTab } from '@/components/club/ClubCompletionTab'
import { ClubFeedTab } from '@/components/club/ClubFeedTab'
import { ClubScheduleTab } from '@/components/club/ClubScheduleTab'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  ClubBackLink,
  ClubCategoryTag,
  ClubCover,
  ClubLeaderTag,
  ClubRecruitTag,
  ClubTabs,
  KakaoShareButton
} from '@/components/club/ClubUi'
import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { publicClient } from '@/lib/api/publicClient'
import {
  applyClub,
  fetchClubDetail,
  fetchClubMembers,
  leaveClub,
  readClubError
} from '@/services/club/clubClient'
import type { ClubDetail, ClubMember } from '@/types/club'
import { hasAtLeast } from '@/utils/auth/role'
import { cn } from '@/utils/cn'

type Tab = 'feed' | 'schedule' | 'goal' | 'about'

const formatPeriod = (start: string | null, end: string | null) =>
  start && end
    ? `${start.slice(5).replace('-', '.')} – ${end.slice(5).replace('-', '.')}`
    : '미설정'

export default function ClubDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubId = Number(searchParams.get('id') ?? 0)
  const { user } = useAuth()
  const { apiClient: authClient } = useAuthenticatedApi()
  // 비로그인도 상세(소개)는 본다 — 공유 링크용. 서버가 링크·신청 상태를 비워 준다.
  const apiClient = user ? authClient : publicClient
  // 활동·일정·완주는 부원에게만 보인다.
  const showTeamTabs = hasAtLeast(user?.userRole, 'MEMBER')
  const [tab, setTab] = useState<Tab>(showTeamTabs ? 'feed' : 'about')
  const isStaff = hasAtLeast(user?.userRole, 'CORE')
  const canJoin = hasAtLeast(user?.userRole, 'MEMBER')
  const [club, setClub] = useState<ClubDetail | null>(null)
  const [members, setMembers] = useState<ClubMember[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // kakaoLink 는 멤버·운영진이 아니면 서버가 null 로 준다.
  const load = useCallback(() => {
    if (!clubId) return
    fetchClubDetail(apiClient, clubId)
      .then((data) => {
        setClub(data)
        setError(null)
      })
      .catch((err) => setError(readClubError(err, '소모임을 불러오지 못했어요.')))
  }, [apiClient, clubId])

  useEffect(load, [load])

  const isMemberOrStaff = club?.myMembership?.status === 'ACTIVE' || isStaff
  useEffect(() => {
    if (tab !== 'about' || !isMemberOrStaff) return
    fetchClubMembers(apiClient, clubId)
      .then(setMembers)
      .catch(() => setMembers([]))
  }, [apiClient, clubId, tab, isMemberOrStaff])

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
  const apply = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/club/detail/?id=${clubId}`)}`)
      return
    }
    void run(() => applyClub(apiClient, clubId, null))
  }
  const leave = (text: string) => run(() => leaveClub(apiClient, clubId), text)

  if (error || !club) {
    return (
      <main className="min-h-screen">
        <ClubSiteHeader />
        <p className="py-24 text-center text-[15px] text-dusk-ink-800">{error ?? '불러오는 중…'}</p>
      </main>
    )
  }

  const membership = club.myMembership
  const isMember = membership?.status === 'ACTIVE'
  const isPending = membership?.status === 'PENDING'
  const isLeader = Boolean(membership?.isLeader)
  // 비로그인에게도 버튼을 보여 주고, 누르면 로그인으로 보낸다. GUEST 는 참여할 수 없어 숨긴다.
  const canApply = (!user || canJoin) && !membership && club.recruitStatus === 'RECRUITING'
  const headcount = `${club.memberCount}${club.capacity ? ` / ${club.capacity}` : ''}명`

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto w-full max-w-[1120px] space-y-8 px-[clamp(20px,5vw,44px)] pb-28 pt-11 mobile:pt-6">
        <ClubBackLink href="/club/" label="소모임 목록" />

        <section className="flex flex-wrap gap-8 mobile:gap-5">
          <ClubCover
            imageUrl={club.imageUrl}
            className="h-[240px] w-[360px] max-w-full shrink-0 rounded-[20px] mobile:h-[200px] mobile:w-full"
          />
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-3.5">
            <div className="flex gap-1.5">
              <ClubCategoryTag category={club.category} />
              <ClubRecruitTag recruiting={club.recruitStatus === 'RECRUITING'} />
            </div>
            <h1 className="text-[clamp(28px,3.2vw,40px)] font-semibold leading-[1.24] tracking-[-0.03em]">
              {club.name}
            </h1>
            <p className="text-[15px] leading-[1.6] text-dusk-ink-400">{club.summary}</p>
            <dl className="mt-1 grid grid-cols-3 gap-2">
              {[
                ['리더', club.leaderName],
                ['인원', headcount],
                ['활동 기간', formatPeriod(club.startDate, club.endDate)]
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="rounded-[14px] border border-dusk-line px-4 py-3 mobile:px-3"
                >
                  <dt className="text-xs text-dusk-ink-800">{term}</dt>
                  <dd className="mt-1 text-[15px] mobile:text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              {canApply && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={apply}
                  className={cn(DUSK_PRIMARY_BUTTON, 'px-[26px] py-3 text-[15px] mobile:hidden')}
                >
                  참여 신청
                </button>
              )}
              {isPending && (
                <>
                  <span className="text-sm text-tag-event">승인 대기 중</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => leave('참여 신청을 취소할까요?')}
                    className="min-h-11 px-2 text-[13px] text-dusk-ink-800"
                  >
                    신청 취소
                  </button>
                </>
              )}
              {isMember && club.kakaoLink && (
                <a
                  href={club.kakaoLink}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(DUSK_PRIMARY_BUTTON, 'px-[22px] py-3 text-[15px]')}
                >
                  단톡방 입장
                </a>
              )}
              {isLeader && (
                <Link href={`/club/manage/?id=${clubId}`} className={DUSK_GHOST_BUTTON}>
                  소모임 관리
                </Link>
              )}
              <KakaoShareButton />
              {isMember && !isLeader && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => leave('이 소모임에서 탈퇴할까요?')}
                  className="min-h-11 px-2 text-[13px] text-dusk-ink-800"
                >
                  탈퇴하기
                </button>
              )}
            </div>
          </div>
        </section>

        <ClubTabs<Tab>
          label="소모임 상세"
          current={tab}
          onChange={setTab}
          tabs={
            showTeamTabs
              ? [
                  { id: 'feed', label: '활동' },
                  { id: 'schedule', label: '일정·출석' },
                  { id: 'goal', label: '목표·완주' },
                  { id: 'about', label: '소개·멤버' }
                ]
              : [{ id: 'about', label: '소개' }]
          }
        />

        {tab === 'feed' && <ClubFeedTab clubId={clubId} myMembership={membership} />}
        {tab === 'schedule' && <ClubScheduleTab clubId={clubId} myMembership={membership} />}
        {tab === 'goal' && <ClubCompletionTab clubId={clubId} myMembership={membership} />}
        {tab === 'about' && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-8 mobile:grid-cols-1">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="mb-2.5 text-lg font-semibold">소개</h2>
                <p className="whitespace-pre-line text-[15px] leading-[1.75] text-dusk-ink-400">
                  {club.description}
                </p>
              </div>
              <div>
                <h2 className="mb-2.5 text-lg font-semibold">활동 방식</h2>
                <p className="whitespace-pre-line text-[15px] leading-[1.75] text-dusk-ink-400">
                  {club.activityMethod}
                </p>
              </div>
            </div>
            <div>
              <h2 className="mb-2.5 text-lg font-semibold">멤버 {club.memberCount}명</h2>
              {!isMemberOrStaff && (
                <p className="text-sm text-dusk-ink-800">멤버 명단은 참여한 사람에게만 보여요.</p>
              )}
              <ul>
                {(members ?? []).map((member) => (
                  <li
                    key={member.memberId}
                    className="flex items-center gap-3 border-b border-dusk-line-soft py-2.5"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-dusk-slot text-sm text-dusk-ink-400">
                      {member.name.slice(0, 1)}
                    </span>
                    <span className="text-[15px]">{member.name}</span>
                    {member.isLeader && <ClubLeaderTag />}
                    <span className="ml-auto text-[13px] text-dusk-ink-800">
                      {member.joinedAt?.slice(0, 10).replaceAll('-', '.')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 모바일: 참여 신청을 화면 아래에 붙여 엄지로 누르게 한다. */}
      {canApply && (
        <div className="sticky bottom-0 z-20 hidden items-center gap-2.5 border-t border-dusk-line bg-[rgba(27,22,34,0.94)] px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 mobile:flex">
          <div className="flex flex-1 flex-col">
            <span className="text-[15px] font-semibold">{headcount}</span>
            <span className="text-xs text-ember">모집 중</span>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={apply}
            className={cn(DUSK_PRIMARY_BUTTON, 'min-h-12 px-8 text-base')}
          >
            참여 신청
          </button>
        </div>
      )}
    </main>
  )
}
