'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pencil } from 'lucide-react'

import { NoticeCategoryFilter } from '@/components/notice/NoticeCategoryFilter'
import { NoticeListTable } from '@/components/notice/NoticeListTable'
import { NoticePagination } from '@/components/notice/NoticePagination'
import { NoticeSearchBar } from '@/components/notice/NoticeSearchBar'
import { useAuth } from '@/hooks/useAuth'
import {
  NOTICE_CATEGORIES,
  NOTICE_SEARCH_FIELDS,
  type NoticeCategory,
  type NoticeSearchField
} from '@/services/notice/noticeApi'
import { useNoticeList } from '@/services/notice/useNoticeList'

const CORE_PLUS_ROLES = new Set(['CORE', 'LEAD', 'ORGANIZER', 'ADMIN'])

const parseCategory = (raw: string | null): NoticeCategory | undefined => {
  if (!raw) return undefined
  return (NOTICE_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as NoticeCategory)
    : undefined
}

const parseSearchField = (raw: string | null): NoticeSearchField | undefined => {
  if (!raw) return undefined
  return (NOTICE_SEARCH_FIELDS as readonly string[]).includes(raw)
    ? (raw as NoticeSearchField)
    : undefined
}

const parsePage = (raw: string | null): number => {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

function NoticeListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const category = parseCategory(searchParams.get('category'))
  const query = searchParams.get('query') ?? undefined
  const searchField = parseSearchField(searchParams.get('field'))
  const page = parsePage(searchParams.get('page'))

  const { data, loading, error } = useNoticeList({
    category,
    query,
    searchField,
    page
  })

  // TEMP(관리자 플로우 확인용): 백엔드 .env 셋업 전 화면 확인을 위해 true 하드코딩.
  // PR/머지 전 반드시 아래 줄 복원할 것.
  // const isCorePlus = !!user?.userRole && CORE_PLUS_ROLES.has(user.userRole)
  const isCorePlus = true

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') params.delete(key)
      else params.set(key, value)
    })
    const qs = params.toString()
    router.push(`/notice${qs ? `?${qs}` : ''}`)
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const totalCount = data ? data.pinned.length + data.total : 0

  const handleSearchSubmit = (q: string, f: NoticeSearchField) => {
    updateQuery({ query: q || undefined, field: f, page: undefined })
  }

  const handlePageChange = (p: number) =>
    updateQuery({ page: p === 1 ? undefined : String(p) })

  return (
    <main className="overflow-x-clip bg-black text-white">
      <div className="mx-auto flex w-full flex-col items-center gap-8 px-4 pt-6 pb-6 pc:w-[1280px] pc:gap-16 pc:px-[80px] pc:pt-[56px] pc:pb-[120px]">
        <div className="flex w-full flex-col gap-4 pc:gap-6">
          {/* 타이틀 */}
          <div className="flex flex-col gap-2 pc:gap-4">
            <div className="flex flex-col gap-1 text-white pc:gap-2">
              <h1 className="typo-pc-h4 mobile:typo-m-h2">공지사항</h1>
              <p className="typo-b3">GDGoC INHA의 소식을 빠르게 확인하세요.</p>
            </div>

            {/* 카테고리 필터 + 글쓰기 버튼 — 글쓰기는 PC에서만 노출 (모바일은 햄버거에 통합 예정) */}
            <div className="flex w-full items-center justify-between gap-4">
              <NoticeCategoryFilter
                value={category}
                onChange={(c) => updateQuery({ category: c, page: undefined })}
              />
              {isCorePlus && (
                <Link
                  href="/notice/new"
                  className="hidden items-center gap-1 rounded-full bg-red px-4 py-2 typo-b3 text-white transition-opacity hover:opacity-90 pc:inline-flex"
                >
                  <Pencil size={14} strokeWidth={2.4} />
                  글쓰기
                </Link>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="flex w-full flex-col gap-4">
            {/* 상단 검색 — PC는 "총 N개" 표시 + 검색바, 모바일은 검색바만 풀폭 */}
            <div className="flex w-full items-end justify-between">
              <p className="hidden whitespace-nowrap typo-b3 text-white pc:block">
                총 <span className="font-bold">{totalCount}개</span>
              </p>
              <NoticeSearchBar
                initialQuery={query}
                initialField={searchField}
                onSubmit={handleSearchSubmit}
              />
            </div>

            {/* 결과 영역 */}
            {loading && (
              <p className="py-12 text-center typo-b3 text-gray-700">불러오는 중...</p>
            )}
            {error && (
              <p className="py-12 text-center typo-b3 text-red">{error.message}</p>
            )}
            {data && !loading && (
              <NoticeListTable
                pinned={data.pinned}
                items={data.items}
                totalRegular={data.total}
                page={page}
                pageSize={data.pageSize}
              />
            )}
          </div>
        </div>

        {/* 하단 영역: 페이지네이션 + 검색 */}
        <div className="flex w-full flex-col items-center gap-4 pc:w-[550px]">
          {/* 페이지네이션 — PC는 10개 표시, 모바일은 5개 표시 (듀얼 렌더, CSS로 visibility 제어) */}
          <div className="hidden pc:block">
            <NoticePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              visiblePageCount={10}
              device="pc"
            />
          </div>
          <div className="block w-full pc:hidden">
            <NoticePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              visiblePageCount={5}
              device="mobile"
            />
          </div>
          <NoticeSearchBar
            initialQuery={query}
            initialField={searchField}
            onSubmit={handleSearchSubmit}
          />
        </div>
      </div>
    </main>
  )
}

export default function NoticeListPage() {
  return (
    <Suspense
      fallback={
        <p className="py-12 text-center typo-b3 text-gray-700">불러오는 중...</p>
      }
    >
      <NoticeListContent />
    </Suspense>
  )
}
