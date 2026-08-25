import type { ReactNode } from 'react'

import { GdgSiteHeader } from '@/components/ui/design-system'
import DuskShell from '@/components/ui/dusk/DuskShell'

/** 지원 흐름 안에서도 게시판·내 정보로 빠져나갈 수 있어야 한다. */
const RECRUIT_MENUS = [
  { label: '게시판', url: '/board/notices/' },
  { label: '내 정보', url: '/profile/' },
  { label: '지원하기', url: '/recruit/' }
]

export default function RecruitLayout({ children }: { children: ReactNode }) {
  return (
    <DuskShell>
      <GdgSiteHeader menus={RECRUIT_MENUS} actionMenu={{ label: '메인으로', url: '/' }} />
      {children}
    </DuskShell>
  )
}
