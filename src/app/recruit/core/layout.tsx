import type { Metadata } from 'next'
import RecruitCoreGate from '@/components/recruit/RecruitCoreGate'

export const metadata: Metadata = {
  title: '운영진 모집',
  description: 'GDGoC INHA 2026-2 운영진(CORE) 멤버를 모집합니다.'
}

export default function RecruitCoreLayout({ children }) {
  return <RecruitCoreGate>{children}</RecruitCoreGate>
}
