'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

import { GdgLogo } from '@/components/ui/design-system'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { cn } from '@/utils/cn'

interface MenuItem {
  label: string
  href?: string
  onClick?: () => void
}

const showPlaceholderAlert = () => {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line no-alert
  window.alert('준비중입니다.')
}

const MENUS: MenuItem[] = [
  { label: '공지사항', href: '/notice' },
  { label: '메뉴2', onClick: showPlaceholderAlert },
  { label: '메뉴3', onClick: showPlaceholderAlert },
  { label: '메뉴4', onClick: showPlaceholderAlert }
]

export const NoticeHeader = () => {
  const pathname = usePathname()
  const { handleLogout } = useAuthenticatedApi()

  const isActive = (href?: string): boolean =>
    Boolean(href && pathname?.startsWith(href))

  return (
    <header className="w-full bg-[#1e1e1e] text-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-8">
        <Link
          href="/"
          aria-label="홈으로"
          className="inline-flex cursor-pointer items-center transition-opacity hover:opacity-80"
        >
          <GdgLogo mode="pc" variant="long" />
        </Link>

        <nav className="flex items-center gap-10">
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

        <div className="flex items-center gap-4">
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
      </div>
    </header>
  )
}
