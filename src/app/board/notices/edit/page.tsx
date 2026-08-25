'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentUploader, type AttachmentDraft } from '@/components/board/AttachmentUploader'
import { BoardFormHeader } from '@/components/board/BoardPageHeader'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_INPUT,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { useContentImagePaste } from '@/hooks/useContentImagePaste'
import { fetchNoticeDetail, updateNotice } from '@/services/board/noticeClient'
import { NOTICE_CATEGORY_LABEL, type NoticeCategory } from '@/types/notice'
import { hasAtLeast } from '@/utils/auth/role'

const CATEGORY_OPTIONS = Object.keys(NOTICE_CATEGORY_LABEL) as NoticeCategory[]

const NOTICE_S3_KEY = 'boardNotice'

const createDraftId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export default function NoticeBoardEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<NoticeCategory | ''>('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { uploading: contentImageUploading, handlePaste: handleContentPaste } =
    useContentImagePaste({ apiClient, s3key: NOTICE_S3_KEY, setContent, setErrorMessage })

  const canManage = hasAtLeast(user?.userRole, 'CORE')
  // 남의 글이면 서버가 403 을 줄 것을 미리 알아내 폼 대신 안내를 띄운다.
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    if (!canManage) return
    if (!Number.isFinite(id)) {
      setLoading(false)
      setLoadError('잘못된 접근입니다.')
      return
    }

    let alive = true
    // 임시저장 글을 수정하려면 토큰이 필요하다 — 서버가 미공개 글을 CORE 미만에게 404로 숨긴다.
    fetchNoticeDetail(id, apiClient)
      .then((detail) => {
        if (!alive) return

        // 서버 규칙(NoticeBoardService.requireAuthorOrOrganizer)과 같은 조건이다.
        // CORE 라고 남의 공지를 고칠 수 있는 것이 아니다.
        const allowed =
          hasAtLeast(user?.userRole, 'ORGANIZER') ||
          (user?.id !== undefined && user.id === detail.authorId)
        if (!allowed) {
          setForbidden(true)
          return
        }

        setTitle(detail.title)
        setCategory(detail.category)
        setContent(detail.content)
        setIsPublished(detail.isPublished)
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
  }, [apiClient, canManage, id, user?.id, user?.userRole])

  const handleSubmit = useCallback(async () => {
    if (!Number.isFinite(id)) return
    if (!title.trim() || !category || !content.trim()) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      // 전 필드를 보낸다. attachments는 null이 아니면 서버가 통째로 교체하므로
      // (NoticeBoardService.updateNotice) 화면의 최종 상태가 곧 저장 결과다.
      await updateNotice(apiClient, id, {
        title: title.trim(),
        content,
        category,
        isPublished,
        attachments: attachments
          .filter((item) => item.status === 'done')
          .map((item) =>
            item.kind === 'FILE'
              ? { fileKey: item.fileKey, fileName: item.fileName }
              : { url: item.url }
          )
      })
      router.push(`/board/notices/detail?id=${id}`)
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage('수정에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [apiClient, attachments, category, content, id, isPublished, router, title])

  if (!canManage) {
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
        <p className="text-base text-dusk-ink-600">본인이 쓴 공지만 수정할 수 있습니다.</p>
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
        <BoardFormHeader backHref="/board/notices/" title="공지사항 수정" />

        <div className="mt-[34px] flex flex-col gap-[22px]">
          <DuskField label="제목">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={DUSK_INPUT}
            />
          </DuskField>

          <DuskField label="분류" className="max-w-[260px]">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as NoticeCategory)}
              className={DUSK_SELECT}
            >
              <option value="" className={DUSK_OPTION}>
                분류를 선택하세요
              </option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} className={DUSK_OPTION}>
                  {NOTICE_CATEGORY_LABEL[option]}
                </option>
              ))}
            </select>
          </DuskField>

          <DuskField
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
              className={DUSK_TEXTAREA}
            />
          </DuskField>

          {/* 공개 중인 공지를 임시저장으로 되돌려도 상단 고정은 자동으로 풀리지 않는다.
              백엔드는 고정 '저장 시점'에만 미공개를 거부하고(PinnedNoticeService.replacePinned),
              이미 고정된 글이 나중에 미공개로 바뀌는 경로는 막지 않는다. 프론트가 할 수 있는
              일이 없어 관측한 사실로만 남긴다. */}
          <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-dusk-ink-400">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="size-[17px] cursor-pointer accent-ember"
            />
            공개 (해제하면 임시저장)
          </label>

          <div className="flex flex-col gap-3">
            <span className="text-[13px] tracking-[0.06em] text-dusk-ink-400">첨부</span>
            <AttachmentUploader
              attachments={attachments}
              onChange={setAttachments}
              apiClient={apiClient}
              s3key={NOTICE_S3_KEY}
            />
          </div>

          {errorMessage && <p className="text-sm text-signal-err">{errorMessage}</p>}

          <div className="mt-1.5 flex gap-2.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={DUSK_SUBMIT_BUTTON}
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
            <Link href={`/board/notices/detail?id=${id}`} className={DUSK_CANCEL_BUTTON}>
              취소
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
