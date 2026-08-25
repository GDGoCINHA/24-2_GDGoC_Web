'use client'

import { useLandingContent } from '@/components/landing/LandingContentProvider'

const LINK_CLASS = 'text-dusk-ink-800 transition-colors hover:text-dusk-ink-100'

export default function LandingFooter() {
  const { contact } = useLandingContent()

  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-t-dusk-line-soft px-[clamp(20px,5vw,44px)] py-10 text-[13px] text-dusk-ink-800">
      <span>GDGoC INHA · 인하대학교</span>
      <div className="flex gap-[22px]">
        <a href="/board/events/" className={LINK_CLASS}>
          게시판
        </a>
        <a href={`mailto:${contact.email}`} className={LINK_CLASS}>
          {contact.email}
        </a>
        <a href={contact.openChatUrl} target="_blank" rel="noreferrer" className={LINK_CLASS}>
          오픈채팅
        </a>
      </div>
    </footer>
  )
}
