import { Suspense, type ReactNode } from 'react'

import Loader from '@/components/ui/common/Loader'
import { GdgSiteHeader } from '@/components/ui/design-system'
import DuskShell from '@/components/ui/dusk/DuskShell'

export const metadata = {
  title: 'Recruit',
  description: 'Recruitment management and participation platform'
}

/** 지원 흐름 안에서도 게시판·내 정보로 빠져나갈 수 있어야 한다. */
const RECRUIT_MENUS = [
  { label: '게시판', url: '/board/notices/' },
  { label: '내 정보', url: '/profile/' },
  { label: '지원하기', url: '/recruit/' }
]

/**
 * Suspense 는 지우면 안 된다. 아래 페이지들이 `useSearchParams()` 를 쓰는데
 * 정적 내보내기에서는 경계가 없으면 빌드가 막힌다.
 */
export default function RecruitLayout({ children }: { children: ReactNode }) {
  return (
    <DuskShell>
      <GdgSiteHeader menus={RECRUIT_MENUS} actionMenu={{ label: '메인으로', url: '/' }} />
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </DuskShell>
  )
}
