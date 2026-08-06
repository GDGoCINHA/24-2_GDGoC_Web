'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentList } from '@/components/board/AttachmentList'
import { NoticeCategoryTag } from '@/components/board/NoticeCategoryTag'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { deleteNotice, fetchNoticeDetail } from '@/services/board/noticeClient'
import type { NoticeDetail } from '@/types/notice'
import { hasAtLeast } from '@/utils/auth/role'
import { formatDate } from '@/utils/formatDate'

export default function NoticeBoardDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [detail, setDetail] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canManage = hasAtLeast(user?.userRole, 'CORE')
  // 공지는 회원 전용이다. 목록과 같은 게이트를 상세에도 건다 — 링크로 직접 들어올 수 있다.
  const isLoggedIn = Boolean(user)

  useEffect(() => {
    if (isLoggedIn) return
    router.replace(
      `/login?next=${encodeURIComponent(idParam ? `/board/notices/detail/?id=${idParam}` : '/board/notices/')}`
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

    // 미공개 글은 서버가 CORE 미만에게 404를 준다. CORE 이상은 자기 초안까지 열린다.
    fetchNoticeDetail(id, apiClient)
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
      await deleteNotice(apiClient, id)
      router.push('/board/notices/')
    } catch {
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }, [apiClient, id, router])

  // 로그인으로 보내는 사이 그려지는 한 프레임. "불러오는 중"으로 두면 실패로 오해한다.
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 mobile:typo-m-b2">로그인이 필요한 게시판입니다.</p>
      </main>
    )
  }

  if (loading) {
    return <p className="py-16 text-center text-white typo-pc-b2 mobile:typo-m-b2">불러오는 중...</p>
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2">삭제되었거나 존재하지 않는 공지입니다.</p>
        <Link href="/board/notices/" className="mt-4 inline-block underline typo-pc-b3">
          목록으로
        </Link>
      </main>
    )
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="text-red typo-pc-b2">{error ?? '글을 불러오지 못했습니다.'}</p>
        <Link href="/board/notices/" className="mt-4 inline-block underline typo-pc-b3">
          목록으로
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[880px] space-y-6 px-6 py-10">
        <Link href="/board/notices/" className="text-gray-700 typo-pc-c2 hover:text-white">
          목록으로
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <NoticeCategoryTag category={detail.category} />
            {!detail.isPublished && <span className="text-gray-700 typo-pc-c2">임시저장</span>}
          </div>
          <h1 className="typo-pc-h3 mobile:typo-m-h2">{detail.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-500 typo-pc-c1">
            <span>{detail.authorName}</span>
            <span>{formatDate(detail.createdAt)}</span>
            {/* 조회수는 서버가 상세 조회마다 +1 한다. 이 값은 이번 조회가 반영된 뒤의 수치다. */}
            <span>조회 {detail.viewCount}</span>
          </div>
        </div>

        <p className="whitespace-pre-wrap typo-pc-b2">{detail.content}</p>

        <AttachmentList attachments={detail.attachments} />

        {/* 서버의 실제 규칙은 '작성자 본인 또는 ORGANIZER 이상'으로 더 좁다
            (NoticeBoardService.requireAuthorOrOrganizer). 상세 응답이 authorId를 주지
            않아 프론트가 '본인인가'를 판정할 수 없으므로 넓게 보여주고 거부는 서버 403에
            맡긴다. 이 분기는 방어가 아니라 편의다. */}
        {canManage && (
          <div className="flex gap-3 border-t border-gray-800 pt-6">
            <Link
              href={`/board/notices/edit?id=${detail.id}`}
              className="rounded-full border border-gray-800 px-6 py-2 typo-pc-b3"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full border border-red px-6 py-2 text-red typo-pc-b3 disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
