'use client'

import { Fragment, type ReactNode } from 'react'

import type { Notice, NoticeAttachment } from '@/services/notice/noticeApi'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i
const URL_RE = /(https?:\/\/[^\s)]+)/g

const findCoverImage = (attachments: NoticeAttachment[]): NoticeAttachment | undefined =>
  attachments.find(
    (a) => a.kind === 'file' && IMAGE_EXT_RE.test(a.name) && /^https?:\/\//.test(a.url)
  )

const linkify = (text: string): ReactNode => {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0
    if (start > lastIndex) {
      parts.push(<Fragment key={key++}>{text.slice(lastIndex, start)}</Fragment>)
    }
    parts.push(
      <a
        key={key++}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue underline"
      >
        {match[0]}
      </a>
    )
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>)
  }
  return parts
}

export interface NoticeContentProps {
  notice: Notice
}

export const NoticeContent = ({ notice }: NoticeContentProps) => {
  const cover = findCoverImage(notice.attachments)

  return (
    <div className="flex w-full flex-col gap-6 overflow-hidden rounded-2xl bg-black">
      <div className="relative aspect-[1088/440] w-full overflow-hidden rounded-lg bg-gray-100">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={cover.name}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>
      <div className="whitespace-pre-wrap break-words typo-b2 text-white">
        {linkify(notice.content)}
      </div>
    </div>
  )
}
