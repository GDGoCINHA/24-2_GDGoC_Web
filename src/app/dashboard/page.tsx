'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import { useAuth } from '@/hooks/useAuth'

type DashboardItem = {
  href: string
  title: string
  description: string
  minRoleRank: number
}

type DashboardGroup = {
  label: string
  note: string
  items: DashboardItem[]
  /** 기본으로 접어 둘 그룹. 자주 안 쓰는 화면을 목록 밖으로 치운다. */
  collapsed?: boolean
}

/** 표시 순서대로 번호를 새로 매긴 항목. 걸러진 뒤에야 정해지므로 별도 타입이다. */
type NumberedItem = DashboardItem & { no: string }

type VisibleGroup = {
  label: string
  note: string
  items: NumberedItem[]
  collapsed: boolean
}

const DASHBOARD_GROUPS: DashboardGroup[] = [
  {
    label: '콘텐츠',
    note: '외부에 보이는 화면을 고칩니다',
    items: [
      {
        href: '/dashboard/landing',
        title: '온보딩 관리',
        description: '온보딩 화면의 문구, 사진, 모집 일정을 수정하고 발행합니다.',
        minRoleRank: 3
      }
    ]
  },
  {
    label: '멤버 · 지원',
    note: '사람과 지원서를 다룹니다',
    items: [
      {
        href: '/dashboard/users',
        title: 'Users',
        description: '유저 권한, 팀, 계정 상태를 확인하고 수정합니다.',
        minRoleRank: 2
      },
      {
        href: '/dashboard/members',
        title: 'Members',
        description: '신입 멤버 지원서와 회비 납부 상태를 확인합니다.',
        minRoleRank: 2
      },
      {
        href: '/dashboard/core/application',
        title: 'Core 지원서',
        description: '코어 지원서를 열람하고 합격/불합격을 처리합니다.',
        minRoleRank: 3
      },
      {
        href: '/dashboard/core/attendance',
        title: 'Core 출석',
        description: '코어 출석 현황을 조회하고 lead 이상은 출석을 기록합니다.',
        minRoleRank: 2
      }
    ]
  },
  {
    label: '가끔 쓰는 화면',
    note: '행사 기간에만 씁니다',
    collapsed: true,
    items: [
      {
        href: '/dashboard/mbti',
        title: 'MBTI',
        description: 'MBTI 결과 조회와 팀 매칭을 진행합니다.',
        minRoleRank: 2
      },
      {
        href: '/dashboard/memo',
        title: 'Memo 발송',
        description: '신입생 알림 신청 대상에게 안내 메시지를 발송합니다.',
        minRoleRank: 2
      },
      {
        href: '/dashboard/bingo',
        title: 'Bingo',
        description: '대시보드 안에서 팀별 빙고 체크를 수정합니다.',
        minRoleRank: 2
      },
      {
        href: '/dashboard/8bit',
        title: '8bit 순위표',
        description: '8bit 게임 점수 전체 컬럼을 순위표 형태로 조회합니다.',
        minRoleRank: 2
      }
    ]
  }
]

const ROLE_RANK: Record<string, number> = {
  GUEST: 0,
  MEMBER: 1,
  CORE: 2,
  LEAD: 3,
  ORGANIZER: 4,
  ADMIN: 5
}

const ROLE_LABEL: Record<number, string> = {
  2: 'CORE 이상',
  3: 'LEAD 이상'
}

/** 권한 기준 셀렉트에 세울 후보. 내 등급 이하만 남긴다. */
const VIEW_ROLES = ['CORE', 'LEAD', 'ORGANIZER', 'ADMIN'] as const

const HEADER_LINKS = [
  { label: '온보딩 화면', href: '/' },
  { label: '게시판', href: '/board/events/' },
  { label: '내 정보', href: '/profile/' }
]

const TOTAL_COUNT = DASHBOARD_GROUPS.reduce((n, group) => n + group.items.length, 0)

export default function DashboardIndexPage() {
  const { user } = useAuth()
  const myRole = user?.userRole ?? 'GUEST'
  const myRoleRank = ROLE_RANK[myRole] ?? 0

  const [query, setQuery] = useState('')
  const [viewRole, setViewRole] = useState<string | null>(null)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const searchRef = useRef<HTMLInputElement>(null)

  /**
   * 셀렉트는 내 등급 이하만 고를 수 있다. 위를 고를 수 있으면 눌러도 못 들어가는
   * 페이지가 목록에 뜬다 — 서버가 막아 주더라도 화면이 거짓말을 하게 된다.
   */
  const roleOptions = useMemo(
    () => VIEW_ROLES.filter((role) => (ROLE_RANK[role] ?? 0) <= myRoleRank),
    [myRoleRank]
  )

  const effectiveRole = viewRole ?? myRole
  const effectiveRank = ROLE_RANK[effectiveRole] ?? 0

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const isSearching = query.trim().length > 0

  const { groups, visibleCount } = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const result: VisibleGroup[] = []
    let no = 0

    DASHBOARD_GROUPS.forEach((group) => {
      const items = group.items
        .filter((item) => effectiveRank >= item.minRoleRank)
        .filter(
          (item) => !keyword || `${item.title} ${item.description}`.toLowerCase().includes(keyword)
        )
        .map((item) => {
          no += 1
          return { ...item, no: String(no).padStart(2, '0') }
        })

      if (items.length > 0) {
        result.push({
          label: group.label,
          note: group.note,
          items,
          collapsed: Boolean(group.collapsed)
        })
      }
    })

    return { groups: result, visibleCount: no }
  }, [effectiveRank, query])

  return (
    <div className="min-h-screen bg-admin-base pb-12 font-pretendard text-admin-ink">
      <AdminHeader links={HEADER_LINKS} />

      <section className="mx-auto w-full max-w-[1120px] px-[clamp(20px,5vw,44px)] pt-[clamp(24px,3vw,40px)]">
        <p data-admin-reveal className="text-[12px] uppercase tracking-[0.14em] text-admin-ink-dim">
          Admin Dashboard
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <h1 className="break-keep text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.2] tracking-[-0.03em]">
            관리 페이지 바로가기
          </h1>
          <p className="break-keep border-l border-admin-rule pl-3 text-[14px] leading-[1.6] text-admin-ink-muted">
            자주 쓰는 대시보드 하위 페이지를 한 곳에서 바로 이동할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1120px] px-[clamp(20px,5vw,44px)] pt-5">
        <div className="flex flex-wrap items-center gap-3.5">
          <label className="flex min-w-0 flex-1 basis-[320px] items-center gap-2.5 rounded-full border border-admin-line bg-admin-card px-4 py-2.5 shadow-admin transition duration-[250ms] focus-within:border-admin-accent focus-within:shadow-admin-ring">
            <span aria-hidden="true" className="text-[14px] text-admin-ink-dim">
              ⌕
            </span>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="페이지 검색  ( / 키로 이동 )"
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-admin-ink outline-none"
            />
          </label>

          {roleOptions.length > 1 ? (
            <label className="flex items-center gap-2.5 rounded-full border border-admin-line bg-admin-card px-4 py-2.5">
              <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">권한 기준</span>
              <select
                value={effectiveRole}
                onChange={(event) => setViewRole(event.target.value)}
                className="cursor-pointer border-0 bg-transparent text-[15px] text-admin-ink outline-none"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role} className="bg-admin-card text-admin-ink">
                    {role}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <span className="whitespace-nowrap text-[13px] text-admin-ink-dim">
            {TOTAL_COUNT}개 중 {visibleCount}개
          </span>
        </div>
      </section>

      {groups.length === 0 ? (
        <p className="mx-auto w-full max-w-[1120px] px-[clamp(20px,5vw,44px)] py-16 text-[15px] text-admin-ink-dim">
          조건에 맞는 페이지가 없습니다.
        </p>
      ) : null}

      {/* 아홉 개가 한 화면에 들어와야 한다. 넓은 화면에서는 그룹을 2열로 흘린다. */}
      <div className="mx-auto w-full max-w-[1120px] gap-6 px-[clamp(20px,5vw,44px)] pt-6 pc:columns-2">
        {groups.map((group) => {
          // 검색 중에는 접힌 그룹도 펼친다 — 안 그러면 결과가 없다고 나온다.
          const isOpen = !group.collapsed || Boolean(openGroups[group.label]) || isSearching

          return (
            <section key={group.label} className="mb-5 break-inside-avoid">
              {group.collapsed ? (
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-baseline gap-3 rounded-lg text-left outline-0 transition-colors duration-200 hover:text-admin-ink focus-visible:shadow-admin-ring"
                >
                  <span
                    aria-hidden="true"
                    className={`text-[11px] text-admin-accent transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                  >
                    ▶
                  </span>
                  <h2 className="text-[17px] font-semibold tracking-[-0.025em]">{group.label}</h2>
                  <span className="break-keep text-[12px] text-admin-ink-dim">
                    {isOpen ? group.note : `${group.items.length}개 · 눌러서 펼치기`}
                  </span>
                </button>
              ) : (
                <div className="flex items-baseline gap-3">
                  <h2 data-admin-reveal className="text-[17px] font-semibold tracking-[-0.025em]">
                    {group.label}
                  </h2>
                  <span data-admin-reveal className="break-keep text-[12px] text-admin-ink-dim">
                    {group.note}
                  </span>
                </div>
              )}

              {isOpen ? (
                <div className="mt-2.5 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-admin-reveal
                      className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-admin-line-soft bg-admin-card p-3.5 shadow-admin outline-0 transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-[3px] hover:border-admin-line-accent hover:shadow-admin-lift focus-visible:-translate-y-[3px] focus-visible:border-admin-accent focus-visible:shadow-admin-ring-strong"
                    >
                      <span className="grid size-8 place-items-center rounded-[11px] bg-admin-badge text-[13px] font-semibold tabular-nums text-admin-badge-ink">
                        {item.no}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[16px] font-semibold tracking-[-0.025em] text-admin-ink">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block break-keep text-[13px] leading-[1.5] text-admin-ink-soft">
                          {item.description}
                        </span>
                      </span>
                      <span className="flex items-center gap-2.5 whitespace-nowrap">
                        <span className="rounded-full bg-admin-tag px-2.5 py-1 text-[11px] tracking-[0.04em] text-admin-tag-ink mobile:hidden">
                          {ROLE_LABEL[item.minRoleRank] ?? ''}
                        </span>
                        <span aria-hidden="true" className="text-[15px] text-admin-accent">
                          →
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>

      <footer className="mx-auto mt-8 flex w-full max-w-[1120px] flex-wrap justify-between gap-4 border-t border-admin-line-soft px-[clamp(20px,5vw,44px)] pt-4">
        <span className="break-keep text-[13px] text-admin-ink-dim">
          권한 기준을 바꾸면 그 등급이 볼 수 있는 페이지만 남습니다. 접힌 그룹은 검색하면 함께
          나옵니다.
        </span>
        <span className="break-keep text-[13px] text-admin-ink-dim">GDGoC INHA · 내부 운영용</span>
      </footer>
    </div>
  )
}
