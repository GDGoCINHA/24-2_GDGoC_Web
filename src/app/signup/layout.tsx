import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import DuskShell from '@/components/ui/dusk/DuskShell'

export const metadata: Metadata = {
  title: '회원가입',
  description: 'GDGoC INHA 멤버 가입을 완료하세요.'
}

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <DuskShell>{children}</DuskShell>
}
