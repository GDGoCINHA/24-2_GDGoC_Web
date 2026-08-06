'use client'

import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentList } from '@/components/board/AttachmentList'
import { GdgSiteHeader } from '@/components/ui/design-system'
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

  const canManage = hasAtLeast(user?.userRole, 'CORE')

  if (loading) {
    return <p className="py-16 text-center text-white typo-pc-b2">불러오는 중...</p>
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2">삭제되었거나 존재하지 않는 글입니다.</p>
        <Link href="/board/events/" className="mt-4 inline-block underline typo-pc-b3">
          목록으로
        </Link>
      </main>
    )
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 text-red">{error ?? '글을 불러오지 못했습니다.'}</p>
        <Link href="/board/events/" className="mt-4 inline-block underline typo-pc-b3">
          목록으로
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader
        menus={[{ label: '게시판', url: '/board/events/' }]}
        actionMenu={{
          label: user ? '내 정보' : '로그인',
          url: user ? '/profile/' : '/login?next=%2Fboard%2Fevents%2F'
        }}
      />
      <div className="mx-auto w-full max-w-[880px] space-y-6 px-6 py-10">
        <Link href="/board/events/" className="typo-pc-c2 text-gray-700 hover:text-white">
          목록으로
        </Link>

        <div className="space-y-2">
          <h1 className="typo-pc-h3 mobile:typo-m-h2">{detail.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-500 typo-pc-c1">
            <span>
              {formatDate(detail.eventStartDate)} ~ {formatDate(detail.eventEndDate)}
            </span>
            <span>{detail.organizingTeam ?? '-'}</span>
            <span>{detail.authorName}</span>
            <span>{STATUS_LABEL[detail.status] ?? detail.status}</span>
          </div>
        </div>

        {detail.thumbnailUrl && (
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image src={detail.thumbnailUrl} alt="" fill className="object-cover" />
          </div>
        )}

        <p className="whitespace-pre-wrap typo-pc-b2">{detail.content}</p>

        <AttachmentList attachments={detail.attachments} />

        {canManage && (
          <div className="flex gap-3 border-t border-gray-800 pt-6">
            <Link
              href={`/board/events/edit?id=${detail.id}`}
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
