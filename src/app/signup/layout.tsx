import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '회원가입',
  description: 'GDGoC INHA 멤버 가입을 완료하세요.'
}

export default function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {children}
    </div>
  )
}
