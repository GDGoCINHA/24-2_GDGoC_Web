'use client'

import Link from 'next/link'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
import { NoticeStatusBadge } from '@/components/notice/NoticeStatusBadge'
import type { Notice } from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

export interface NoticeListTableProps {
  pinned: Notice[]
  items: Notice[]
}

const COLS = 'grid-cols-[60px_80px_1fr_120px_100px_60px]'

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}.${mm}.${dd}.`
}

const NoticeRow = ({ notice, pinned }: { notice: Notice; pinned: boolean }) => (
  <Link
    href={`/notice/${notice.id}`}
    className={cn(
      'grid items-center gap-4 border-b border-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/5',
      COLS,
      pinned && 'bg-white/[0.04]'
    )}
  >
    <div>{pinned ? <NoticeStatusBadge status="PUBLISHED" /> : <span className="text-gray-500">—</span>}</div>
    <div>
      <NoticeCategoryBadge category={notice.category} fill="on" />
    </div>
    <div className="truncate text-white">{notice.title}</div>
    <div className="truncate text-gray-300">{notice.author.name}</div>
    <div className="text-gray-300">{formatDate(notice.createdAt)}</div>
    <div className="text-gray-300">{notice.viewCount}</div>
  </Link>
)

export const NoticeListTable = ({ pinned, items }: NoticeListTableProps) => {
  const empty = pinned.length + items.length === 0

  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div
        className={cn(
          'grid gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-gray-400',
          COLS
        )}
      >
        <div>구분</div>
        <div>분류</div>
        <div>제목</div>
        <div>작성자</div>
        <div>작성일</div>
        <div>조회</div>
      </div>
      {pinned.map((n) => (
        <NoticeRow key={n.id} notice={n} pinned />
      ))}
      {items.map((n) => (
        <NoticeRow key={n.id} notice={n} pinned={false} />
      ))}
      {empty && <p className="py-12 text-center text-sm text-gray-400">공지사항이 없습니다.</p>}
    </div>
  )
}
