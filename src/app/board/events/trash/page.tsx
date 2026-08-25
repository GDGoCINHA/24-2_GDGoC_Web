'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { BoardList, type BoardListColumn } from '@/components/board/BoardList'
import { BoardPagination } from '@/components/board/BoardPagination'
import { BoardPageHeader } from '@/components/board/BoardPageHeader'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
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
          className="whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-4 py-1.5 text-[13px] text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100 disabled:opacity-50"
        >
          {restoringId === item.id ? '복원 중' : '복원'}
        </button>
      )
    }
  ]

  if (!canOpen) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">접근 권한이 없습니다.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[1120px] space-y-6 px-[clamp(20px,5vw,44px)] pb-24 pt-14">
        <BoardPageHeader title="행사게시판 휴지통" totalCount={meta?.totalElements}>
          <Link href="/board/events/" className={DUSK_GHOST_BUTTON}>
            목록으로
          </Link>
        </BoardPageHeader>

        {/* 공지·자유가 '본인 글만'인 것과 달리 행사는 팀 기준이다 (requireTeamAccess). */}
        {!hasAtLeast(user?.userRole, 'ORGANIZER') && (
          <p className="text-[13px] text-dusk-ink-700">소속 팀이 주최한 행사만 보입니다.</p>
        )}

        {error && <p className="text-sm text-signal-err">{error}</p>}

        {loading && (
          <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
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
