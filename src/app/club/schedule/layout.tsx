import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

/**
 * 일정 등록·수정·QR 화면은 MEMBER 이상만 연다(리더 검사는 서버가 한다).
 * nextOverride 를 주지 않아 로그인 후 원래 주소(쿼리 포함)로 돌아온다.
 */
export default function ClubScheduleLayout({ children }: { children: ReactNode }) {
  // ApiCodeGuard 는 nextOverride 가 비어 있으면 현재 경로·쿼리로 돌아온다. 타입상 필수라 undefined 를 명시한다.
  return (
    <ApiCodeGuard requiredRole="MEMBER" nextOverride={undefined}>
      {children}
    </ApiCodeGuard>
  )
}
