'use client'

import { cn } from '@/utils/cn'

export interface BoardPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BoardPagination({ page, totalPages, onPageChange }: BoardPaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index)

  return (
    <nav className="flex w-full items-center justify-center gap-2 py-6">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-2 py-1 text-white disabled:opacity-30"
        aria-label="이전 페이지"
      >
        이전
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onPageChange(number)}
          aria-current={number === page ? 'page' : undefined}
          className={cn(
            'flex size-8 items-center justify-center rounded-full typo-pc-b3',
            number === page ? 'bg-red text-white' : 'text-gray-500 hover:text-white'
          )}
        >
          {number + 1}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-2 py-1 text-white disabled:opacity-30"
        aria-label="다음 페이지"
      >
        다음
      </button>
    </nav>
  )
}
