'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import {
  BoardPageHeader,
  BOARD_GHOST_BUTTON,
  BOARD_PRIMARY_BUTTON
} from '@/components/board/BoardPageHeader'
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

  // 제목만 너비를 비워 남은 폭을 전부 가져가게 한다 (BoardList 는 table-fixed).
  const columns: BoardListColumn<EventBoardSummary>[] = [
    {
      key: 'title',
      header: '제목',
      render: (item) => <span className="block truncate">{item.title}</span>,
      primary: true
    },
    {
      key: 'period',
      header: '기간',
      render: (item) => `${formatDate(item.eventStartDate)} ~ ${formatDate(item.eventEndDate)}`,
      className: 'w-52'
    },
    {
      key: 'team',
      header: '팀',
      render: (item) => item.organizingTeam ?? '-',
      className: 'w-28'
    },
    { key: 'author', header: '작성자', render: (item) => item.authorName, className: 'w-28' },
    {
      key: 'status',
      header: '상태',
      render: (item) => STATUS_LABEL[item.status] ?? item.status,
      className: 'w-20'
    }
  ]

  const canWrite = hasAtLeast(user?.userRole, 'CORE')

  return (
    <main className="min-h-screen">
      <GdgSiteHeader
        menus={BOARD_MENUS}
        actionMenu={{
          label: user ? '내 정보' : '로그인',
          url: user ? '/profile/' : '/login?next=%2Fboard%2Fevents%2F'
        }}
      />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-[clamp(20px,5vw,44px)] pb-24 pt-14">
        <BoardPageHeader title="행사게시판" totalCount={meta?.totalElements}>
          {canWrite && (
            <Link href="/board/events/trash/" className={BOARD_GHOST_BUTTON}>
              휴지통
            </Link>
          )}
          {canWrite && (
            <Link href="/board/events/new/" className={BOARD_PRIMARY_BUTTON}>
              글쓰기
            </Link>
          )}
        </BoardPageHeader>

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

        {error && <p className="text-sm text-signal-err">{error}</p>}
        {loading && (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
        )}
        {/* 실패했을 때는 목록을 그리지 않는다. 빈 배열을 넘기면 "등록된 글이 없습니다."가
            에러 메시지와 나란히 떠서, 못 불러온 것인지 정말 없는 것인지 구분이 안 된다.
            공지·자유게시판은 처음부터 이 가드를 갖고 있었는데 여기만 빠져 있었다. */}
        {!loading && !error && (
          <BoardList
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => router.push(`/board/events/detail?id=${item.id}`)}
            thumbnail={(item) => (
              <div className="h-12 w-20 overflow-hidden rounded-[3px] bg-dusk-slot">
                {item.thumbnailUrl && (
                  // next/image 는 못 쓴다 — S3 호스트를 remotePatterns 에 적을 수 없다.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            )}
          />
        )}

        {meta && (
          <BoardPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        )}
      </div>
    </main>
  )
}
