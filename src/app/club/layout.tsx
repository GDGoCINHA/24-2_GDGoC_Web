import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import DuskShell from '@/components/ui/dusk/DuskShell'

/** 소모임은 부원(MEMBER 이상)만 쓴다. GUEST 는 참여할 수 없다. */
export default function ClubLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="MEMBER" nextOverride="/club/">
      <DuskShell>{children}</DuskShell>
    </ApiCodeGuard>
  )
}
