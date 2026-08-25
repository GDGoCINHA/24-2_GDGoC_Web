'use client'

import type { ReactNode } from 'react'

/**
 * 순서를 바꾸고 지울 수 있는 목록 항목의 껍데기.
 *
 * 사진 띠·활동·해커톤·FAQ 가 같은 조작을 갖는다. 위/아래 버튼으로 옮긴다 — 드래그는
 * 모바일에서 스크롤과 부딪히고, 항목이 열 개 남짓이라 버튼으로 충분하다.
 */
export interface ListRowProps {
  index: number
  total: number
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  /** 순번 배지를 띄운다. 활동처럼 번호가 화면에 나오는 목록에서만 켠다. */
  showNumber?: boolean
  children: ReactNode
}

const ICON_BUTTON =
  'flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(240,234,228,0.20)] text-sm text-dusk-ink-500 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100 disabled:opacity-30 disabled:hover:border-[rgba(240,234,228,0.20)] disabled:hover:text-dusk-ink-500'

export function ListRow({
  index,
  total,
  onMove,
  onRemove,
  showNumber = false,
  children
}: ListRowProps) {
  return (
    <article className="flex flex-col gap-4 rounded-[14px] border border-[rgba(240,234,228,0.12)] bg-[rgba(240,234,228,0.04)] p-5">
      <div className="flex items-center justify-between gap-3">
        {showNumber ? (
          <span className="text-sm font-medium text-ember">
            {String(index + 1).padStart(2, '0')}
          </span>
        ) : (
          <span className="text-sm text-dusk-ink-800">{index + 1}번째</span>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="위로"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className={ICON_BUTTON}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="아래로"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
            className={ICON_BUTTON}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="whitespace-nowrap rounded-full border border-[rgba(196,88,74,0.5)] px-3.5 py-1.5 text-[13px] text-signal-err transition-colors hover:bg-[rgba(196,88,74,0.12)]"
          >
            삭제
          </button>
        </div>
      </div>

      {children}
    </article>
  )
}

/** 목록에서 한 항목을 다른 자리로 옮긴 새 배열. 범위를 벗어나면 원본을 그대로 준다. */
export const moveItem = <T,>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) return items
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
