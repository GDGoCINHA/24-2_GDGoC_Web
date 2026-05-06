'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-8 py-12">
        {/* 헤더 영역 */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">공지사항</h1>
            <p className="mt-2 text-sm text-gray-400">
              GDGoC INHA의 소식을 빠르게 확인하세요.
            </p>
          </div>
          {isCorePlus && (
            <Link
              href="/notice/new"
              className="rounded-full bg-red px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              ✏ 글쓰기
            </Link>
          )}
        </div>

        {/* 필터 + 검색 */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <NoticeCategoryFilter
            value={category}
            onChange={(c) => updateQuery({ category: c, page: undefined })}
          />
          <NoticeSearchBar
            initialQuery={query}
            initialField={searchField}
            onSubmit={(q, f) =>
              updateQuery({ query: q || undefined, field: f, page: undefined })
            }
          />
        </div>

        {/* 결과 영역 */}
        {loading && (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        )}
        {error && (
          <p className="py-12 text-center text-sm text-red">{error.message}</p>
        )}
        {data && !loading && (
          <>
            <p className="mb-2 text-xs text-gray-400">총 {totalCount}개</p>
            <NoticeListTable pinned={data.pinned} items={data.items} />
            <div className="mt-8 flex justify-center">
              <NoticePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) =>
                  updateQuery({ page: p === 1 ? undefined : String(p) })
                }
              />
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function NoticeListPage() {
  return (
    <Suspense
      fallback={
        <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
      }
    >
      <NoticeListContent />
    </Suspense>
  )
}
