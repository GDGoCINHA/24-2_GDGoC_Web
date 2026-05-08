'use client'

import { NoticeFileCard } from '@/components/notice/NoticeFileCard'
import type { NoticeAttachment } from '@/services/notice/noticeApi'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i

const attachmentKind = (att: NoticeAttachment): 'file' | 'image' | 'link' => {
  if (att.kind === 'link') return 'link'
  return IMAGE_EXT_RE.test(att.name) ? 'image' : 'file'
}

export interface NoticeAttachmentListProps {
  attachments: NoticeAttachment[]
}

export const NoticeAttachmentList = ({ attachments }: NoticeAttachmentListProps) => {
  if (attachments.length === 0) return null
  // link는 항상 가장 하단에 위치하도록 정렬 (file/image는 기존 순서 유지)
  const sorted = [...attachments].sort((a, b) => {
    if (a.kind === 'link' && b.kind !== 'link') return 1
    if (a.kind !== 'link' && b.kind === 'link') return -1
    return 0
  })
  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className="typo-h5 text-white">첨부자료</h2>
      {sorted.map((att) => (
        <NoticeFileCard
          key={att.id}
          kind={attachmentKind(att)}
          fileName={att.name}
          sizeBytes={att.kind === 'file' ? att.sizeBytes : undefined}
          action={att.kind === 'file' ? 'download' : 'none'}
          downloadUrl={att.kind === 'file' ? att.url : undefined}
          linkHref={att.kind === 'link' ? att.url : undefined}
        />
      ))}
    </section>
  )
}
