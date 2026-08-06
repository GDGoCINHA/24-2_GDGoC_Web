'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BoardSearchBar } from '@/components/board/BoardSearchBar'
import { NoticeCategoryTag } from '@/components/board/NoticeCategoryTag'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchNoticeList } from '@/services/board/noticeClient'
import type { NoticeSearchType, NoticeSummary } from '@/types/notice'
import type { PageMeta } from '@/utils/api/unwrapPaged'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

const SEARCH_TYPE_OPTIONS = [
  { id: 'TITLE_AND_CONTENT', label: '제목+내용' },
  { id: 'TITLE', label: '제목' },
  { id: 'CONTENT', label: '내용' },
  { id: 'AUTHOR', label: '작성자' }
]

export default function NoticeBoardListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [page, setPage] = useState(0)
  const [searchType, setSearchType] = useState<NoticeSearchType>('TITLE_AND_CONTENT')
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [pinned, setPinned] = useState<NoticeSummary[]>([])
  const [items, setItems] = useState<NoticeSummary[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canWrite = hasAtLeast(user?.userRole, 'CORE')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    // CORE 이상만 토큰을 실어 보낸다. 그래야 임시저장(isPublished=false)이 목록에 보인다.
    // 비로그인 방문자에게 apiClient를 쓰면 401 인터셉터가 /login으로 튕긴다.
    fetchNoticeList(
      { page, size: 15, searchType, keyword: submittedKeyword },
      canWrite ? apiClient : undefined
    )
      .then((result) => {
        if (!alive) return
        setPinned(result.pinned)
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
  }, [apiClient, canWrite, page, searchType, submittedKeyword])

  const handleSubmitSearch = useCallback(() => {
    setPage(0)
    setSubmittedKeyword(keyword)
  }, [keyword])

  const columns: BoardListColumn<NoticeSummary>[] = [
    {
      key: 'category',
      header: '분류',
      render: (item) => <NoticeCategoryTag category={item.category} />,
      className: 'w-24'
    },
    {
      key: 'title',
      header: '제목',
      render: (item) => (
        <span className="flex items-center gap-2">
          {item.title}
          {/* 서버가 CORE 미만에게는 미공개 글을 아예 주지 않으므로, 이 배지가 보인다는 건
              보는 사람이 CORE 이상이라는 뜻이다. */}
          {!item.isPublished && <span className="shrink-0 text-gray-700 typo-pc-c2">임시저장</span>}
        </span>
      )
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

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader
        menus={[{ label: '공지사항', url: '/board/notices/' }]}
        actionMenu={{
          label: user ? '내 정보' : '로그인',
          url: user ? '/profile/' : '/login?next=%2Fboard%2Fnotices%2F'
        }}
      />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="typo-pc-h3 mobile:typo-m-h2">공지사항</h1>
          {canWrite && (
            <Link
              href="/board/notices/new/"
              className="rounded-full bg-red px-6 py-2 text-white typo-pc-b3"
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

        {error && <p className="text-red typo-pc-b3">{error}</p>}

        {/* 고정 공지는 size=15와 별개 필드이며, 아래 일반 목록에도 같은 글이 나올 수 있다.
            구형 게시판의 통상적 동작이고 백엔드 설계 §7.1이 의도한 것이다. */}
        {pinned.length > 0 && (
          <ul className="flex flex-col gap-2 rounded-2xl border border-gray-800 p-4">
            {pinned.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/board/notices/detail?id=${notice.id}`}
                  className="flex items-center gap-3 py-1 typo-pc-b3 hover:underline"
                >
                  <span aria-hidden>📌</span>
                  <NoticeCategoryTag category={notice.category} />
                  <span className="flex-1 truncate">{notice.title}</span>
                  <span className="shrink-0 text-gray-500 typo-pc-c1">{notice.authorName}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="py-16 text-center text-gray-500 typo-pc-b2">불러오는 중...</p>}
        {/* 실패했을 때는 목록을 그리지 않는다. 빈 배열을 넘기면 "등록된 공지가 없습니다."가
            에러 메시지와 나란히 떠서, 못 불러온 것인지 정말 없는 것인지 구분이 안 된다. */}
        {!loading && !error && (
          <BoardList
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={(item) => router.push(`/board/notices/detail?id=${item.id}`)}
            emptyMessage="등록된 공지가 없습니다."
          />
        )}

        {meta && (
          <BoardPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        )}
      </div>
    </main>
  )
}
