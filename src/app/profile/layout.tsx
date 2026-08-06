import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="GUEST" nextOverride="/profile">
      {children}
    </ApiCodeGuard>
  )
}
