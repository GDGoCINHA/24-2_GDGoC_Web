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

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|svg|avif)$/i

/**
 * 확장자로만 이미지를 가린다.
 *
 * URL 이면 경로만 본다 — presigned URL 은 ?X-Amz-... 가 붙어 확장자가 끝에 오지 않는다.
 * URL 이 아니면(파일명) 그대로 본다.
 *
 * 확장자 없는 CDN 링크는 이미지여도 링크로 남는다. 일단 <img> 로 그려보고 실패하면
 * 되돌리는 방법이 더 많이 잡지만, 일반 웹페이지 링크가 한 프레임 깨진 이미지로
 * 보였다가 바뀐다. 놓치는 쪽을 택했다.
 */
const hasImageExtension = (value: string | null | undefined): boolean => {
  if (!value) return false

  let path = value
  try {
    path = new URL(value).pathname
  } catch {
    // URL 이 아니다. 파일명으로 보고 그대로 검사한다.
  }
  return IMAGE_EXTENSION.test(path)
}

export interface AttachmentListProps {
  attachments: AttachmentResponse[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <ul className="flex w-full flex-col gap-2">
      {attachments.map((attachment) => {
        const isFile = isFileAttachment(attachment)
        const href = (isFile ? attachment.fileUrl : attachment.url) ?? null
        // 파일은 원본 파일명이 확장자를 갖고 있다. 링크는 주소 자체를 본다.
        const imageSource =
          href && hasImageExtension(isFile ? (attachment.fileName ?? href) : href) ? href : null

        if (imageSource) {
          return (
            <li key={attachment.id}>
              {/* 원본을 새 탭에서 열 수 있게 감싼다. 미리보기는 max-h 로 잘라 본문을 밀지 않는다. */}
              <a href={imageSource} target="_blank" rel="noreferrer" className="block">
                {/* next/image 는 못 쓴다 — 임의의 외부 호스트라 remotePatterns 에 적을 수 없다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSource}
                  alt={attachment.fileName ?? '첨부 이미지'}
                  loading="lazy"
                  className="max-h-96 w-auto max-w-full rounded-lg"
                />
              </a>
            </li>
          )
        }

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
