'use client'

import Image from 'next/image'
import { type ComponentPropsWithoutRef, type MouseEventHandler } from 'react'
import { cn } from '@/utils/cn'

export type GdgFileCardAction = 'remove' | 'download' | 'none'

export interface GdgFileCardProps extends ComponentPropsWithoutRef<'div'> {
  device?: 'pc' | 'mobile'
  fileName: string
  fileSize?: string
  action?: GdgFileCardAction
  onAction?: MouseEventHandler<HTMLButtonElement>
  showFileIcon?: boolean
}

const FileIcon = ({ size }: { size: 'pc' | 'mobile' }) => (
  <Image
    src="/icons/ui/file.svg"
    alt="파일 아이콘"
    width={size === 'pc' ? 20 : 18}
    height={size === 'pc' ? 20 : 18}
    aria-hidden
    className="shrink-0"
  />
)

const ActionIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image src={src} alt={alt} width={16} height={16} className="object-contain" />
)

/**
 * GdgFileCard Component
 * Aligned with Figma design node 544:1653.
 * The file info is contained within a gray card, and the action icon is placed outside to the right.
 */
export function GdgFileCard({
  device = 'pc',
  action = 'remove',
  fileName,
  fileSize,
  onAction,
  className,
  showFileIcon = true,
  ...rest
}: GdgFileCardProps) {
  const actionIcon =
    action === 'remove' ? (
      <ActionIcon src="/icons/ui/trash_can.svg" alt="파일 삭제" />
    ) : action === 'download' ? (
      <ActionIcon src="/icons/ui/download.svg" alt="파일 다운로드" />
    ) : null

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        device === 'pc' ? 'w-[550px]' : 'w-[343px]',
        className
      )}
    >
      <div
        {...rest}
        className={cn(
          'flex flex-1 items-center rounded-lg bg-gray-100 text-white py-2.5 px-4 min-w-0',
          device === 'pc' ? 'gap-4 typo-pc-b2' : 'gap-3 typo-m-b3'
        )}
      >
        <div className="flex flex-1 items-center gap-2 overflow-hidden min-w-0">
          {showFileIcon && <FileIcon size={device} />}
          <p className="truncate font-medium">{fileName}</p>
        </div>
        {fileSize && (
          <p className={cn('text-gray-700 shrink-0 text-right', device === 'pc' ? 'typo-pc-b3' : 'typo-m-c1')}>
            {fileSize}
          </p>
        )}
      </div>
      {actionIcon && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-md p-1.5 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
          aria-label={action === 'remove' ? '파일 삭제' : '파일 다운로드'}
        >
          {actionIcon}
        </button>
      )}
    </div>
  )
}

export interface GdgUploadButtonProps extends ComponentPropsWithoutRef<'button'> {
  device?: 'pc' | 'mobile'
  label?: string
}

/**
 * GdgUploadButton Component
 * Red CTA button for file selection.
 * Aligned with Figma design node 544:1653.
 */
export function GdgUploadButton({
  device = 'pc',
  label = '+ 파일 선택',
  className,
  ...rest
}: GdgUploadButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-red px-4 font-medium text-white shadow-[0px_2px_50px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40 h-[44px]',
        device === 'pc' ? 'w-[550px] typo-pc-b2' : 'w-[343px] typo-m-b3',
        rest.disabled && 'cursor-not-allowed border-gray-400 bg-gray-400 text-gray-900',
        className
      )}
    >
      <span>{label}</span>
    </button>
  )
}
