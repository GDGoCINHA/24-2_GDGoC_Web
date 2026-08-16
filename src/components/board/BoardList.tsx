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
        {/* table-fixed 여야 열 너비가 내용에 밀리지 않는다. auto 로 두면 제목이 긴 글 하나
            때문에 기간·작성자 열까지 통째로 움직여 행마다 칸이 어긋나 보인다.
            너비를 주지 않은 열(제목)이 남은 폭을 가져간다. */}
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-white">
          <thead>
            <tr className="border-b border-gray-800 typo-pc-s3 mobile:typo-m-s3">
              {thumbnail && <th className="w-24 px-4 py-3" />}
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
                {thumbnail && <td className="w-24 px-4 py-3">{thumbnail(item)}</td>}
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
                'flex w-full gap-3 rounded-xl border border-gray-200 px-4 py-3',
                onRowClick && 'cursor-pointer active:bg-gray-100'
              )}
            >
              {thumbnail && <div className="shrink-0">{thumbnail(item)}</div>}
              <div className="min-w-0 flex-1">
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
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
