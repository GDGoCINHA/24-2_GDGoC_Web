'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  ClubCategoryTag,
  ClubCover,
  ClubLeaderTag,
  ClubRecruitTag,
  ClubTabs
} from '@/components/club/ClubUi'
import {
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_GHOST_BUTTON,
  DUSK_PRIMARY_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { useAuth } from '@/hooks/useAuth'
import { MOCK_CLUBS, MOCK_GLOBAL_FEED, MOCK_MY_CLUBS } from '@/mock/clubMock'
import { CLUB_CATEGORY_LABEL, type ClubCategory } from '@/types/club'
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

  // TODO(A): GET /api/v1/clubs?category=&recruitStatus=&keyword= 로 바꾼다.
  const clubs = useMemo(
    () =>
      MOCK_CLUBS.filter(
        (club) =>
          (category === 'ALL' || club.category === category) &&
          (!recruitingOnly || club.recruitStatus === 'RECRUITING') &&
          club.name.includes(keyword.trim())
      ),
    [category, recruitingOnly, keyword]
  )

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
          tabs={[
            { id: 'browse', label: '둘러보기' },
            { id: 'mine', label: '내 소모임', count: MOCK_MY_CLUBS.length },
            { id: 'feed', label: '활동 피드' }
          ]}
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

            {clubs.length === 0 ? (
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
                        <ClubRecruitTag recruiting={club.recruitStatus === 'RECRUITING'} />
                      </div>
                      <div className="text-lg font-semibold tracking-[-0.02em]">{club.name}</div>
                      <p className="line-clamp-2 min-h-[43px] text-sm leading-[1.55] text-dusk-ink-600">
                        {club.summary}
                      </p>
                      <div className="flex justify-between border-t border-dusk-line-soft pt-2.5 text-[13px] text-dusk-ink-800">
                        <span>이끔이 {club.leaderName}</span>
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
            {MOCK_MY_CLUBS.map(({ club, isLeader, next, week }) => (
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
                  <div className="mt-1.5 truncate text-[13px] text-dusk-ink-700">{next}</div>
                </div>
                <span className="shrink-0 text-[13px] text-dusk-ink-800 mobile:hidden">{week}</span>
              </Link>
            ))}
          </div>
        )}

        {tab === 'feed' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 mobile:grid-cols-1">
            {MOCK_GLOBAL_FEED.map((item) => (
              <Link
                key={`${item.clubId}-${item.date}`}
                href={`/club/detail/?id=${item.clubId}`}
                className="flex flex-col overflow-hidden rounded-[20px] border border-dusk-line-soft bg-dusk-raise"
              >
                <div className="grid h-[220px] grid-cols-[2fr_1fr] grid-rows-2 gap-0.5 mobile:h-[180px]">
                  <div className="row-span-2 bg-dusk-slot" />
                  <div className="bg-dusk-field" />
                  <div className="flex items-center justify-center bg-dusk-slot text-[13px] text-dusk-ink-400">
                    +{Math.max(item.photos - 2, 0)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-5 pb-[18px] pt-4">
                  <div className="flex justify-between text-[13px] text-dusk-ink-700">
                    <span className="text-ember">{item.club}</span>
                    <span>{item.date}</span>
                  </div>
                  <p className="text-[15px] leading-[1.55] text-dusk-ink-200">{item.text}</p>
                  <div className="flex gap-3.5 text-[13px] text-dusk-ink-800">
                    <span>참석 {item.attended}</span>
                    <span>좋아요 {item.likes}</span>
                    <span>댓글 {item.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
