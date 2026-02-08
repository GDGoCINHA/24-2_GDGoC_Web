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

const CARD_SIZE: Record<'pc' | 'mobile', string> = {
  pc: 'w-[550px] gap-4 px-4 py-2.5 text-[16px] leading-[24px]',
  mobile: 'w-[315px] gap-3 px-4 py-2.5 text-[14px] leading-[20px]'
}

const FileIcon = ({ size }: { size: 'pc' | 'mobile' }) => (
  <Image
    src="/icons/ui/file.svg"
    alt="파일 아이콘"
    width={size === 'pc' ? 16 : 14}
    height={size === 'pc' ? 16 : 14}
    aria-hidden
  />
)

const ActionIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image src={src} alt={alt} width={20} height={20} className="object-contain" />
)

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
    action === 'remove'
      ? <ActionIcon src="/icons/ui/trash_can.svg" alt="파일 삭제" />
      : action === 'download'
        ? <ActionIcon src="/icons/ui/download.svg" alt="파일 다운로드" />
        : null

  return (
    <div
      {...rest}
      className={cn('flex items-center rounded-lg bg-gray-100 text-white', CARD_SIZE[device], className)}
    >
      <div className="flex flex-1 items-center gap-2">
        {showFileIcon && <FileIcon size={device} />}
        <div className="min-w-0">
          <p className="truncate font-medium">{fileName}</p>
          {fileSize && <p className="text-gray-700 text-sm leading-[20px]">{fileSize}</p>}
        </div>
      </div>
      {actionIcon && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md p-1.5 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
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

const BUTTON_SIZE: Record<'pc' | 'mobile', string> = {
  pc: 'h-[44px] w-[550px] text-[16px] leading-[24px]',
  mobile: 'h-[44px] w-[343px] text-[14px] leading-[20px]'
}

export function GdgUploadButton({ device = 'pc', label = '+ 파일 선택', className, ...rest }: GdgUploadButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-between rounded-lg bg-red px-4 font-medium text-white shadow-[0px_2px_50px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40',
        BUTTON_SIZE[device],
        rest.disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <span>{label}</span>
      <span className="text-white/80">파일 첨부</span>
    </button>
  )
}
