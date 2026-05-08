'use client'

import { Download, FileText, Image as ImageIcon, Link2, Trash2 } from 'lucide-react'

import { cn } from '@/utils/cn'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i

export type NoticeFileCardKind = 'file' | 'image' | 'link'
export type NoticeFileCardAction = 'remove' | 'download' | 'none'

export interface NoticeFileCardProps {
  /** 파일 종류 — 아이콘 분기에 사용 */
  kind?: NoticeFileCardKind
  /** 자동 추론을 원할 경우 fileName 확장자로 판단. kind가 명시되면 그게 우선 */
  fileName: string
  /** 바이트 단위 파일 크기 — link면 표시 안 함 */
  sizeBytes?: number
  /** 우측 액션 버튼 종류 */
  action?: NoticeFileCardAction
  /** action='remove' 시 호출되는 콜백 */
  onRemove?: () => void
  /** action='download' 시 다운로드 대상 URL */
  downloadUrl?: string
  /** kind='link'일 때 카드 전체를 클릭하면 이동할 URL. 새 탭으로 열림 */
  linkHref?: string
  className?: string
}

/**
 * NoticeFileCard
 *
 * 공지사항 도메인 전용 첨부 카드.
 * GdgFileCard에서 시각 토큰(bg-gray-100, rounded-lg, px-4 py-2.5 등)만 가져오고,
 * 아이콘은 file/image/link 분기 추가. 다운로드는 <a download>, 삭제는 <button>으로 분리.
 */
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0.00mb'
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)}mb`
}

const inferKind = (fileName: string, explicit?: NoticeFileCardKind): NoticeFileCardKind => {
  if (explicit) return explicit
  if (/^https?:\/\//i.test(fileName)) return 'link'
  if (IMAGE_EXT_RE.test(fileName)) return 'image'
  return 'file'
}

const Icon = ({ kind }: { kind: NoticeFileCardKind }) => {
  // size-4(16px) PC / size-3.5(14px) 모바일
  const className = 'size-4 shrink-0 text-white mobile:size-3.5'
  if (kind === 'link') return <Link2 strokeWidth={2} className={className} />
  if (kind === 'image') return <ImageIcon strokeWidth={2} className={className} />
  return <FileText strokeWidth={2} className={className} />
}

export const NoticeFileCard = ({
  kind: kindProp,
  fileName,
  sizeBytes,
  action = 'remove',
  onRemove,
  downloadUrl,
  linkHref,
  className
}: NoticeFileCardProps) => {
  const kind = inferKind(fileName, kindProp)
  const showSize = kind !== 'link'
  const isClickableLink = kind === 'link' && Boolean(linkHref)

  // 카드 내부 콘텐츠 (아이콘 + 파일명 + 크기)
  const cardInner = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Icon kind={kind} />
        <p className="flex-1 truncate typo-pc-b2 text-white mobile:typo-m-b3">{fileName}</p>
      </div>
      {showSize && (
        <p className="whitespace-nowrap text-right typo-pc-b2 text-gray-700 mobile:typo-m-b3">
          {formatFileSize(sizeBytes)}
        </p>
      )}
    </>
  )

  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      {isClickableLink ? (
        // link 카드: 전체가 anchor — 새 탭으로 이동
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-4 rounded-lg bg-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-200"
        >
          {cardInner}
        </a>
      ) : (
        <div className="flex flex-1 items-center gap-4 rounded-lg bg-gray-100 px-4 py-2.5">
          {cardInner}
        </div>
      )}

      {action === 'remove' && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${fileName} 삭제`}
          className="text-white transition-opacity hover:opacity-70"
        >
          <Trash2 size={20} strokeWidth={2} />
        </button>
      )}
      {action === 'download' && downloadUrl && (
        <a
          href={downloadUrl}
          download
          aria-label={`${fileName} 다운로드`}
          className="text-white transition-opacity hover:opacity-70"
        >
          <Download size={20} strokeWidth={2} />
        </a>
      )}
    </div>
  )
}
