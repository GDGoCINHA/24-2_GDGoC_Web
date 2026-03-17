'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

import { cn } from '@/utils/cn'
import { GdgLogo } from './GdgLogo'
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

export function GdgSiteHeader({
  menus,
  brandHref = '/',
  actionMenu = { label: '로그인', url: '/login' },
  actionMenus,
  className
}: GdgSiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const resolvedMenus = menus ?? DEFAULT_MENUS
  const resolvedActionMenus = actionMenus ?? (actionMenu ? [actionMenu] : [])

  return (
    <header
      className={cn(
        'relative z-40 w-full border-b border-white/10 bg-black mobile:h-18 mobile:border-gray-300 pc:h-[80px]',
        className
      )}
    >
      <div className="hidden h-full pc:block">
        <div className="mx-auto grid h-full w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-10">
          <Link href={brandHref} className="inline-flex shrink-0">
            <GdgLogo mode="auto" variant="long" />
          </Link>

          <nav className="flex items-center justify-self-center gap-16 text-white typo-pc-b2">
            {resolvedMenus.map((menu) => (
              <Link
                key={`${menu.label}-${menu.url}`}
                href={menu.url}
                className="transition-colors hover:text-red"
              >
                {menu.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-self-end gap-6">
            {resolvedActionMenus.map((menu) => (
              <Link
                key={`action-${menu.label}-${menu.url}`}
                href={menu.url}
                className="typo-pc-b3 whitespace-nowrap text-white hover:text-red"
              >
                {menu.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="layout-grid layout-grid--wide layout-grid--4 h-full items-center mobile:layout-grid--narrow-screen pc:hidden">
        <div className="col-span-4 flex items-center justify-between">
          <Link href={brandHref} className="inline-flex shrink-0">
            <GdgLogo mode="auto" variant="long" />
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-gray-300 text-white"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-50 bg-black/45 opacity-0 transition-opacity duration-200 pc:hidden',
          isMenuOpen && 'pointer-events-auto opacity-100'
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-[78%] max-w-[320px] border-l border-white/10 bg-black px-6 py-6 transition-transform duration-200 pc:hidden',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <GdgLogo mode="auto" variant="short" />
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-gray-300 text-white"
            aria-label="Close drawer"
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
              className="typo-m-b2 text-white transition-colors hover:text-red"
            >
              {menu.label}
            </Link>
          ))}
          {resolvedActionMenus.map((menu) => (
            <Link
              key={`mobile-action-${menu.label}-${menu.url}`}
              href={menu.url}
              onClick={() => setIsMenuOpen(false)}
              className="typo-m-b2 text-red"
            >
              {menu.label}
            </Link>
          ))}
        </nav>
      </aside>
    </header>
  )
}
