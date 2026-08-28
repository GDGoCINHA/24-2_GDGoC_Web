import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import DuskShell from '@/components/ui/dusk/DuskShell'

export const metadata: Metadata = {
  title: '로그인',
  description: 'GDGoC INHA 계정으로 로그인하세요.'
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <DuskShell>{children}</DuskShell>
}
