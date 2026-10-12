import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import DuskShell from '@/components/ui/dusk/DuskShell'

export const metadata: Metadata = {
  title: '앱 설치',
  description: 'GDGoC INHA를 홈 화면에 추가해 앱처럼 쓰세요.'
}

/**
 * `beforeinstallprompt` 는 페이지당 한 번, 로드 직후에 온다. 하이드레이션보다 먼저 올 수
 * 있어서 페이지 컴포넌트의 effect 로만 받으면 놓친다. HTML 파싱 중에 붙는 인라인
 * 스크립트로 먼저 잡아 두고, 페이지가 마운트되면 꺼내 쓴다.
 */
const CAPTURE_INSTALL_PROMPT = `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__gdgInstallPrompt=e;});`

export default function AppInstallLayout({ children }: { children: ReactNode }) {
  return (
    <DuskShell>
      <script dangerouslySetInnerHTML={{ __html: CAPTURE_INSTALL_PROMPT }} />
      {children}
    </DuskShell>
  )
}
