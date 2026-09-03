import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function DashboardCoreApplicationsLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="CORE" nextOverride="/dashboard/core-applications">
      {children}
    </ApiCodeGuard>
  )
}
