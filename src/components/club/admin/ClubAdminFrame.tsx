'use client'

import type { ReactNode } from 'react'

import AdminCategoryNav from '@/components/admin/dashboard/AdminCategoryNav'
import AdminHeader from '@/components/admin/dashboard/AdminHeader'

const HEADER_LINKS = [
  { label: '← 대시보드', href: '/dashboard' },
  { label: '소모임 화면', href: '/club/' }
]

/** 허브의 「소모임」 그룹과 같은 구성이다. 하나를 늘리면 허브(`dashboard/page.tsx`)도 고친다. */
const SCREENS = [
  { label: '현황', href: '/dashboard/club' },
  { label: '인증 검토', href: '/dashboard/club/review' },
  { label: '리더·기수', href: '/dashboard/club/leaders' }
]

/** 운영진 소모임 화면의 공통 머리. 조회는 CORE 이상(`dashboard/layout.tsx` 가 막는다). */
export function ClubAdminFrame({
  eyebrow,
  title,
  current,
  aside,
  children
}: {
  eyebrow: string
  title: string
  current: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-admin-base pb-12 font-pretendard text-admin-ink">
      <AdminHeader links={HEADER_LINKS} />
      <section className="mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-[clamp(20px,2.5vw,32px)]">
        <p data-admin-reveal className="text-[12px] uppercase tracking-[0.14em] text-admin-ink-dim">
          {eyebrow}
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(22px,2.4vw,30px)] font-semibold leading-[1.2] tracking-[-0.03em]">
            {title}
          </h1>
          {aside}
        </div>
        <AdminCategoryNav
          category="소모임"
          current={current}
          siblings={SCREENS.filter((screen) => screen.label !== current)}
        />
      </section>
      <div className="mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-6">{children}</div>
    </div>
  )
}
