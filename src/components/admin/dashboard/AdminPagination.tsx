'use client'

import { useMemo } from 'react'

import { ADMIN_CONTAINER } from './adminStyles'

const MAX_VISIBLE = 7

/** 표 화면 네 곳이 같은 페이지네이션을 쓴다. 페이지가 하나뿐이면 아무것도 그리지 않는다. */
export default function AdminPagination({
  page,
  totalPages,
  onChange
}: {
  page: number
  totalPages: number
  onChange: (next: number) => void
}) {
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const start = Math.max(1, page - Math.floor(MAX_VISIBLE / 2))
    const end = Math.min(totalPages, start + MAX_VISIBLE - 1)
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [page, totalPages])

  if (totalPages <= 1) return null

  return (
    <section
      className={`${ADMIN_CONTAINER} flex flex-wrap items-center justify-between gap-4 pt-5`}
    >
      <span className="text-[13px] text-admin-ink-dim">
        페이지 {page} / {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          className="whitespace-nowrap rounded-full border border-admin-line px-[18px] py-2.5 text-[14px] text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>
        {pageNumbers.map((p) =>
          p === page ? (
            <span
              key={p}
              aria-current="page"
              className="min-w-[38px] rounded-full bg-admin-accent py-2.5 text-center text-[14px] tabular-nums text-admin-accent-ink"
            >
              {p}
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className="min-w-[38px] rounded-full border border-admin-line py-2.5 text-[14px] tabular-nums text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink"
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className="whitespace-nowrap rounded-full border border-admin-line px-[18px] py-2.5 text-[14px] text-admin-ink-muted transition-colors duration-200 hover:border-admin-accent hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </section>
  )
}
