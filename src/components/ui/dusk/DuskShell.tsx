import type { ReactNode } from 'react'

import CursorGlow from '@/components/ui/common/CursorGlow'

/**
 * 어두운(dusk) 화면들이 쓰는 공통 바탕.
 *
 * 배경 그라디언트는 `position: fixed` 라서 스크롤해도 제자리에 남고 콘텐츠가 그 위를
 * 지나간다. 온보딩과 같은 계열이되 아래로 갈수록 덜 붉다 — 읽는 화면이라 바탕이
 * 튀면 안 된다.
 *
 * 안쪽 페이지는 자기 `<main>` 에 배경색을 주지 않는다. 여기서 깐 바탕을 덮어버린다.
 */
export default function DuskShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-dusk-base font-pretendard text-dusk-ink-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(178deg, #1B1622 0%, #221B28 52%, #2C2028 100%)'
        }}
      />
      <CursorGlow />
      <div className="relative z-[2]">{children}</div>
    </div>
  )
}
