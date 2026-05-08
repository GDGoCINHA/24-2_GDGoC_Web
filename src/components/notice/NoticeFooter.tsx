'use client'

import Link from 'next/link'
import { Github, Instagram, MessageCircle } from 'lucide-react'

import { GdgLogo } from '@/components/ui/design-system'

// 외부 링크 — 카카오톡 오픈채팅 URL은 추후 확정 시 교체
const SOCIAL_LINKS = {
  chat: '#',
  instagram: 'https://www.instagram.com/gdgoc.inha/',
  github: 'https://github.com/GDGoCINHA'
} as const

interface SocialIconButtonProps {
  href: string
  label: string
  children: React.ReactNode
}

const SocialIconButton = ({ href, label, children }: SocialIconButtonProps) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex size-[66px] items-center justify-center rounded-full bg-gray-100 text-white transition-opacity hover:opacity-80"
  >
    {children}
  </Link>
)

/**
 * NoticeFooter
 *
 * 공지사항 페이지 공용 푸터 (notice/layout.tsx에서 모든 notice 페이지에 적용).
 * Figma 1071:2841 — 좌측 로고+카피라이트, 우측 소셜 아이콘 3개.
 */
export const NoticeFooter = () => (
  <footer className="w-full bg-black text-white">
    <div className="mx-auto flex h-[170px] w-[1280px] items-end justify-between p-10">
      {/* 좌측: 로고 + 카피라이트 */}
      <div className="flex w-[292px] flex-col items-start gap-4">
        <Link
          href="/"
          aria-label="홈으로"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <GdgLogo mode="pc" variant="long" />
        </Link>
        <p className="font-google-sans-flex text-[12px] font-medium leading-[18px] text-white">
          Copyright ⓒ 2026 GDGoC INHA. All Rights Reserved.
        </p>
      </div>

      {/* 우측: 소셜 아이콘 3개 */}
      <div className="flex h-[66px] w-[230px] items-center gap-4">
        <SocialIconButton href={SOCIAL_LINKS.chat} label="오픈채팅">
          <MessageCircle size={32} strokeWidth={1.5} />
        </SocialIconButton>
        <SocialIconButton href={SOCIAL_LINKS.instagram} label="인스타그램">
          <Instagram size={32} strokeWidth={1.5} />
        </SocialIconButton>
        <SocialIconButton href={SOCIAL_LINKS.github} label="GitHub">
          <Github size={32} strokeWidth={1.5} />
        </SocialIconButton>
      </div>
    </div>
  </footer>
)
