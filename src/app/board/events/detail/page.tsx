'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentList } from '@/components/board/AttachmentList'
import { BoardContent } from '@/components/board/BoardContent'
import EventApplicationSection from '@/components/eventApplication/EventApplicationSection'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { deleteEvent, fetchEventDetail } from '@/services/board/boardClient'
import type { EventBoardDetail } from '@/types/board'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: '예정',
  IN_PROGRESS: '진행중',
  ENDED: '종료'
}

export default function EventBoardDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [detail, setDetail] = useState<EventBoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false)
      setError('잘못된 접근입니다.')
      return
    }

    let alive = true
    setLoading(true)
    setError(null)
    setNotFound(false)

    fetchEventDetail(id)
      .then((data) => {
        if (alive) setDetail(data)
      })
      .catch((err) => {
        if (!alive) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true)
        } else {
          setError('글을 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [id])

  const handleDelete = useCallback(async () => {
    if (!Number.isFinite(id)) return
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      await deleteEvent(apiClient, id)
      router.push('/board/events/')
    } catch {
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }, [apiClient, id, router])

  /**
   * 서버 규칙(EventBoardService.requireTeamAccess)과 같은 조건이다.
   * ORGANIZER 이상이거나, 그 아래는 주최 팀이 자기 팀과 같아야 한다.
   *
   * 전에는 CORE 이상 전원에게 버튼을 띄우고 거부는 403 에 맡겼다. 팀이 다르면
   * 눌러야 막히는 걸 알 수 있었다. organizingTeam 은 상세 응답에 원래 있던 값이다.
   *
   * 팀이 없는 회원(user.team == null)에게 버튼이 뜨지 않는 것도 서버와 같다 —
   * requireTeamAccess 가 userTeam == null 을 403 으로 본다.
   */
  const canManage =
    detail !== null &&
    (hasAtLeast(user?.userRole, 'ORGANIZER') ||
      (user?.team != null && user.team === detail.organizingTeam))

  if (loading) {
    return <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
  }

  if (notFound) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">삭제되었거나 존재하지 않는 글입니다.</p>
        <Link
          href="/board/events/"
          className="mt-4 inline-block text-sm text-dusk-ink-500 underline transition-colors hover:text-dusk-ink-100"
        >
          목록으로
        </Link>
      </main>
    )
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-signal-err">{error ?? '글을 불러오지 못했습니다.'}</p>
        <Link
          href="/board/events/"
          className="mt-4 inline-block text-sm text-dusk-ink-500 underline transition-colors hover:text-dusk-ink-100"
        >
          목록으로
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <GdgSiteHeader
        menus={BOARD_MENUS}
        actionMenu={{
          label: user ? '내 정보' : '로그인',
          url: user ? '/profile/' : '/login?next=%2Fboard%2Fevents%2F'
        }}
      />
      <div className="mx-auto w-full max-w-[880px] space-y-6 px-[clamp(20px,5vw,44px)] pb-24 pt-11">
        <Link
          href="/board/events/"
          className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
        >
          ← 목록으로
        </Link>

        <div className="space-y-2">
          <h1 className="break-keep text-[clamp(25px,3vw,38px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            {detail.title}
          </h1>
          <div className="flex flex-wrap gap-[18px] text-[13px] text-dusk-ink-800">
            <span>
              {formatDate(detail.eventStartDate)} ~ {formatDate(detail.eventEndDate)}
            </span>
            <span>{detail.organizingTeam ?? '-'}</span>
            <span>{detail.authorName}</span>
            <span>{STATUS_LABEL[detail.status] ?? detail.status}</span>
          </div>
        </div>

        {/* 썸네일은 목록에서 글을 고를 때 쓰는 그림이다. 상세에서 또 띄우면 본문에 같은
            이미지를 넣었을 때 두 번 보인다 — 본문에 넣을 그림은 본문이 갖는다. */}
        <BoardContent content={detail.content} />

        {detail.attachments.length > 0 && (
          <div className="space-y-3 border-t border-t-[rgba(240,234,228,0.10)] pt-7">
            <p className="text-sm font-medium text-dusk-ink-500">첨부</p>
            <AttachmentList attachments={detail.attachments} />
          </div>
        )}

        <EventApplicationSection eventBoardId={detail.id} />

        {canManage && (
          <div className="flex gap-3 border-t border-t-[rgba(240,234,228,0.10)] pt-7">
            <Link href={`/board/events/edit?id=${detail.id}`} className={DUSK_GHOST_BUTTON}>
              수정
            </Link>
            <Link href={`/dashboard/events/form/?id=${detail.id}`} className={DUSK_GHOST_BUTTON}>
              신청 폼
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="whitespace-nowrap rounded-full border border-[rgba(196,88,74,0.6)] px-[22px] py-[11px] text-sm text-signal-err transition-colors hover:bg-[rgba(196,88,74,0.12)] disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
