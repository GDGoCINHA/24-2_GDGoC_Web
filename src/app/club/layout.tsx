import type { ReactNode } from 'react'

import DuskShell from '@/components/ui/dusk/DuskShell'

/**
 * 목록·상세(소개)는 누구나 본다 — 카카오톡 공유 링크를 받은 사람이 로그인 없이 열 수 있게.
 * 개설·관리·활동 작성은 각 폴더의 layout 이 MEMBER 이상으로 막는다.
 */
export default function ClubLayout({ children }: { children: ReactNode }) {
  return <DuskShell>{children}</DuskShell>
}
