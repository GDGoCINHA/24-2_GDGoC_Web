'use client'

import Link from 'next/link'
import { Github, Instagram, MessageCircle } from 'lucide-react'

import { GdgLogo } from '@/components/ui/design-system'

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
    className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-white transition-opacity hover:opacity-80 pc:size-[66px]"
  >
    {children}
  </Link>
)

/**
 * NoticeFooter
 *
 * 공지사항 페이지 공용 푸터 (notice/layout.tsx에서 모든 notice 페이지에 적용).
 * - PC (Figma 1071:2841 footer): 가로 정렬, 1280×170, 좌측 로고+카피라이트 / 우측 소셜 아이콘
 * - 모바일 (Figma 1082:3728): 세로 스택, w-full, 로고+카피라이트 위 / 소셜 아이콘 우측 하단
 */
export const NoticeFooter = () => (
  <footer className="w-full bg-black text-white">
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-6 pc:h-[170px] pc:flex-row pc:items-end pc:justify-between pc:gap-0 pc:p-10">
      {/* 좌측: 로고 + 카피라이트 */}
      <div className="flex flex-col items-start gap-2 pc:w-[292px] pc:gap-4">
        <Link
          href="/"
          aria-label="홈으로"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <GdgLogo mode="auto" variant="long" />
        </Link>
        <p className="font-google-sans-flex text-[11px] font-medium leading-[14px] text-white pc:text-[12px] pc:leading-[18px]">
          Copyright ⓒ 2026 GDGoC INHA. All Rights Reserved.
        </p>
      </div>

      {/* 우측: 소셜 아이콘 — 모바일은 우측 정렬, PC는 자연 정렬 */}
      <div className="flex w-full items-center justify-end gap-4 pc:h-[66px] pc:w-[230px] pc:justify-start">
        <SocialIconButton href={SOCIAL_LINKS.chat} label="오픈채팅">
          <MessageCircle className="size-5 pc:size-8" strokeWidth={1.5} />
        </SocialIconButton>
        <SocialIconButton href={SOCIAL_LINKS.instagram} label="인스타그램">
          <Instagram className="size-5 pc:size-8" strokeWidth={1.5} />
        </SocialIconButton>
        <SocialIconButton href={SOCIAL_LINKS.github} label="GitHub">
          <Github className="size-5 pc:size-8" strokeWidth={1.5} />
        </SocialIconButton>
      </div>
    </div>
  </footer>
)
