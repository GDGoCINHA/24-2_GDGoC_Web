import type { AttachmentResponse } from '@/types/board'

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export interface AttachmentListProps {
  attachments: AttachmentResponse[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <ul className="flex w-full flex-col gap-2">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          {attachment.kind === 'FILE' ? (
            <a
              href={attachment.fileUrl ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-white typo-pc-b3 transition-colors hover:bg-gray-400"
            >
              <span className="flex-1 truncate">{attachment.fileName}</span>
              {attachment.fileSize !== null && (
                <span className="shrink-0 text-gray-700">
                  {formatFileSize(attachment.fileSize)}
                </span>
              )}
            </a>
          ) : (
            <a
              href={attachment.url ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-blue underline typo-pc-b3 transition-colors hover:bg-gray-400"
            >
              {attachment.url}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}
