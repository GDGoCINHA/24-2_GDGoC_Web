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
   */
  primary?: boolean
}

export interface BoardListProps<T> {
  items: T[]
  columns: BoardListColumn<T>[]
  getRowKey: (item: T) => string | number
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function BoardList<T>({
  items,
  columns,
  getRowKey,
  onRowClick,
  emptyMessage = '등록된 글이 없습니다.'
}: BoardListProps<T>) {
  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-gray-500 typo-pc-b2 mobile:typo-m-b2">{emptyMessage}</p>
    )
  }

  const primaryColumn = columns.find((column) => column.primary) ?? columns[0]
  const metaColumns = columns.filter((column) => column !== primaryColumn)

  return (
    <>
      {/* PC: 표 */}
      <div className="hidden w-full overflow-x-auto pc:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-white">
          <thead>
            <tr className="border-b border-gray-800 typo-pc-s3 mobile:typo-m-s3">
              {columns.map((column) => (
                <th key={column.key} className={cn('px-4 py-3', column.className)}>
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
                  'border-b border-gray-100 typo-pc-b3 mobile:typo-m-b3',
                  onRowClick && 'cursor-pointer hover:bg-gray-100'
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3', column.className)}>
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
                'w-full rounded-xl border border-gray-200 px-4 py-3',
                onRowClick && 'cursor-pointer active:bg-gray-100'
              )}
            >
              <p className="text-white typo-m-s3">{primaryColumn.render(item)}</p>
              <dl className="mt-2 flex flex-col gap-1 typo-m-c1">
                {metaColumns.map((column) => (
                  <div key={column.key} className="flex items-start gap-2">
                    <dt className="w-14 shrink-0 text-gray-600">{column.header}</dt>
                    <dd className="min-w-0 flex-1 text-gray-800">{column.render(item)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
