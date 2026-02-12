import { type ReactNode } from 'react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '멤버 모집',
  description: 'GDGoC INHA 2026-1 신입 멤버를 모집합니다.'
}

export default function RecruitMemberLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
