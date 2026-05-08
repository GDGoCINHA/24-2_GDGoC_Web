'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface NoticePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  /** 한 번에 보여줄 페이지 번호 개수. PC는 10, 모바일은 5 등 사용처에서 다르게 줄 수 있음 */
  visiblePageCount?: number
  /** 'pc' = 48px 정사각 버튼, 'mobile' = 35×38 작은 버튼 */
  device?: 'pc' | 'mobile'
}

export const NoticePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  visiblePageCount = 10,
  device = 'pc'
}: NoticePaginationProps) => {
  if (totalPages <= 1) return null

  const groupStart =
    Math.floor((currentPage - 1) / visiblePageCount) * visiblePageCount + 1
  const groupEnd = Math.min(groupStart + visiblePageCount - 1, totalPages)
  const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i)

  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  // 모바일: flex-1로 가용 폭에 균등 분배 (좁은 폰에서도 오버플로 없음)
  const buttonBase =
    device === 'mobile'
      ? 'inline-flex h-[35px] min-w-0 flex-1 items-center justify-center rounded-lg font-google-sans-flex text-[14px] leading-[20px] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
      : 'inline-flex size-12 items-center justify-center rounded-lg font-google-sans-flex text-[14px] leading-[22px] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'

  const iconSize = device === 'mobile' ? 12 : 14
  const navClass =
    device === 'mobile'
      ? 'flex w-full items-center justify-center'
      : 'flex items-center justify-center'

  return (
    <nav className={navClass} aria-label="페이지네이션">
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="첫 페이지"
      >
        <ChevronsLeft size={iconSize} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={isFirst}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={iconSize} strokeWidth={2.4} />
      </button>
      {pages.map((p) => {
        const active = currentPage === p
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              buttonBase,
              active ? 'font-bold text-white' : 'font-normal text-gray-500'
            )}
          >
            {p}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={isLast}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="다음 페이지"
      >
        <ChevronRight size={iconSize} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="마지막 페이지"
      >
        <ChevronsRight size={iconSize} strokeWidth={2.4} />
      </button>
    </nav>
  )
}
