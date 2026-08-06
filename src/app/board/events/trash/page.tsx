'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchDeletedEvents, restoreEvent } from '@/services/board/boardClient'
import type { DeletedEventBoardSummary } from '@/types/board'
import type { PageMeta } from '@/utils/api/unwrapPaged'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

export default function EventBoardTrashPage() {
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [page, setPage] = useState(0)
  const [items, setItems] = useState<DeletedEventBoardSummary[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // 서버와 같은 경계다. ORGANIZER 미만에게는 서버가 자기 팀 행사만 준다.
  const canOpen = hasAtLeast(user?.userRole, 'CORE')

  useEffect(() => {
    if (!canOpen) return

    let alive = true
    setLoading(true)
    setError(null)

    fetchDeletedEvents({ page, size: 12 }, apiClient)
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
        await restoreEvent(apiClient, id)
        setReloadKey((key) => key + 1)
      } catch {
        alert('복원에 실패했습니다.')
      } finally {
        setRestoringId(null)
      }
    },
    [apiClient]
  )

  const columns: BoardListColumn<DeletedEventBoardSummary>[] = [
    { key: 'title', header: '제목', primary: true, render: (item) => item.title },
    {
      key: 'team',
      header: '주최',
      render: (item) => item.organizingTeam ?? '-',
      className: 'w-28'
    },
    {
      key: 'period',
      header: '기간',
      render: (item) => `${formatDate(item.eventStartDate)} ~ ${formatDate(item.eventEndDate)}`,
      className: 'w-56'
    },
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
        <p className="typo-pc-b2 mobile:typo-m-b2">접근 권한이 없습니다.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-6 mobile:px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="typo-pc-h3 mobile:typo-m-h2">행사게시판 휴지통</h1>
          <Link href="/board/events/" className="underline typo-pc-b3 mobile:typo-m-b3">
            목록으로
          </Link>
        </div>

        {/* 공지·자유가 '본인 글만'인 것과 달리 행사는 팀 기준이다 (requireTeamAccess). */}
        {!hasAtLeast(user?.userRole, 'ORGANIZER') && (
          <p className="text-gray-600 typo-pc-c1 mobile:typo-m-c1">
            소속 팀이 주최한 행사만 보입니다.
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
