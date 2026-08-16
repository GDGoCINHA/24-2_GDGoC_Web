import type { AttachmentResponse } from '@/types/board'

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * 서버 PR #336(feature/board-common) 머지 전까지 dev-api 의 첨부 응답은
 * {id, fileUrl, fileName} 3필드뿐이라 kind 가 오지 않는다. kind 를 그대로 비교하면
 * 파일 첨부가 전부 링크 분기로 떨어져 빈 <a> 가 된다.
 * 구계약에는 링크 첨부 자체가 없으므로, kind 가 없으면 파일로 본다.
 */
const isFileAttachment = (attachment: AttachmentResponse): boolean =>
  attachment.kind ? attachment.kind === 'FILE' : Boolean(attachment.fileUrl ?? attachment.fileName)

export interface AttachmentListProps {
  attachments: AttachmentResponse[]
}

/**
 * 첨부는 이미지여도 미리보기로 펼치지 않는다. 본문에 넣을 이미지는 본문의 이미지 문법으로
 * 넣고, 여기는 내려받을 것들의 목록으로만 둔다 — 전에는 이미지 첨부가 본문 아래에 크게
 * 펼쳐져 본문의 일부처럼 보였다.
 */
export function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <ul className="flex w-full flex-col gap-2">
      {attachments.map((attachment) => {
        const isFile = isFileAttachment(attachment)
        const href = (isFile ? attachment.fileUrl : attachment.url) ?? null

        if (isFile) {
          return (
            <li key={attachment.id}>
              <a
                href={href ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-white typo-pc-b3 mobile:typo-m-b3 transition-colors hover:bg-gray-400"
              >
                <span className="flex-1 truncate">{attachment.fileName}</span>
                {attachment.fileSize !== null && attachment.fileSize !== undefined && (
                  <span className="shrink-0 text-gray-700">
                    {formatFileSize(attachment.fileSize)}
                  </span>
                )}
              </a>
            </li>
          )
        }

        return (
          <li key={attachment.id}>
            <a
              href={href ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-blue underline typo-pc-b3 mobile:typo-m-b3 transition-colors hover:bg-gray-400"
            >
              {attachment.url}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
