'use client'

import { cn } from '@/utils/cn'

export interface BoardPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** 한 번에 보여줄 페이지 번호 개수. */
const WINDOW = 5

/**
 * 현재 페이지를 가운데 두는 번호 창의 시작 번호.
 *
 * 끝쪽에서는 창이 모자라지 않게 뒤로 당긴다 — 마지막 페이지에서 번호가 하나만
 * 남으면 앞뒤로 옮겨다니기 어렵다. 전체가 5쪽 이하면 그냥 전부 보인다.
 */
const windowStart = (page: number, totalPages: number): number =>
  Math.max(0, Math.min(page - Math.floor(WINDOW / 2), totalPages - WINDOW))

export function BoardPagination({ page, totalPages, onPageChange }: BoardPaginationProps) {
  if (totalPages <= 1) return null

  const start = windowStart(page, totalPages)
  const pageNumbers = Array.from({ length: Math.min(WINDOW, totalPages) }, (_, i) => start + i)

  /**
   * 번호는 목록 맨 아래에 있다. 스크롤을 그대로 두면 다음 쪽의 *끝*에 떨어져서,
   * 첫 글을 보려면 화면을 통째로 되감아야 한다. 글이 12개씩 실리는 좁은 화면에서
   * 특히 성가시다.
   */
  const goTo = (next: number): void => {
    onPageChange(next)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="flex w-full flex-wrap items-center justify-center gap-2 py-6">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page === 0}
        className="px-2.5 py-1.5 text-sm text-dusk-ink-100 transition-opacity disabled:cursor-default disabled:opacity-30"
        aria-label="이전 페이지"
      >
        이전
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => goTo(number)}
          aria-current={number === page ? 'page' : undefined}
          // 손가락으로 누르는 화면에서는 32px 이 좁다. 표를 쓰는 PC 만 작게 둔다.
          className={cn(
            'flex items-center justify-center rounded-full text-sm transition-colors mobile:size-10 pc:size-8',
            number === page
              ? 'bg-ember text-ember-ink'
              : 'text-dusk-ink-700 hover:text-dusk-ink-100'
          )}
        >
          {number + 1}
        </button>
      ))}
      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-2.5 py-1.5 text-sm text-dusk-ink-100 transition-opacity disabled:cursor-default disabled:opacity-30"
        aria-label="다음 페이지"
      >
        다음
      </button>
    </nav>
  )
}
