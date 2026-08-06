'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BoardSearchBar } from '@/components/board/BoardSearchBar'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { useAuth } from '@/hooks/useAuth'
import { fetchEventList } from '@/services/board/boardClient'
import type { EventBoardSummary, EventSearchType } from '@/types/board'
import type { PageMeta } from '@/utils/api/unwrapPaged'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

const SEARCH_TYPE_OPTIONS = [
  { id: 'TITLE_AND_CONTENT', label: '제목+내용' },
  { id: 'TITLE', label: '제목' },
  { id: 'CONTENT', label: '내용' },
  { id: 'AUTHOR', label: '작성자' }
]

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: '예정',
  IN_PROGRESS: '진행중',
  ENDED: '종료'
}

export default function EventBoardListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const [searchType, setSearchType] = useState<EventSearchType>('TITLE_AND_CONTENT')
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [items, setItems] = useState<EventBoardSummary[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    fetchEventList({ page, size: 12, searchType, keyword: submittedKeyword })
      .then(({ items: fetchedItems, meta: fetchedMeta }) => {
        if (!alive) return
        setItems(fetchedItems)
        setMeta(fetchedMeta)
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
  }, [page, searchType, submittedKeyword])

  const handleSubmitSearch = useCallback(() => {
    setPage(0)
    setSubmittedKeyword(keyword)
  }, [keyword])

  const columns: BoardListColumn<EventBoardSummary>[] = [
    { key: 'title', header: '제목', render: (item) => item.title },
    {
      key: 'period',
      header: '기간',
      render: (item) => `${formatDate(item.eventStartDate)} ~ ${formatDate(item.eventEndDate)}`
    },
    { key: 'team', header: '팀', render: (item) => item.organizingTeam ?? '-' },
    { key: 'author', header: '작성자', render: (item) => item.authorName },
    { key: 'status', header: '상태', render: (item) => STATUS_LABEL[item.status] ?? item.status }
  ]

  const canWrite = hasAtLeast(user?.userRole, 'CORE')

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader
        menus={BOARD_MENUS}
        actionMenu={{
          label: user ? '내 정보' : '로그인',
          url: user ? '/profile/' : '/login?next=%2Fboard%2Fevents%2F'
        }}
      />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="typo-pc-h3 mobile:typo-m-h2">행사 게시판</h1>
          {canWrite && (
            <Link
              href="/board/events/new/"
              className="rounded-full bg-red px-6 py-2 typo-pc-b3 text-white"
            >
              글쓰기
            </Link>
          )}
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

        {error && <p className="typo-pc-b3 text-red">{error}</p>}
        {loading ? (
          <p className="py-16 text-center text-gray-500 typo-pc-b2">불러오는 중...</p>
        ) : (
          <BoardList
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => router.push(`/board/events/detail?id=${item.id}`)}
          />
        )}

        {meta && (
          <BoardPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        )}
      </div>
    </main>
  )
}
