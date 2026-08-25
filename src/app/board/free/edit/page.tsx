'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentUploader, type AttachmentDraft } from '@/components/board/AttachmentUploader'
import {
  BoardField,
  BoardFormHeader,
  BOARD_CANCEL_BUTTON,
  BOARD_INPUT,
  BOARD_SUBMIT_BUTTON,
  BOARD_TEXTAREA
} from '@/components/board/BoardForm'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { useContentImagePaste } from '@/hooks/useContentImagePaste'
import { fetchFreeDetail, updateFreePost } from '@/services/board/freeClient'
import { hasAtLeast } from '@/utils/auth/role'

const FREE_S3_KEY = 'boardFree'

const createDraftId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export default function FreeBoardEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // 남의 글이면 서버가 403을 줄 것을 미리 알아내 폼 대신 안내를 띄운다.
  const [forbidden, setForbidden] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { uploading: contentImageUploading, handlePaste: handleContentPaste } =
    useContentImagePaste({ apiClient, s3key: FREE_S3_KEY, setContent, setErrorMessage })

  const isMember = hasAtLeast(user?.userRole, 'MEMBER')

  useEffect(() => {
    if (!isMember) return
    if (!Number.isFinite(id)) {
      setLoading(false)
      setLoadError('잘못된 접근입니다.')
      return
    }

    let alive = true
    fetchFreeDetail(id, apiClient)
      .then((detail) => {
        if (!alive) return

        // 서버 규칙(FreeBoardService.requireAuthorOrOrganizer)과 같은 조건이다.
        // 상세 응답이 authorId를 주므로 저장을 눌러 403을 받기 전에 판정할 수 있다.
        const canManage =
          hasAtLeast(user?.userRole, 'ORGANIZER') ||
          (user?.id !== undefined && user.id === detail.authorId)
        if (!canManage) {
          setForbidden(true)
          return
        }

        setTitle(detail.title)
        setContent(detail.content)
        setAttachments(
          detail.attachments.map((attachment) => ({
            id: createDraftId(),
            kind: attachment.kind,
            fileName: attachment.fileName ?? undefined,
            fileKey: attachment.fileKey ?? undefined,
            url: attachment.url ?? undefined,
            status: 'done' as const
          }))
        )
      })
      .catch(() => {
        if (alive) setLoadError('글을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [apiClient, id, isMember, user?.id, user?.userRole])

  const handleSubmit = useCallback(async () => {
    if (!Number.isFinite(id)) return
    if (!title.trim() || !content.trim()) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      // 전 필드를 보낸다. attachments는 null이 아니면 서버가 통째로 교체하므로
      // (FreeBoardService.updatePost) 화면의 최종 상태가 곧 저장 결과다.
      await updateFreePost(apiClient, id, {
        title: title.trim(),
        content,
        attachments: attachments
          .filter((item) => item.status === 'done')
          .map((item) =>
            item.kind === 'FILE'
              ? { fileKey: item.fileKey, fileName: item.fileName }
              : { url: item.url }
          )
      })
      router.push(`/board/free/detail?id=${id}`)
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage('수정에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [apiClient, attachments, content, id, router, title])

  if (!isMember) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">수정 권한이 없습니다.</p>
      </main>
    )
  }

  if (loading) {
    return <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
  }

  if (forbidden) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">본인이 쓴 글만 수정할 수 있습니다.</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-signal-err">{loadError}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[720px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-11">
        <BoardFormHeader backHref="/board/free/" title="자유게시판 수정" />

        <div className="mt-[34px] flex flex-col gap-[22px]">
          <BoardField label="제목">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={BOARD_INPUT}
            />
          </BoardField>

          <BoardField
            label="내용"
            hint={
              contentImageUploading
                ? '이미지 올리는 중...'
                : '이미지를 복사해 붙여넣으면 그 자리에 들어갑니다.'
            }
          >
            <textarea
              rows={14}
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onPaste={handleContentPaste}
              className={BOARD_TEXTAREA}
            />
          </BoardField>

          <div className="flex flex-col gap-3">
            <span className="text-[13px] tracking-[0.06em] text-dusk-ink-400">첨부</span>
            <AttachmentUploader
              attachments={attachments}
              onChange={setAttachments}
              apiClient={apiClient}
              s3key={FREE_S3_KEY}
            />
          </div>

          {errorMessage && <p className="text-sm text-signal-err">{errorMessage}</p>}

          <div className="mt-1.5 flex gap-2.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={BOARD_SUBMIT_BUTTON}
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
            <Link href={`/board/free/detail?id=${id}`} className={BOARD_CANCEL_BUTTON}>
              취소
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
