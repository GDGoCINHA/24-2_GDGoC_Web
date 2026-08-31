import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { LandingContentProvider } from '@/components/landing/LandingContentProvider'
import DuskShell from '@/components/ui/dusk/DuskShell'

export const metadata: Metadata = {
  title: '로그인',
  description: 'GDGoC INHA 계정으로 로그인하세요.'
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <DuskShell>
      {/*
        좌측 사진은 온보딩 히어로와 같은 것을 쓴다. 상수를 직접 읽으면 관리자가 온보딩
        사진을 바꿨을 때 로그인만 옛 사진으로 남는다. 조회가 실패해도 provider 가
        기본값을 그대로 두므로 로그인 자체는 막히지 않는다.
      */}
      <LandingContentProvider>{children}</LandingContentProvider>
    </DuskShell>
  )
}
