import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import { DASHBOARD_MIN_ROLE } from '@/utils/auth/role'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole={DASHBOARD_MIN_ROLE} nextOverride="/dashboard">
      {children}
    </ApiCodeGuard>
  )
}
