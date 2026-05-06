import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'
import { NoticeHeader } from '@/components/notice/NoticeHeader'

// ============================================================
// ⚠️ TEMPORARY: ApiCodeGuard 우회 — 로컬 작업용
// 백엔드 .env.local 셋업 전 공지 페이지 화면 작업을 위해 임시로 비활성.
// PR/머지 전 반드시 ApiCodeGuard 래핑 복원할 것.
// 복원 코드:
//   <ApiCodeGuard requiredRole="MEMBER" nextOverride="/notice">{children}</ApiCodeGuard>
// ============================================================
const BYPASS_AUTH_GUARD = true

export default function NoticeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NoticeHeader />
      {BYPASS_AUTH_GUARD ? (
        children
      ) : (
        <ApiCodeGuard requiredRole="MEMBER" nextOverride="/notice">{children}</ApiCodeGuard>
      )}
    </>
  )
}
