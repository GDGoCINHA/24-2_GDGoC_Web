import type { ReactNode } from 'react'

import DuskShell from '@/components/ui/dusk/DuskShell'

/** 게시판 15개 페이지가 쓰는 공통 바탕. */
export default function BoardLayout({ children }: { children: ReactNode }) {
  return <DuskShell>{children}</DuskShell>
}
