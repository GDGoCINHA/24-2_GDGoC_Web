'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchDeletedFreePosts, restoreFreePost } from '@/services/board/freeClient'
import type { DeletedFreeBoardSummary } from '@/types/free'
import type { PageMeta } from '@/utils/api/unwrapPaged'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

export default function FreeBoardTrashPage() {
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [page, setPage] = useState(0)
  const [items, setItems] = useState<DeletedFreeBoardSummary[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  // 복원하면 그 행이 목록에서 빠져야 하므로 다시 읽는다.
  const [reloadKey, setReloadKey] = useState(0)

  // 서버와 같은 경계다. MEMBER 이상이면 열리고, ORGANIZER 미만에게는 서버가 자기 글만 준다.
  const canOpen = hasAtLeast(user?.userRole, 'MEMBER')

  useEffect(() => {
    if (!canOpen) return

    let alive = true
    setLoading(true)
    setError(null)

    fetchDeletedFreePosts({ page, size: 15 }, apiClient)
      .then((result) => {
        if (!alive) return
        setItems(result.items)
        setMeta(result.meta)
      })
      .catch(() => {
        if (alive) setError('휴지통을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient, canOpen, page, reloadKey])

  const handleRestore = useCallback(
    async (id: number) => {
      setRestoringId(id)
      try {
        await restoreFreePost(apiClient, id)
        setReloadKey((key) => key + 1)
      } catch {
        alert('복원에 실패했습니다.')
      } finally {
        setRestoringId(null)
      }
    },
    [apiClient]
  )

  const columns: BoardListColumn<DeletedFreeBoardSummary>[] = [
    { key: 'title', header: '제목', primary: true, render: (item) => item.title },
    { key: 'author', header: '작성자', render: (item) => item.authorName, className: 'w-32' },
    {
      key: 'deletedAt',
      header: '삭제일',
      render: (item) => formatDate(item.deletedAt),
      className: 'w-32'
    },
    {
      key: 'restore',
      header: '',
      className: 'w-24',
      render: (item) => (
        <button
          type="button"
          onClick={() => handleRestore(item.id)}
          disabled={restoringId === item.id}
          className="rounded-full border border-gray-800 px-4 py-1 typo-pc-c1 mobile:typo-m-c1 disabled:opacity-50"
        >
          {restoringId === item.id ? '복원 중' : '복원'}
        </button>
      )
    }
  ]

  if (!canOpen) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 mobile:typo-m-b2">로그인이 필요합니다.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-6 mobile:px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="typo-pc-h3 mobile:typo-m-h2">자유게시판 휴지통</h1>
          <Link href="/board/free/" className="underline typo-pc-b3 mobile:typo-m-b3">
            목록으로
          </Link>
        </div>

        {/* 운영진이 아니면 자기 글만 보인다. 안 보인다고 없는 것이 아니라는 걸 알려준다. */}
        {!hasAtLeast(user?.userRole, 'ORGANIZER') && (
          <p className="text-gray-600 typo-pc-c1 mobile:typo-m-c1">
            본인이 삭제한 글만 보입니다.
          </p>
        )}

        {error && <p className="text-red typo-pc-b3 mobile:typo-m-b3">{error}</p>}

        {loading && (
          <p className="py-16 text-center text-gray-500 typo-pc-b2 mobile:typo-m-b2">
            불러오는 중...
          </p>
        )}
        {!loading && !error && (
          <BoardList
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyMessage="휴지통이 비어 있습니다."
          />
        )}

        {meta && (
          <BoardPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        )}
      </div>
    </main>
  )
}
