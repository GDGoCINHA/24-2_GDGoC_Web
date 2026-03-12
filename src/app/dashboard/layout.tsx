import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ApiCodeGuard requiredRole="CORE" nextOverride="/dashboard">
      {children}
    </ApiCodeGuard>
  )
}
