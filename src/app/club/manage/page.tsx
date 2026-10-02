'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { ClubBackLink, ClubLeaderTag } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_DANGER_BUTTON,
  DUSK_GHOST_BUTTON,
  DUSK_PRIMARY_BUTTON
} from '@/components/ui/dusk/DuskForm'
import {
  MOCK_CLUB_DETAIL,
  MOCK_FIX_REQUESTS,
  MOCK_MEMBERS,
  MOCK_PENDING_APPLICANTS
} from '@/mock/clubMock'
import { cn } from '@/utils/cn'

const SMALL = 'px-4 py-2 text-[13px]'

/** 이끔이 관리 화면. 신청 처리·멤버(A), 출석 수정 요청(B). 이끔이가 아니면 서버가 403. */
export default function ClubManagePage() {
  const searchParams = useSearchParams()
  const clubId = searchParams.get('id') ?? ''
  const club = MOCK_CLUB_DETAIL
  const overCapacity =
    club.capacity !== null && club.memberCount + MOCK_PENDING_APPLICANTS.length > club.capacity

  const shortcuts = [
    { label: '활동 기록 작성', href: `/club/activity/edit/?clubId=${clubId}`, primary: true },
    { label: '일정 등록', href: '#', primary: false },
    { label: '출석 QR 띄우기', href: '#', primary: false },
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
                'flex min-h-14 items-center rounded-[14px] px-4 text-sm',
                item.primary
                  ? 'bg-ember font-medium text-ember-ink'
                  : 'border border-[rgba(240,234,228,0.16)] text-dusk-ink-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">
              참여 신청 <span className="text-ember">{MOCK_PENDING_APPLICANTS.length}</span>
            </h2>
            <button type="button" className={cn(DUSK_GHOST_BUTTON, SMALL)}>
              모집 중 · 마감하기
            </button>
          </div>
          {MOCK_PENDING_APPLICANTS.map((applicant) => (
            <div
              key={applicant.id}
              className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-dusk-line px-[18px] py-4"
            >
              <div className="min-w-0 flex-[1_1_300px]">
                <div className="text-[15px] font-semibold">
                  {applicant.name}{' '}
                  <span className="text-[13px] font-normal text-dusk-ink-800">
                    {applicant.meta}
                  </span>
                </div>
                <div className="mt-1.5 text-sm leading-[1.55] text-dusk-ink-400">
                  {applicant.message}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className={cn(DUSK_GHOST_BUTTON, SMALL)}>
                  거절
                </button>
                <button type="button" className={cn(DUSK_PRIMARY_BUTTON, SMALL)}>
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

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            출석 수정 요청 <span className="text-ember">{MOCK_FIX_REQUESTS.length}</span>
          </h2>
          {MOCK_FIX_REQUESTS.map((request) => (
            <div
              key={request.id}
              className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-dusk-line px-[18px] py-4"
            >
              <div className="min-w-0 flex-[1_1_300px]">
                <div className="text-[15px] font-semibold">
                  {request.name}{' '}
                  <span className="text-[13px] font-normal text-dusk-ink-800">
                    {request.target}
                  </span>
                </div>
                <div className="mt-1.5 text-sm text-dusk-ink-400">{request.reason}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" className={cn(DUSK_GHOST_BUTTON, SMALL)}>
                  거절
                </button>
                <button type="button" className={cn(DUSK_PRIMARY_BUTTON, SMALL)}>
                  반영
                </button>
              </div>
            </div>
          ))}
          <p className="text-[13px] text-dusk-ink-800">
            반영하면 그 활동 기록은 다시 검토 중이 돼요. 인증 완료된 기록은 고칠 수 없어요.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">멤버 {MOCK_MEMBERS.length}명</h2>
          <ul className="overflow-hidden rounded-[14px] border border-dusk-line">
            {MOCK_MEMBERS.map((member) => (
              <li
                key={member.userId}
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
                      className={cn(DUSK_GHOST_BUTTON, 'min-h-9 px-3 py-1 text-xs')}
                    >
                      이끔이 넘기기
                    </button>
                    <button
                      type="button"
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
