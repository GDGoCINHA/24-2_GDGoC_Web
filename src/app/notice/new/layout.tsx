import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

// ============================================================
// ⚠️ TEMPORARY: ApiCodeGuard 우회 — 로컬 작업용
// 백엔드 .env.local 셋업 전 공지 작성 페이지 화면 작업을 위해 임시로 비활성.
// PR/머지 전 반드시 ApiCodeGuard 래핑 복원할 것.
// 복원 시 부모 notice/layout.tsx의 BYPASS_AUTH_GUARD도 같이 false로 돌려야 함.
// ============================================================
const BYPASS_AUTH_GUARD = true

export default function NoticeNewLayout({ children }: { children: ReactNode }) {
  if (BYPASS_AUTH_GUARD) return <>{children}</>
  return (
    <ApiCodeGuard requiredRole="CORE" nextOverride="">
      {children}
    </ApiCodeGuard>
  )
}
