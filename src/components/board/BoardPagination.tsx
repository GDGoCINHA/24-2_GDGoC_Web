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
    // 페이지 번호를 전부 그린다. 줄바꿈을 막으면 페이지가 늘어날수록 가로로 넘친다.
    // 글이 쌓여 번호가 너무 많아지면 현재 페이지 주변만 보여주는 방식으로 좁혀야 한다.
    <nav className="flex w-full flex-wrap items-center justify-center gap-2 py-6">
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
            'flex size-8 items-center justify-center rounded-full typo-pc-b3 mobile:typo-m-b3',
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
