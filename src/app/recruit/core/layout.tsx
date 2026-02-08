'use client'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export default function RecruitCoreLayout({ children }) {
  return (
    <ApiCodeGuard requiredRole="GUEST" nextOverride="/recruit/core">
      {children}
    </ApiCodeGuard>
  )
}
