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

  const isCorePlus = !!user?.userRole && CORE_PLUS_ROLES.has(user.userRole)

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

  return (
    <main className="bg-black text-white">
      <div className="mx-auto flex w-[1280px] flex-col items-center gap-16 px-[80px] pt-[56px] pb-[120px]">
        <div className="flex w-full flex-col gap-6">
          {/* 타이틀 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-white">
              <h1 className="typo-h4">공지사항</h1>
              <p className="typo-b3">GDGoC INHA의 소식을 빠르게 확인하세요.</p>
            </div>

            {/* 카테고리 필터 + 글쓰기 버튼 */}
            <div className="flex w-full items-center justify-between">
              <NoticeCategoryFilter
                value={category}
                onChange={(c) => updateQuery({ category: c, page: undefined })}
              />
              {isCorePlus && (
                <Link
                  href="/notice/new"
                  className="inline-flex items-center gap-1 rounded-full bg-red px-4 py-2 typo-b3 text-white transition-opacity hover:opacity-90"
                >
                  <Pencil size={14} strokeWidth={2.4} />
                  글쓰기
                </Link>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="flex w-full flex-col gap-4">
            {/* 총 N개 + 상단 검색 */}
            <div className="flex w-full items-end justify-between">
              <p className="whitespace-nowrap typo-b3 text-white">
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
        <div className="flex w-[550px] flex-col items-center gap-4">
          <NoticePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) =>
              updateQuery({ page: p === 1 ? undefined : String(p) })
            }
          />
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
