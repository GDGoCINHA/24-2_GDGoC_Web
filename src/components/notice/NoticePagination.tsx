'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface NoticePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const VISIBLE_PAGE_COUNT = 10

const buttonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded text-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'

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
    <nav className="flex items-center gap-1" aria-label="페이지네이션">
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        className={buttonClass}
        aria-label="첫 페이지"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={isFirst}
        className={buttonClass}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={currentPage === p ? 'page' : undefined}
          className={cn(buttonClass, currentPage === p && 'bg-red font-bold text-white')}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={isLast}
        className={buttonClass}
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        className={buttonClass}
        aria-label="마지막 페이지"
      >
        <ChevronsRight size={16} />
      </button>
    </nav>
  )
}
