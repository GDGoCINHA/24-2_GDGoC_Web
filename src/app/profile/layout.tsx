import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import DuskShell from '@/components/ui/dusk/DuskShell'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="GUEST" nextOverride="/profile">
      <DuskShell>{children}</DuskShell>
    </ApiCodeGuard>
  )
}
