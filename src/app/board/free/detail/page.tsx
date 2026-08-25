'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentList } from '@/components/board/AttachmentList'
import { BoardContent } from '@/components/board/BoardContent'
import { DUSK_GHOST_BUTTON } from '@/components/ui/dusk/DuskForm'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { FreeBoardComments } from '@/components/board/FreeBoardComments'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { deleteFreePost, fetchFreeDetail } from '@/services/board/freeClient'
import type { FreeBoardDetail } from '@/types/free'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

export default function FreeBoardDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [detail, setDetail] = useState<FreeBoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 회원 전용이다. 목록과 같은 게이트를 상세에도 건다 — 링크로 직접 들어올 수 있다.
  const isLoggedIn = Boolean(user)

  /**
   * 서버 규칙(FreeBoardService.requireAuthorOrOrganizer)과 같은 조건이다.
   * 상세 응답이 authorId를 주므로 행사·공지처럼 넓게 보여주고 403에 맡기지 않아도 된다.
   */
  const canManage =
    detail !== null &&
    (hasAtLeast(user?.userRole, 'ORGANIZER') ||
      (user?.id !== undefined && user.id === detail.authorId))

  useEffect(() => {
    if (isLoggedIn) return
    router.replace(
      `/login?next=${encodeURIComponent(idParam ? `/board/free/detail/?id=${idParam}` : '/board/free/')}`
    )
  }, [idParam, isLoggedIn, router])

  useEffect(() => {
    if (!isLoggedIn) return

    if (!Number.isFinite(id)) {
      setLoading(false)
      setError('잘못된 접근입니다.')
      return
    }

    let alive = true
    setLoading(true)
    setError(null)
    setNotFound(false)

    fetchFreeDetail(id, apiClient)
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
  }, [apiClient, id, isLoggedIn])

  const handleDelete = useCallback(async () => {
    if (!Number.isFinite(id)) return
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      await deleteFreePost(apiClient, id)
      router.push('/board/free/')
    } catch {
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }, [apiClient, id, router])

  // 로그인으로 보내는 사이 그려지는 한 프레임. "불러오는 중"으로 두면 실패로 오해한다.
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">로그인이 필요한 게시판입니다.</p>
      </main>
    )
  }

  if (loading) {
    return <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
  }

  if (notFound) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">삭제되었거나 존재하지 않는 글입니다.</p>
        <Link
          href="/board/free/"
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
          href="/board/free/"
          className="mt-4 inline-block text-sm text-dusk-ink-500 underline transition-colors hover:text-dusk-ink-100"
        >
          목록으로
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[880px] space-y-6 px-[clamp(20px,5vw,44px)] pb-24 pt-11">
        <Link
          href="/board/free/"
          className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
        >
          ← 목록으로
        </Link>

        <div className="space-y-2">
          <h1 className="break-keep text-[clamp(25px,3vw,38px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            {detail.title}
          </h1>
          <div className="flex flex-wrap gap-[18px] text-[13px] text-dusk-ink-800">
            <span>{detail.authorName}</span>
            <span>{formatDate(detail.createdAt)}</span>
            {/* 조회수는 서버가 상세 조회마다 +1 한다. 이 값은 이번 조회가 반영된 뒤의 수치다. */}
            <span>조회 {detail.viewCount}</span>
          </div>
        </div>

        <BoardContent content={detail.content} />

        <AttachmentList attachments={detail.attachments} />

        {canManage && (
          <div className="flex gap-3 border-t border-t-[rgba(240,234,228,0.10)] pt-7">
            <Link href={`/board/free/edit?id=${detail.id}`} className={DUSK_GHOST_BUTTON}>
              수정
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

        <FreeBoardComments postId={detail.id} apiClient={apiClient} />
      </div>
    </main>
  )
}
