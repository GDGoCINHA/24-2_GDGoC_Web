'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

import DuskBrand from '@/components/ui/common/DuskBrand'
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
    return pathname === base || pathname.startsWith(`${base}/`)
  }
}

export function GdgSiteHeader({
  menus,
  brandHref = '/',
  actionMenu = { label: '로그인', url: '/login' },
  actionMenus,
  className
}: GdgSiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isActive = useIsActive()
  const resolvedMenus = menus ?? DEFAULT_MENUS
  const resolvedActionMenus = actionMenus ?? (actionMenu ? [actionMenu] : [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-b-[rgba(240,234,228,0.08)] bg-[rgba(27,22,34,0.72)] backdrop-blur-[18px] mobile:h-16 pc:h-[68px]',
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
            </nav>
          </div>
        </div>

        <div className="flex h-full items-center justify-between px-5 pc:hidden">
          <DuskBrand href={brandHref} />
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-dusk-line text-dusk-ink-200"
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/*
        서랍은 header 밖에 둔다. header 에 backdrop-blur 가 걸려 있는데
        backdrop-filter 는 fixed 자손의 컨테이닝 블록이 되어, 안에 두면 이 상자가
        뷰포트가 아니라 헤더 높이(64px)로 잡힌다 — 서랍이 그만큼만 열린다.

        상자 자체는 화면을 넘지 않고, 서랍은 그 안에서 absolute 로 밀어낸다.
        닫힌 서랍을 fixed 로 화면 밖에 세우면 문서 폭이 늘어나 가로 스크롤이 생기는데,
        overflow-hidden 인 이 상자가 그것도 같이 막는다.
      */}
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-50 overflow-hidden pc:hidden',
          isMenuOpen && 'pointer-events-auto'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-[rgba(15,12,19,0.72)] opacity-0 transition-opacity duration-200',
            isMenuOpen && 'opacity-100'
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          className={cn(
            'absolute right-0 top-0 h-full w-[78%] max-w-[320px] border-l border-l-dusk-line bg-dusk-card px-6 py-6 transition-transform duration-200',
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="mb-8 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-dusk-line text-dusk-ink-200"
              aria-label="메뉴 닫기"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-5">
            {resolvedMenus.map((menu) => (
              <Link
                key={`mobile-drawer-${menu.label}-${menu.url}`}
                href={menu.url}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'text-base transition-colors',
                  isActive(menu.url) ? 'text-ember' : 'text-dusk-ink-200 hover:text-dusk-ink-100'
                )}
              >
                {menu.label}
              </Link>
            ))}
            {resolvedActionMenus.map((menu) => (
              <Link
                key={`mobile-action-${menu.label}-${menu.url}`}
                href={menu.url}
                onClick={() => setIsMenuOpen(false)}
                className="text-base text-dusk-ink-500 hover:text-dusk-ink-100"
              >
                {menu.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  )
}
