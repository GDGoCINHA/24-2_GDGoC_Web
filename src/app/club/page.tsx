'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ClubGlobalFeed } from '@/components/club/ClubGlobalFeed'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  ClubCategoryTag,
  ClubCover,
  ClubLeaderTag,
  ClubRecruitTag,
  ClubStatusTag,
  ClubTabs
} from '@/components/club/ClubUi'
import {
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_GHOST_BUTTON,
  DUSK_PRIMARY_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { publicClient } from '@/lib/api/publicClient'
import { fetchClubs, fetchMyClubs, readClubError } from '@/services/club/clubClient'
import { CLUB_CATEGORY_LABEL, type ClubCategory, type ClubSummary, type MyClub } from '@/types/club'
import { hasAtLeast } from '@/utils/auth/role'
import { cn } from '@/utils/cn'

type Tab = 'browse' | 'mine' | 'feed'
const CATEGORIES: (ClubCategory | 'ALL')[] = ['ALL', 'STUDY', 'HOBBY', 'CAREER', 'ETC']
const CHIP_SIZE = 'min-h-10 px-4 py-2 text-[13px]'

export default function ClubListPage() {
  const { user } = useAuth()
  const isStaff = hasAtLeast(user?.userRole, 'CORE')
  const [tab, setTab] = useState<Tab>('browse')
  const [category, setCategory] = useState<ClubCategory | 'ALL'>('ALL')
  const [recruitingOnly, setRecruitingOnly] = useState(false)
  const [keyword, setKeyword] = useState('')

  const { apiClient: authClient } = useAuthenticatedApi()
  // 비로그인도 목록은 본다. 인증 클라이언트로 부르면 401 인터셉터가 로그인으로 보낸다.
  const apiClient = user ? authClient : publicClient
  const [clubs, setClubs] = useState<ClubSummary[] | null>(null)
  const [myClubs, setMyClubs] = useState<MyClub[]>([])
  const [error, setError] = useState<string | null>(null)

  // 검색어는 타이핑이 멈춘 뒤에 보낸다.
  useEffect(() => {
    let alive = true
    const timer = setTimeout(() => {
      fetchClubs(apiClient, {
        category: category === 'ALL' ? undefined : category,
        recruitStatus: recruitingOnly ? 'RECRUITING' : undefined,
        keyword: keyword.trim() || undefined,
        size: 60
      })
        .then(({ items }) => {
          if (!alive) return
          setClubs(items)
          setError(null)
        })
        .catch((err) => {
          if (alive) setError(readClubError(err, '소모임 목록을 불러오지 못했어요.'))
        })
    }, 250)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [apiClient, category, recruitingOnly, keyword])

  useEffect(() => {
    if (!user) return
    fetchMyClubs(apiClient)
      .then(setMyClubs)
      .catch(() => setMyClubs([]))
  }, [apiClient, user])

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto w-full max-w-[1120px] space-y-7 px-[clamp(20px,5vw,44px)] pb-28 pt-14 mobile:pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-5">
          <div>
            <h1 className="text-[clamp(28px,3.2vw,42px)] font-semibold leading-[1.24] tracking-[-0.03em]">
              소모임
            </h1>
            <p className="mt-3 text-sm text-dusk-ink-700">
              관심사가 같은 부원끼리 모여 매주 함께 활동해요
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 운영진에게만 보인다. 서버도 CORE 미만을 막는다. */}
            {isStaff && (
              <Link href="/dashboard/club/" className={DUSK_GHOST_BUTTON}>
                운영진 대시보드
              </Link>
            )}
            <Link href="/club/new/" className={cn(DUSK_PRIMARY_BUTTON, 'mobile:hidden')}>
              소모임 개설
            </Link>
          </div>
        </div>

        <ClubTabs<Tab>
          label="소모임 보기"
          current={tab}
          onChange={setTab}
          tabs={
            // 비로그인은 둘러보기만. 활동 피드는 공개하지 않는다.
            user
              ? [
                  { id: 'browse', label: '둘러보기' },
                  { id: 'mine', label: '내 소모임', count: myClubs.length },
                  { id: 'feed', label: '활동 피드' }
                ]
              : [{ id: 'browse', label: '둘러보기' }]
          }
        />

        {tab === 'browse' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={cn(category === value ? DUSK_CHIP_ACTIVE : DUSK_CHIP, CHIP_SIZE)}
                  >
                    {value === 'ALL' ? '전체' : CLUB_CATEGORY_LABEL[value]}
                  </button>
                ))}
                <span aria-hidden className="mx-1 h-6 w-px bg-dusk-line" />
                <button
                  type="button"
                  aria-pressed={recruitingOnly}
                  onClick={() => setRecruitingOnly((prev) => !prev)}
                  className={cn(recruitingOnly ? DUSK_CHIP_ACTIVE : DUSK_CHIP, CHIP_SIZE)}
                >
                  모집 중만
                </button>
              </div>
              <label className="flex flex-[0_1_300px] items-center gap-2.5 rounded-full border border-[rgba(240,234,228,0.16)] bg-[rgba(240,234,228,0.06)] px-5 py-3 mobile:flex-[1_1_100%]">
                <span className="sr-only">소모임 이름 검색</span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="소모임 이름으로 검색"
                  className="min-w-0 flex-1 bg-transparent text-sm text-dusk-ink-100 outline-none placeholder:text-dusk-ink-800 mobile:text-base"
                />
              </label>
            </div>

            {error ? (
              <p className="py-16 text-center text-[15px] text-dusk-ink-800">{error}</p>
            ) : clubs === null ? (
              <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중…</p>
            ) : clubs.length === 0 ? (
              <p className="py-16 text-center text-[15px] text-dusk-ink-800">
                조건에 맞는 소모임이 없어요.
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 mobile:grid-cols-1">
                {clubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/club/detail/?id=${club.id}`}
                    className="flex flex-col overflow-hidden rounded-[20px] border border-dusk-line-soft bg-dusk-raise transition-colors hover:border-dusk-line"
                  >
                    <ClubCover imageUrl={club.imageUrl} className="h-[168px] mobile:h-[140px]" />
                    <div className="flex flex-col gap-2.5 px-5 pb-5 pt-[18px]">
                      <div className="flex gap-1.5">
                        <ClubCategoryTag category={club.category} />
                        {/* 운영진에게는 공개 전·숨김 소모임도 보인다. 모집 대신 상태를 단다. */}
                        {club.status === 'ACTIVE' || club.status === 'ENDED' ? (
                          <ClubRecruitTag recruiting={club.recruitStatus === 'RECRUITING'} />
                        ) : (
                          <ClubStatusTag status={club.status} />
                        )}
                      </div>
                      <div className="text-lg font-semibold tracking-[-0.02em]">{club.name}</div>
                      <p className="line-clamp-2 min-h-[43px] text-sm leading-[1.55] text-dusk-ink-600">
                        {club.summary}
                      </p>
                      <div className="flex justify-between border-t border-dusk-line-soft pt-2.5 text-[13px] text-dusk-ink-800">
                        <span>리더 {club.leaderName}</span>
                        <span>
                          {club.memberCount}
                          {club.capacity ? ` / ${club.capacity}` : ''}명
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'mine' && (
          <div className="flex flex-col gap-3">
            {myClubs.length === 0 && (
              <p className="py-16 text-center text-[15px] text-dusk-ink-800">
                아직 참여한 소모임이 없어요.
              </p>
            )}
            {myClubs.map(({ club, isLeader, status }) => (
              <Link
                key={club.id}
                href={`/club/detail/?id=${club.id}`}
                className="flex items-center gap-4 rounded-[14px] border border-dusk-line px-5 py-[18px]"
              >
                <ClubCover imageUrl={club.imageUrl} className="size-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-base font-semibold">{club.name}</span>
                    {isLeader && <ClubLeaderTag />}
                  </div>
                  <div className="mt-1.5 truncate text-[13px] text-dusk-ink-700">
                    {club.summary}
                  </div>
                </div>
                {club.status === 'PENDING' ? (
                  <span className="shrink-0 text-[13px] text-tag-event">개설 승인 대기</span>
                ) : club.status === 'REJECTED' ? (
                  <span className="shrink-0 text-[13px] text-signal-err">개설 반려</span>
                ) : (
                  status === 'PENDING' && (
                    <span className="shrink-0 text-[13px] text-tag-event">승인 대기</span>
                  )
                )}
              </Link>
            ))}
          </div>
        )}

        {tab === 'feed' && <ClubGlobalFeed />}
      </div>

      {/* 모바일에서는 개설 버튼을 엄지가 닿는 자리에 띄운다. */}
      <Link
        href="/club/new/"
        aria-label="소모임 개설"
        className="fixed bottom-6 right-5 z-20 hidden size-14 items-center justify-center rounded-full bg-ember text-ember-ink shadow-[0_10px_24px_rgba(0,0,0,0.45)] mobile:flex"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </main>
  )
}
