import Link from 'next/link'

import { cn } from '@/utils/cn'
import { GdgLogo } from './GdgLogo'
import type { GdgMenuLink } from './GdgSiteNav.types'

export type GdgFooterMenuSection = {
  title: string
  links: GdgMenuLink[]
}

export type GdgSiteFooterProps = {
  sections?: GdgFooterMenuSection[]
  brandHref?: string
  copyright?: string
  className?: string
}

const DEFAULT_SECTIONS: GdgFooterMenuSection[] = [
  {
    title: 'Menu',
    links: [
      { label: '멤버관리', url: '/admin/recruit-manager' },
      { label: '권한관리', url: '/admin/member-manager' },
      { label: '운영자 지원관리', url: '/coreadmin' },
      { label: '출석 관리', url: '/dashboard/core/attendance' }
    ]
  },
  {
    title: 'Etc',
    links: [
      { label: '로그인', url: '/login' },
      { label: '메인으로', url: '/' }
    ]
  }
]

export function GdgSiteFooter({
  sections,
  brandHref = '/',
  copyright = '© GDGoC INHA. All rights reserved.',
  className
}: GdgSiteFooterProps) {
  const resolvedSections = sections ?? DEFAULT_SECTIONS

  return (
    <footer
      className={cn(
        'w-full border-t border-white/10 bg-black py-12 mobile:border-gray-400 mobile:py-8',
        className
      )}
    >
      <div className="layout-grid layout-grid--wide layout-grid--4 gap-y-8 mobile:layout-grid--narrow-screen">
        <div className="col-span-4 flex flex-col gap-6 border-b border-white/10 pb-8 mobile:gap-5 mobile:pb-6">
          <Link href={brandHref} className="inline-flex w-fit">
            <GdgLogo mode="auto" variant="long" />
          </Link>

          <div className="grid grid-cols-2 gap-6 mobile:grid-cols-1">
            {resolvedSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="typo-pc-b3 text-gray-500 mobile:typo-m-c1 mobile:uppercase mobile:tracking-[0.12em]">
                  {section.title}
                </p>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}-${link.url}`}>
                      <Link
                        href={link.url}
                        className="typo-pc-b2 text-white transition-colors hover:text-red mobile:typo-m-b3 mobile:uppercase mobile:tracking-[0.08em]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4">
          <p className="typo-pc-c2 mobile:typo-m-c1 text-gray-500">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
