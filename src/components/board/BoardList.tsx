'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface BoardListColumn<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
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
    return <p className="py-16 text-center text-gray-500 typo-pc-b2">{emptyMessage}</p>
  }

  return (
    // 좁은 화면에서 카드 레이아웃으로 바꿀지는 설계 문서 §11이 "구현 중 판단"으로
    // 남겨뒀다. 지금은 테이블을 유지하되, 가로 스크롤 컨테이너로 감싸 모바일에서
    // 페이지 전체가 옆으로 밀리는 것만 막는다.
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-white">
        <thead>
          <tr className="border-b border-gray-800 typo-pc-s3">
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
                'border-b border-gray-100 typo-pc-b3',
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
  )
}
