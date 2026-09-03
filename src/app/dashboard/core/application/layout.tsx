import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function DashboardCoreApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="CORE" nextOverride="/dashboard/core/application">
      {children}
    </ApiCodeGuard>
  )
}
