import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function DashboardCoreApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="LEAD" nextOverride="/dashboard/core/application">
      {children}
    </ApiCodeGuard>
  )
}
