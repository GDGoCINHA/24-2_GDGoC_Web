'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'

import DuskBrand from '@/components/ui/common/DuskBrand'
import { useAuth } from '@/hooks/useAuth'
import { canOpenDashboard } from '@/utils/auth/role'
import { cn } from '@/utils/cn'
import type { GdgMenuLink } from './GdgSiteNav.types'

export type GdgSiteHeaderProps = {
  menus?: GdgMenuLink[]
  brandHref?: string
  actionMenu?: GdgMenuLink
  actionMenus?: GdgMenuLink[]
  className?: string
}

const DEFAULT_MENUS: GdgMenuLink[] = [
  { label: '멤버관리', url: '/admin/recruit-manager' },
  { label: '권한관리', url: '/admin/member-manager' },
  { label: '운영자 지원관리', url: '/coreadmin' },
  { label: '출석 관리', url: '/dashboard/core/attendance' }
]

/**
 * 지금 보고 있는 게시판을 밑줄로 알린다.
 *
 * `trailingSlash: true` 라 링크는 `/board/notices/` 인데 상세·작성 페이지는
 * `/board/notices/detail` 처럼 더 깊다. 접두사로 비교해야 상세에서도 탭이 켜진다.
 */
function useIsActive() {
  const pathname = usePathname()
  return (url: string) => {
    const base = url.endsWith('/') ? url.slice(0, -1) : url
    // '/' 는 접두사로 비교하면 모든 경로에서 켜진다
    if (!base) return pathname === '/'
    return pathname === base || pathname.startsWith(`${base}/`)
  }
}

const HOME_TAB: GdgMenuLink = { label: '홈', url: '/' }
const PROFILE_URL = '/profile/'

/**
 * 운영진만 보는 대시보드 입구. 랜딩 헤더의 「콘텐츠 관리」와 같은 테두리 버튼이다 —
 * 일반 메뉴와 섞여 보이면 안 되고, 강조색(ember)은 지원하기 같은 주 행동 몫이다.
 */
const ADMIN_ENTRY_CLASS =
  'inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.22)] px-3.5 text-[13px] text-dusk-ink-400 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:text-dusk-ink-100'

export function GdgSiteHeader({
  menus,
  brandHref = '/',
  actionMenu = { label: '로그인', url: '/login' },
  actionMenus,
  className
}: GdgSiteHeaderProps) {
  const isActive = useIsActive()
  const pathname = usePathname()
  const { user } = useAuth()
  const resolvedMenus = menus ?? DEFAULT_MENUS
  const resolvedActionMenus = actionMenus ?? (actionMenu ? [actionMenu] : [])
  // 화면에서 숨기는 것일 뿐 막는 것은 대시보드 가드와 서버다
  const showAdminEntry = canOpenDashboard(user?.userRole)

  // 모바일은 서랍 없이 탭 줄에 다 꺼내 둔다. 내 정보는 오른쪽 위 아이콘이 맡으므로 탭에서 뺀다.
  const mobileTabs = [HOME_TAB, ...resolvedMenus.filter((menu) => menu.url !== PROFILE_URL)]

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-b-[rgba(240,234,228,0.08)] bg-[rgba(27,22,34,0.72)] backdrop-blur-[18px] pc:h-[68px]',
        className
      )}
    >
      <div className="hidden h-full pc:block">
        <div className="flex h-full items-center justify-between gap-6 px-[clamp(20px,4vw,44px)]">
          <DuskBrand href={brandHref} />

          <nav className="flex items-center gap-[clamp(12px,2vw,28px)]">
            {resolvedMenus.map((menu) => {
              const active = isActive(menu.url)
              return (
                <Link
                  key={`${menu.label}-${menu.url}`}
                  href={menu.url}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap border-b-2 pb-[3px] text-[15px] transition-colors',
                    active
                      ? 'border-b-ember text-dusk-ink-100'
                      : 'border-b-transparent text-dusk-ink-500 hover:text-dusk-ink-100'
                  )}
                >
                  {menu.label}
                </Link>
              )
            })}
            {resolvedActionMenus.map((menu) => (
              <Link
                key={`action-${menu.label}-${menu.url}`}
                href={menu.url}
                className="whitespace-nowrap text-[15px] text-dusk-ink-500 transition-colors hover:text-dusk-ink-100"
              >
                {menu.label}
              </Link>
            ))}
            {showAdminEntry && (
              <Link href="/dashboard/" className={ADMIN_ENTRY_CLASS}>
                운영
              </Link>
            )}
          </nav>
        </div>
      </div>

      <div className="pc:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-5">
          <DuskBrand href={brandHref} />
          <div className="flex items-center gap-2">
            {showAdminEntry && (
              <Link href="/dashboard/" className={ADMIN_ENTRY_CLASS}>
                운영
              </Link>
            )}
            {user ? (
              <Link
                href={PROFILE_URL}
                aria-label="내 정보"
                aria-current={isActive(PROFILE_URL) ? 'page' : undefined}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full border transition-colors',
                  isActive(PROFILE_URL)
                    ? 'border-ember text-dusk-ink-100'
                    : 'border-dusk-line text-dusk-ink-200'
                )}
              >
                <User size={19} />
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className="inline-flex h-10 items-center px-2 text-[15px] text-dusk-ink-300"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <nav aria-label="메뉴" className="no-scrollbar flex h-11 overflow-x-auto px-3">
          {mobileTabs.map((menu) => {
            const active = isActive(menu.url)
            return (
              <Link
                key={`tab-${menu.label}-${menu.url}`}
                href={menu.url}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center border-b-2 px-3 text-[15px] transition-colors',
                  active
                    ? 'border-b-ember text-dusk-ink-100'
                    : 'border-b-transparent text-dusk-ink-500'
                )}
              >
                {menu.shortLabel ?? menu.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
