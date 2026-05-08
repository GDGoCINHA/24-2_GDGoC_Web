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

// ====================================================================
// PC 버전 — 1120px 기준 6컬럼 절대 좌표 테이블
// ====================================================================

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

const PinnedRowPc = ({ notice }: { notice: Notice }) => (
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

const RegularRowPc = ({
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

// ====================================================================
// 모바일 버전 — 카드형 2단 flex 레이아웃 (제목+카테고리 / 작성자+날짜 / 조회수)
// 기기 폭에 따라 제목/메타 영역이 가변, 조회수는 우측 고정
// ====================================================================

const RowMobileBody = ({ notice }: { notice: Notice }) => (
  <div className="flex h-full w-full items-center gap-2 px-2">
    {/* 좌측: 세로 스택 (제목 행 + 메타 행) — flex-1로 가변, min-w-0로 truncate 동작 */}
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      {/* 상단: 카테고리 뱃지 + 제목 */}
      <div className="flex min-w-0 items-center gap-2">
        <NoticeCategoryBadge category={notice.category} />
        <p className="min-w-0 flex-1 truncate typo-b3 text-white">{notice.title}</p>
      </div>
      {/* 하단: 작성자 + 작성일 — 카테고리 뱃지 폭만큼 좌측 들여쓰기 */}
      <div className="flex items-center gap-4 whitespace-nowrap pl-[52px] typo-c1 text-gray-700">
        <span>{notice.author.name}</span>
        <span>{formatDate(notice.createdAt)}</span>
      </div>
    </div>
    {/* 우측: 조회수 — 항상 가시, 줄어들지 않음 */}
    <span className="shrink-0 typo-c1 text-white">{padNumber(notice.viewCount)}</span>
  </div>
)

const PinnedRowMobile = ({ notice }: { notice: Notice }) => (
  <Link
    href={`/notice/${notice.id}`}
    className="relative block h-16 w-full overflow-hidden border-b border-gray-500 bg-gray-200 transition-colors hover:bg-gray-200/80"
  >
    <RowMobileBody notice={notice} />
  </Link>
)

const RegularRowMobile = ({ notice }: { notice: Notice }) => (
  <Link
    href={`/notice/${notice.id}`}
    className="relative block h-16 w-full overflow-hidden border-b border-gray-500 bg-black transition-colors hover:bg-white/5"
  >
    <RowMobileBody notice={notice} />
  </Link>
)

// ====================================================================
// Composer — PC/모바일 듀얼 렌더
// ====================================================================

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
      {/* PC 테이블 */}
      <div className="hidden w-full pc:block">
        <div className="relative h-9 w-full overflow-hidden rounded-t-lg bg-gray-200 typo-b3 text-white">
          <p className="absolute left-[15px] top-2">번호</p>
          <p className="absolute left-[436px] top-2">제목</p>
          <p className="absolute left-[826px] top-2">작성자</p>
          <p className="absolute left-[942px] top-2">작성일</p>
          <p className="absolute right-[15px] top-2">조회</p>
        </div>
        {pinned.map((n) => (
          <PinnedRowPc key={n.id} notice={n} />
        ))}
        {items.map((n, i) => (
          <RegularRowPc key={n.id} notice={n} displayNumber={pageStartNumber - i} />
        ))}
        {empty && (
          <p className="border-b border-gray-500 bg-black py-12 text-center typo-b3 text-gray-700">
            공지사항이 없습니다.
          </p>
        )}
      </div>

      {/* 모바일 카드 리스트 */}
      <div className="block w-full pc:hidden">
        {/* 헤더 바 — 제목 가운데, 조회 우측 (flex 기반) */}
        <div className="relative flex h-8 w-full items-center justify-end rounded-t-lg bg-gray-200 px-3 typo-c1 text-white">
          <p className="absolute left-1/2 -translate-x-1/2">제목</p>
          <p>조회</p>
        </div>
        {pinned.map((n) => (
          <PinnedRowMobile key={n.id} notice={n} />
        ))}
        {items.map((n) => (
          <RegularRowMobile key={n.id} notice={n} />
        ))}
        {empty && (
          <p className="border-b border-gray-500 bg-black py-12 text-center typo-b3 text-gray-700">
            공지사항이 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}
