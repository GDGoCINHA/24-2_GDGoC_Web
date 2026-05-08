'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, User } from 'lucide-react'

import {
  NoticeMobileMenuDrawer,
  type NoticeMobileMenuItem
} from '@/components/notice/NoticeMobileMenuDrawer'
import { GdgLogo } from '@/components/ui/design-system'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { cn } from '@/utils/cn'

const showPlaceholderAlert = () => {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line no-alert
  window.alert('준비중입니다.')
}

const MENUS: NoticeMobileMenuItem[] = [
  { label: '공지사항', href: '/notice' },
  { label: '메뉴2', onClick: showPlaceholderAlert },
  { label: '메뉴3', onClick: showPlaceholderAlert },
  { label: '메뉴4', onClick: showPlaceholderAlert }
]

export const NoticeHeader = () => {
  const pathname = usePathname()
  const { handleLogout } = useAuthenticatedApi()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isActive = (href?: string): boolean =>
    Boolean(href && pathname?.startsWith(href))

  return (
    <header className="w-full bg-[#1e1e1e] text-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-2 overflow-hidden px-4 pc:h-16 pc:overflow-visible pc:px-8">
        <Link
          href="/"
          aria-label="홈으로"
          className="inline-flex min-w-0 cursor-pointer items-center overflow-hidden transition-opacity hover:opacity-80"
        >
          <GdgLogo mode="auto" variant="long" />
        </Link>

        {/* PC 메뉴 — 모바일에선 햄버거로 대체 */}
        <nav className="hidden items-center gap-10 pc:flex">
          {MENUS.map((menu) => {
            const active = isActive(menu.href)
            const className = cn(
              'text-sm transition-colors',
              active ? 'font-bold text-white' : 'font-normal text-gray-300 hover:text-white'
            )
            return menu.href ? (
              <Link key={menu.label} href={menu.href} className={className}>
                {menu.label}
              </Link>
            ) : (
              <button
                key={menu.label}
                type="button"
                onClick={menu.onClick}
                className={className}
              >
                {menu.label}
              </button>
            )
          })}
        </nav>

        {/* PC 우측 액션 — 모바일에선 햄버거로 통합 */}
        <div className="hidden items-center gap-4 pc:flex">
          <button
            type="button"
            onClick={showPlaceholderAlert}
            className="text-gray-300 transition-colors hover:text-white"
            aria-label="내 정보"
          >
            <User size={20} />
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="text-gray-300 transition-colors hover:text-white"
            aria-label="로그아웃"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* 모바일 햄버거 메뉴 — 클릭 시 우측 슬라이드 드로어 오픈 */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="text-white transition-opacity hover:opacity-70 pc:hidden"
          aria-label="메뉴 열기"
          aria-expanded={drawerOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      <NoticeMobileMenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        menus={MENUS}
      />
    </header>
  )
}
