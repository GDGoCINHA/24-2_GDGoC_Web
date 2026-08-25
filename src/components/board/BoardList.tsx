'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface BoardListColumn<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  /**
   * 모바일 카드에서 제목 자리에 크게 나올 열. 지정하지 않으면 첫 열을 쓴다.
   * 게시판마다 첫 열이 제목이 아니다 — 공지는 첫 열이 분류 태그다.
   * PC 표에서도 이 열만 글씨가 크고 밝다.
   */
  primary?: boolean
}

export interface BoardListProps<T> {
  items: T[]
  columns: BoardListColumn<T>[]
  getRowKey: (item: T) => string | number
  onRowClick?: (item: T) => void
  emptyMessage?: string
  /**
   * 행 맨 앞에 붙일 그림. 열로 넣으면 모바일 카드에서 "썸네일" 이라는 라벨과 함께
   * 값처럼 나열되므로 자리를 따로 준다. 넘기지 않으면 그림 칸 자체가 없다 —
   * 공지·자유게시판은 이 prop 을 쓰지 않는다.
   */
  thumbnail?: (item: T) => ReactNode
}

export function BoardList<T>({
  items,
  columns,
  getRowKey,
  onRowClick,
  emptyMessage = '등록된 글이 없습니다.',
  thumbnail
}: BoardListProps<T>) {
  if (items.length === 0) {
    return <p className="py-16 text-center text-[15px] text-dusk-ink-800">{emptyMessage}</p>
  }

  const primaryColumn = columns.find((column) => column.primary) ?? columns[0]
  const metaColumns = columns.filter((column) => column !== primaryColumn)

  return (
    <>
      {/* PC: 표 */}
      <div className="hidden w-full overflow-x-auto pc:block">
        {/* table-fixed 여야 열 너비가 내용에 밀리지 않는다. auto 로 두면 제목이 긴 글 하나
            때문에 기간·작성자 열까지 통째로 움직여 행마다 칸이 어긋나 보인다.
            너비를 주지 않은 열(제목)이 남은 폭을 가져간다. */}
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-b-dusk-line text-[13px] text-dusk-ink-700">
              {thumbnail && <th className="w-24 px-4 py-[18px]" />}
              {columns.map((column) => (
                <th key={column.key} className={cn('px-4 py-[18px] font-normal', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-b-[rgba(240,234,228,0.08)] transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[rgba(240,234,228,0.04)]'
                )}
              >
                {thumbnail && <td className="w-24 px-4 py-[18px]">{thumbnail(item)}</td>}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-[18px]',
                      column === primaryColumn
                        ? 'text-base text-dusk-ink-100'
                        : 'text-sm text-dusk-ink-600',
                      column.className
                    )}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드.
          표를 가로 스크롤 컨테이너에 넣어두면 640px 최소폭 때문에 열이 화면 밖으로
          밀리고, 옆으로 밀 때 머리글과 값이 어긋나 보인다. 좁은 화면에서는 한 행을
          카드 하나로 세워서 가로 스크롤 자체를 없앤다. */}
      <ul className="flex w-full flex-col gap-3 pc:hidden">
        {items.map((item) => (
          <li key={getRowKey(item)}>
            <div
              onClick={() => onRowClick?.(item)}
              className={cn(
                'flex w-full gap-3 rounded-lg border border-dusk-line px-4 py-3.5 transition-colors',
                onRowClick && 'cursor-pointer active:bg-[rgba(240,234,228,0.04)]'
              )}
            >
              {thumbnail && <div className="shrink-0">{thumbnail(item)}</div>}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-dusk-ink-100">{primaryColumn.render(item)}</p>
                <dl className="mt-2 flex flex-col gap-1 text-[13px]">
                  {metaColumns.map((column) => (
                    <div key={column.key} className="flex items-start gap-2">
                      <dt className="w-14 shrink-0 text-dusk-ink-800">{column.header}</dt>
                      <dd className="min-w-0 flex-1 text-dusk-ink-600">{column.render(item)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
