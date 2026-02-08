import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'SignUp',
  description: 'GDGoC 가입을 완료하세요'
}

export default function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {children}
    </div>
  )
}
