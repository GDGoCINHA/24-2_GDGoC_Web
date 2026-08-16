'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BoardSearchBar } from '@/components/board/BoardSearchBar'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchFreeList } from '@/services/board/freeClient'
import type { FreeBoardSummary, FreeSearchType } from '@/types/free'
import type { PageMeta } from '@/utils/api/unwrapPaged'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

const SEARCH_TYPE_OPTIONS = [
  { id: 'TITLE_AND_CONTENT', label: '제목+내용' },
  { id: 'TITLE', label: '제목' },
  { id: 'CONTENT', label: '내용' },
  { id: 'AUTHOR', label: '작성자' }
]

export default function FreeBoardListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [page, setPage] = useState(0)
  const [searchType, setSearchType] = useState<FreeSearchType>('TITLE_AND_CONTENT')
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [items, setItems] = useState<FreeBoardSummary[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 공지가 CORE 이상인 것과 다르다. 자유게시판은 회원이면 누구나 쓴다.
  const canWrite = hasAtLeast(user?.userRole, 'MEMBER')
  // 회원 전용이다. 행사 게시판과 달리 비로그인은 목록조차 볼 수 없다.
  const isLoggedIn = Boolean(user)

  useEffect(() => {
    if (isLoggedIn) return
    router.replace(`/login?next=${encodeURIComponent('/board/free/')}`)
  }, [isLoggedIn, router])

  useEffect(() => {
    // 게이트가 로그인으로 보내는 중이다. 여기서 조회하면 토큰 없이 나간다.
    if (!isLoggedIn) return

    let alive = true
    setLoading(true)
    setError(null)

    fetchFreeList({ page, size: 15, searchType, keyword: submittedKeyword }, apiClient)
      .then((result) => {
        if (!alive) return
        setItems(result.items)
        setMeta(result.meta)
      })
      .catch(() => {
        if (alive) setError('목록을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient, isLoggedIn, page, searchType, submittedKeyword])

  const handleSubmitSearch = useCallback(() => {
    setPage(0)
    setSubmittedKeyword(keyword)
  }, [keyword])

  const columns: BoardListColumn<FreeBoardSummary>[] = [
    {
      key: 'title',
      header: '제목',
      primary: true,
      render: (item) => <span className="block truncate">{item.title}</span>
    },
    { key: 'author', header: '작성자', render: (item) => item.authorName, className: 'w-32' },
    { key: 'view', header: '조회', render: (item) => item.viewCount, className: 'w-20' },
    {
      key: 'createdAt',
      header: '작성일',
      render: (item) => formatDate(item.createdAt),
      className: 'w-32'
    }
  ]

  // 위 useEffect가 로그인으로 보내는 사이 한 프레임이 그려진다. 목록 골격 대신
  // 안내를 띄워야 "빈 게시판"으로 오해하지 않는다.
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 mobile:typo-m-b2">로그인이 필요한 게시판입니다.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-6 mobile:px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="typo-pc-h3 mobile:typo-m-h2">자유게시판</h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* 휴지통은 MEMBER 이상이면 열린다 — 자기가 지운 글만 보인다. */}
            {canWrite && (
              <Link
                href="/board/free/trash/"
                className="rounded-full border border-gray-800 px-6 py-2 typo-pc-b3 mobile:typo-m-b3"
              >
                휴지통
              </Link>
            )}
            {canWrite && (
              <Link
                href="/board/free/new/"
                className="rounded-full bg-red px-6 py-2 text-white typo-pc-b3 mobile:typo-m-b3"
              >
                글쓰기
              </Link>
            )}
          </div>
        </div>

        <BoardSearchBar
          searchType={searchType}
          keyword={keyword}
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
          onSearchTypeChange={(type) => {
            setSearchType(type)
            setPage(0)
          }}
          onKeywordChange={setKeyword}
          onSubmit={handleSubmitSearch}
        />

        {error && <p className="text-red typo-pc-b3 mobile:typo-m-b3">{error}</p>}

        {loading && (
          <p className="py-16 text-center text-gray-500 typo-pc-b2 mobile:typo-m-b2">
            불러오는 중...
          </p>
        )}
        {/* 실패했을 때는 목록을 그리지 않는다. 빈 배열을 넘기면 "등록된 글이 없습니다."가
            에러 메시지와 나란히 떠서, 못 불러온 것인지 정말 없는 것인지 구분이 안 된다. */}
        {!loading && !error && (
          <BoardList
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => router.push(`/board/free/detail?id=${item.id}`)}
            emptyMessage="등록된 글이 없습니다."
          />
        )}

        {meta && (
          <BoardPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        )}
      </div>
    </main>
  )
}
