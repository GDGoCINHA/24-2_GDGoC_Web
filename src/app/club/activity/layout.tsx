import type { ReactNode } from 'react'

import ApiCodeGuard from '@/components/auth/ApiCodeGuard'

/**
 * 활동 기록 상세·작성은 MEMBER 이상만 연다.
 * nextOverride 를 주지 않아 로그인 후 원래 주소로 돌아온다 — 카카오톡으로 받은 기록 링크가 목록으로 새지 않게.
 */
export default function ClubActivityLayout({ children }: { children: ReactNode }) {
  // ApiCodeGuard 는 nextOverride 가 비어 있으면 현재 경로·쿼리로 돌아온다. 타입상 필수라 undefined 를 명시한다.
  return (
    <ApiCodeGuard requiredRole="MEMBER" nextOverride={undefined}>
      {children}
    </ApiCodeGuard>
  )
}
