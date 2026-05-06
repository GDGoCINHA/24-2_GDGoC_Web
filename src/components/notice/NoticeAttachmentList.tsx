'use client'

import { Download, FileText, Image as ImageIcon, Link2 } from 'lucide-react'

import type { NoticeAttachment } from '@/services/notice/noticeApi'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0.00mb'
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)}mb`
}

const isImageAttachment = (att: NoticeAttachment): boolean =>
  att.kind === 'file' && IMAGE_EXT_RE.test(att.name)

const AttachmentIcon = ({ att }: { att: NoticeAttachment }) => {
  if (att.kind === 'link') return <Link2 size={16} strokeWidth={2} className="text-white" />
  if (isImageAttachment(att))
    return <ImageIcon size={16} strokeWidth={2} className="text-white" />
  return <FileText size={16} strokeWidth={2} className="text-white" />
}

const AttachmentRow = ({ att }: { att: NoticeAttachment }) => {
  const showSize = att.kind === 'file'
  return (
    <div className="flex w-full items-center gap-2">
      <div className="flex flex-1 items-center gap-4 rounded-lg bg-gray-100 px-4 py-2.5">
        <div className="flex flex-1 items-center gap-2">
          <AttachmentIcon att={att} />
          <p className="flex-1 typo-b2 text-white">{att.name}</p>
        </div>
        {showSize && (
          <p className="typo-b2 text-right text-gray-700">
            {formatFileSize(att.sizeBytes)}
          </p>
        )}
      </div>
      {showSize && (
        <a
          href={att.url}
          download
          aria-label={`${att.name} 다운로드`}
          className="text-white transition-opacity hover:opacity-70"
        >
          <Download size={20} strokeWidth={2} />
        </a>
      )}
    </div>
  )
}

export interface NoticeAttachmentListProps {
  attachments: NoticeAttachment[]
}

export const NoticeAttachmentList = ({ attachments }: NoticeAttachmentListProps) => {
  if (attachments.length === 0) return null
  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className="typo-h5 text-white">첨부자료</h2>
      {attachments.map((att) => (
        <AttachmentRow key={att.id} att={att} />
      ))}
    </section>
  )
}
