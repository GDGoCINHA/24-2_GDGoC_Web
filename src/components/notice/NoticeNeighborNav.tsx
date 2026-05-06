'use client'

import Link from 'next/link'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
import type { NoticeNeighborItem } from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

const formatShortDate = (iso: string): string => {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}.${mm}.${dd}.`
}

const padNumber = (n: number): string => String(n).padStart(3, '0')

interface NeighborRowProps {
  type: 'prev' | 'next'
  item: NoticeNeighborItem
  hasBorder: boolean
}

const NeighborRow = ({ type, item, hasBorder }: NeighborRowProps) => (
  <Link
    href={`/notice/${item.id}`}
    className={cn(
      'relative block h-11 w-full overflow-hidden bg-black transition-colors hover:bg-white/5',
      hasBorder && 'border-b border-gray-500'
    )}
  >
    <p className="absolute left-4 top-[calc(50%-9px)] whitespace-nowrap typo-c1 text-white">
      {type === 'next' ? '다음글' : '이전글'}
    </p>
    <div className="absolute left-[70px] top-1/2 flex -translate-y-1/2 items-center gap-2">
      <NoticeCategoryBadge category={item.category} />
      <p className="typo-b3 text-white">{item.title}</p>
    </div>
    <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-20 whitespace-nowrap typo-b3 text-white">
      <span>{item.author.name}</span>
      <span>{formatShortDate(item.createdAt)}</span>
      <span>{padNumber(item.viewCount)}</span>
    </div>
  </Link>
)

export interface NoticeNeighborNavProps {
  prev: NoticeNeighborItem | null
  next: NoticeNeighborItem | null
}

export const NoticeNeighborNav = ({ prev, next }: NoticeNeighborNavProps) => {
  if (!prev && !next) return null
  return (
    <div className="flex w-full flex-col gap-px">
      {next && <NeighborRow type="next" item={next} hasBorder={!!prev} />}
      {prev && <NeighborRow type="prev" item={prev} hasBorder={false} />}
    </div>
  )
}
