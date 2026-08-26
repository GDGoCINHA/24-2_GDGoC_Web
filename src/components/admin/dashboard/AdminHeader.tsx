'use client'

import Image from 'next/image'
import Link from 'next/link'

import gdgocPcLogo from '@public/icons/gdgocIcon/pc.svg'

import { useAuth } from '@/hooks/useAuth'

type AdminHeaderLink = {
  label: string
  href: string
}

/**
 * 관리자 허브·Users 가 함께 쓰는 상단 바.
 *
 * `dashboard/layout.tsx` 가 아니라 두 화면에서 각각 붙인다 — 나머지 하위 화면은
 * 아직 구 디자인이라 레이아웃에 넣으면 헤더만 새 톤으로 떠 버린다.
 */
export default function AdminHeader({ links }: { links: AdminHeaderLink[] }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between gap-6 border-b border-admin-line-veil bg-admin-veil px-[clamp(20px,4vw,44px)] backdrop-blur-[18px]">
      <Link href="/dashboard" className="flex min-w-0 shrink-0 items-center gap-3">
        <Image
          src={gdgocPcLogo}
          alt="GDGoC INHA"
          width={53}
          height={30}
          className="block h-[30px] w-auto"
          priority
        />
        <span className="flex flex-col gap-0.5 whitespace-nowrap leading-[1.15]">
          <span className="text-[15px] tracking-[-0.01em] text-admin-ink">GDGoC INHA</span>
          <span className="text-[11px] tracking-[-0.01em] text-admin-ink-soft">
            Admin Dashboard
          </span>
        </span>
      </Link>

      <nav className="flex items-center gap-[clamp(14px,2.4vw,30px)]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap text-[15px] text-admin-ink-muted transition-colors duration-200 hover:text-admin-ink mobile:hidden"
          >
            {link.label}
          </Link>
        ))}
        <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-admin-line-strong px-3.5 py-1.5 text-[13px] text-admin-ink-muted">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-admin-ok" />
          {user?.userRole ?? '운영진'}
        </span>
      </nav>
    </header>
  )
}
