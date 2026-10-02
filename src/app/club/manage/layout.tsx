import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function ClubManageLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="MEMBER" nextOverride="/club/">
      {children}
    </ApiCodeGuard>
  )
}
