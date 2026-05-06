'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface NoticePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const VISIBLE_PAGE_COUNT = 10

const buttonBase =
  'inline-flex size-12 items-center justify-center rounded-lg font-google-sans-flex text-[14px] leading-[22px] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'

export const NoticePagination = ({
  currentPage,
  totalPages,
  onPageChange
}: NoticePaginationProps) => {
  if (totalPages <= 1) return null

  const groupStart =
    Math.floor((currentPage - 1) / VISIBLE_PAGE_COUNT) * VISIBLE_PAGE_COUNT + 1
  const groupEnd = Math.min(groupStart + VISIBLE_PAGE_COUNT - 1, totalPages)
  const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i)

  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  return (
    <nav className="flex items-center justify-center" aria-label="페이지네이션">
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="첫 페이지"
      >
        <ChevronsLeft size={14} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={isFirst}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={14} strokeWidth={2.4} />
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
        <ChevronRight size={14} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        className={cn(buttonBase, 'text-gray-500')}
        aria-label="마지막 페이지"
      >
        <ChevronsRight size={14} strokeWidth={2.4} />
      </button>
    </nav>
  )
}
