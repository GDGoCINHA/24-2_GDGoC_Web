import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import { GdgSiteHeader } from '@/components/ui/design-system'
import DuskShell from '@/components/ui/dusk/DuskShell'

const ADMIN_MENUS = [
  { label: '게시판', url: '/board/notices/' },
  { label: '내 정보', url: '/profile/' },
  { label: '온보딩 관리', url: '/dashboard/landing/' }
]

/** 공개 첫 화면을 바꾸는 화면이라 게시판 글쓰기(CORE)보다 좁게 잡는다. 서버도 LEAD 로 막는다. */
export default function LandingAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="LEAD" nextOverride="/dashboard/landing">
      <DuskShell>
        <GdgSiteHeader menus={ADMIN_MENUS} actionMenu={{ label: '메인으로', url: '/' }} />
        {children}
      </DuskShell>
    </ApiCodeGuard>
  )
}
