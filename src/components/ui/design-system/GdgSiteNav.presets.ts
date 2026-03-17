import type { GdgSiteFooterProps } from './GdgSiteFooter'
import type { GdgSiteHeaderProps } from './GdgSiteHeader'
import type { GdgMenuLink } from './GdgSiteNav.types'

export type GdgHeaderFooterPreset = {
  id: 'default'
  header: Pick<GdgSiteHeaderProps, 'menus' | 'actionMenu'>
  footer: Pick<GdgSiteFooterProps, 'sections'>
}

export const GDG_DEFAULT_MAIN_MENUS: GdgMenuLink[] = [
  { label: '멤버관리', url: '/admin/recruit-manager' },
  { label: '권한관리', url: '/admin/member-manager' },
  { label: '운영자 지원관리', url: '/coreadmin' },
  { label: '출석 관리', url: '/dashboard/core/attendance' }
]

export const GDG_DEFAULT_FOOTER_SECTIONS: GdgSiteFooterProps['sections'] = [
  {
    title: 'Menu',
    links: GDG_DEFAULT_MAIN_MENUS
  },
  {
    title: 'Etc',
    links: [
      { label: '로그인', url: '/login' },
      { label: '메인으로', url: '/' }
    ]
  }
]

export const GDG_HEADER_FOOTER_PRESETS: GdgHeaderFooterPreset[] = [
  {
    id: 'default',
    header: {
      menus: GDG_DEFAULT_MAIN_MENUS,
      actionMenu: { label: '로그인', url: '/login' }
    },
    footer: {
      sections: GDG_DEFAULT_FOOTER_SECTIONS
    }
  }
]
