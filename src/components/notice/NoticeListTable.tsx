'use client'

import Link from 'next/link'
import { Megaphone } from 'lucide-react'

import { NoticeCategoryBadge } from '@/components/notice/NoticeCategoryBadge'
import { NOTICE_PAGE_SIZE } from '@/constant/notice'
import type { Notice } from '@/services/notice/noticeApi'

export interface NoticeListTableProps {
  pinned: Notice[]
  items: Notice[]
  totalRegular: number
  page: number
  pageSize?: number
}

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}.${mm}.${dd}.`
}

const padNumber = (n: number): string => String(n).padStart(3, '0')

interface RowDetailsProps {
  authorName: string
  createdAt: string
  viewCount: number
}

const RowDetails = ({ authorName, createdAt, viewCount }: RowDetailsProps) => (
  <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-20 whitespace-nowrap typo-b3 text-white">
    <span>{authorName}</span>
    <span>{formatDate(createdAt)}</span>
    <span>{padNumber(viewCount)}</span>
  </div>
)

const PinnedRow = ({ notice }: { notice: Notice }) => (
  <Link
    href={`/notice/${notice.id}`}
    className="relative block h-11 w-full overflow-hidden border-b border-gray-500 bg-gray-200 transition-colors hover:bg-gray-200/80"
  >
    <Megaphone
      size={20}
      strokeWidth={1.6}
      className="absolute left-[17px] top-1/2 -translate-y-1/2 text-white"
    />
    <div className="absolute left-[70px] top-1/2 flex -translate-y-1/2 items-center gap-2">
      <NoticeCategoryBadge category={notice.category} />
      <p className="w-[623px] truncate typo-b3 text-white">{notice.title}</p>
    </div>
    <RowDetails
      authorName={notice.author.name}
      createdAt={notice.createdAt}
      viewCount={notice.viewCount}
    />
  </Link>
)

const RegularRow = ({
  notice,
  displayNumber
}: {
  notice: Notice
  displayNumber: number
}) => (
  <Link
    href={`/notice/${notice.id}`}
    className="relative block h-11 w-full overflow-hidden border-b border-gray-500 bg-black transition-colors hover:bg-white/5"
  >
    <p className="absolute left-4 top-[calc(50%-9px)] w-[30px] typo-c1 text-white">
      {padNumber(displayNumber)}
    </p>
    <div className="absolute left-[70px] top-1/2 flex -translate-y-1/2 items-center gap-2">
      <NoticeCategoryBadge category={notice.category} />
      <p className="w-[623px] truncate typo-b3 text-white">{notice.title}</p>
    </div>
    <RowDetails
      authorName={notice.author.name}
      createdAt={notice.createdAt}
      viewCount={notice.viewCount}
    />
  </Link>
)

export const NoticeListTable = ({
  pinned,
  items,
  totalRegular,
  page,
  pageSize = NOTICE_PAGE_SIZE
}: NoticeListTableProps) => {
  const empty = pinned.length + items.length === 0
  const pageStartNumber = totalRegular - (page - 1) * pageSize

  return (
    <div className="w-full">
      {/* 헤더 — 1120px 기준 절대 위치 */}
      <div className="relative h-9 w-full overflow-hidden rounded-t-lg bg-gray-200 typo-b3 text-white">
        <p className="absolute left-[15px] top-2">번호</p>
        <p className="absolute left-[436px] top-2">제목</p>
        <p className="absolute left-[826px] top-2">작성자</p>
        <p className="absolute left-[942px] top-2">작성일</p>
        <p className="absolute right-[15px] top-2">조회</p>
      </div>

      {/* 핀(상단 고정) */}
      {pinned.map((n) => (
        <PinnedRow key={n.id} notice={n} />
      ))}

      {/* 일반 게시글 — 번호 내림차순 */}
      {items.map((n, i) => (
        <RegularRow key={n.id} notice={n} displayNumber={pageStartNumber - i} />
      ))}

      {empty && (
        <p className="border-b border-gray-500 bg-black py-12 text-center typo-b3 text-gray-700">
          공지사항이 없습니다.
        </p>
      )}
    </div>
  )
}
