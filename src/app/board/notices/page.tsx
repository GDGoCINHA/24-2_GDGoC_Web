'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BoardSearchBar } from '@/components/board/BoardSearchBar'
import { NoticeCategoryTag } from '@/components/board/NoticeCategoryTag'
import { PinnedNoticeModal } from '@/components/board/PinnedNoticeModal'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { BoardPageHeader } from '@/components/board/BoardPageHeader'
import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'
import { BOARD_MENUS } from '@/components/board/boardMenus'
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
  const [pinnedModalOpen, setPinnedModalOpen] = useState(false)
  // 모달이 고정을 저장하면 이 값을 올려 목록을 다시 읽는다.
  const [reloadKey, setReloadKey] = useState(0)

  const canWrite = hasAtLeast(user?.userRole, 'CORE')
  // 글쓰기(CORE)와 고정 관리(ORGANIZER)는 권한 경계가 다르다.
  const canPin = hasAtLeast(user?.userRole, 'ORGANIZER')
  // 공지는 회원 전용이다. 행사 게시판과 달리 비로그인은 목록조차 볼 수 없다.
  const isLoggedIn = Boolean(user)

  useEffect(() => {
    if (isLoggedIn) return
    router.replace(`/login?next=${encodeURIComponent('/board/notices/')}`)
  }, [isLoggedIn, router])

  useEffect(() => {
    // 게이트가 로그인으로 보내는 중이다. 여기서 조회하면 토큰 없이 나간다.
    if (!isLoggedIn) return

    let alive = true
    setLoading(true)
    setError(null)

    // 로그인했으면 항상 토큰을 실어 보낸다. CORE 이상이면 서버가 자기
    // 임시저장(isPublished=false)까지 함께 내려준다.
    fetchNoticeList({ page, size: 15, searchType, keyword: submittedKeyword }, apiClient)
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
  }, [apiClient, isLoggedIn, page, searchType, submittedKeyword, reloadKey])

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
      primary: true,
      render: (item) => (
        <span className="flex items-center gap-2">
          {/* flex 자식은 기본 min-width:auto 라 min-w-0 없이는 줄어들지 않아 말줄임이 안 걸린다. */}
          <span className="min-w-0 overflow-hidden text-ellipsis pc:whitespace-nowrap mobile:line-clamp-2">
            {item.title}
          </span>
          {/* 서버가 CORE 미만에게는 미공개 글을 아예 주지 않으므로, 이 배지가 보인다는 건
              보는 사람이 CORE 이상이라는 뜻이다. */}
          {!item.isPublished && (
            <span className="shrink-0 text-xs text-dusk-ink-800">임시저장</span>
          )}
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

  // 위 useEffect가 로그인으로 보내는 사이 한 프레임이 그려진다. 목록 골격 대신
  // 안내를 띄워야 "빈 게시판"으로 오해하지 않는다.
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">로그인이 필요한 게시판입니다.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-[clamp(20px,5vw,44px)] pb-24 pt-14">
        <BoardPageHeader title="공지사항" totalCount={meta?.totalElements}>
          {canWrite && (
            <Link href="/board/notices/trash/" className={DUSK_GHOST_BUTTON}>
              휴지통
            </Link>
          )}
          {canPin && (
            <button
              type="button"
              onClick={() => setPinnedModalOpen(true)}
              className={DUSK_GHOST_BUTTON}
            >
              상단 고정 관리
            </button>
          )}
          {canWrite && (
            <Link href="/board/notices/new/" className={DUSK_PRIMARY_BUTTON}>
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

        {/* 고정 공지는 size=15와 별개 필드이며, 아래 일반 목록에도 같은 글이 나올 수 있다.
            구형 게시판의 통상적 동작이고 백엔드 설계 §7.1이 의도한 것이다. */}
        {pinned.length > 0 && (
          <ul className="flex flex-col gap-2 rounded-[14px] border border-dusk-line px-[18px] py-4">
            {pinned.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/board/notices/detail?id=${notice.id}`}
                  className="flex items-center gap-3 py-[5px] text-[15px] text-dusk-ink-100 transition-colors hover:text-ember"
                >
                  <span aria-hidden className="shrink-0 text-sm text-ember">
                    고정
                  </span>
                  <NoticeCategoryTag category={notice.category} />
                  <span className="min-w-0 flex-1 truncate">{notice.title}</span>
                  <span className="shrink-0 text-[13px] text-dusk-ink-800 mobile:hidden">
                    {notice.authorName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {loading && (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
        )}
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

        {canPin && (
          <PinnedNoticeModal
            open={pinnedModalOpen}
            apiClient={apiClient}
            onClose={() => setPinnedModalOpen(false)}
            onSaved={() => setReloadKey((key) => key + 1)}
          />
        )}
      </div>
    </main>
  )
}
