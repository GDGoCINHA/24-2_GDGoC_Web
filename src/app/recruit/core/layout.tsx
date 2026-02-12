import type { Metadata } from 'next'
import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

export const metadata: Metadata = {
  title: '운영진 모집',
  description: 'GDGoC INHA 2026-1 운영진(CORE) 멤버를 모집합니다.'
}

export default function RecruitCoreLayout({ children }) {
  return (
    <ApiCodeGuard requiredRole="GUEST" nextOverride="/recruit/core">
      {children}
    </ApiCodeGuard>
  )
}
