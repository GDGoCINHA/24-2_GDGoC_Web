'use client'

import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

export interface NoticeUploadButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 라벨 — 기본 "+ 파일 선택" */
  label?: string
}

/**
 * NoticeUploadButton
 *
 * 공지사항 도메인 전용 파일 선택 버튼.
 * GdgUploadButton에서 시각 토큰(bg-red, rounded-lg, py-2.5)만 가져오고
 * 폭 하드코딩 제거 — 항상 `w-full`. ripple 효과는 단순화.
 */
export const NoticeUploadButton = ({
  label = '+ 파일 선택',
  className,
  disabled,
  ...rest
}: NoticeUploadButtonProps) => (
  <button
    {...rest}
    type={rest.type ?? 'button'}
    disabled={disabled}
    className={cn(
      'w-full rounded-lg bg-red px-4 py-2.5 typo-b2 text-white transition-opacity hover:opacity-90',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
  >
    {label}
  </button>
)
