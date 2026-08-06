'use client'

import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AttachmentUploader, type AttachmentDraft } from '@/components/board/AttachmentUploader'
import {
  GdgButton,
  GdgDropdown,
  GdgInputField,
  GdgSiteHeader,
  GdgTextarea,
  type GdgDropdownOption
} from '@/components/ui/design-system'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchNoticeDetail, updateNotice } from '@/services/board/noticeClient'
import { NOTICE_CATEGORY_LABEL, type NoticeCategory } from '@/types/notice'
import { hasAtLeast } from '@/utils/auth/role'

const CATEGORY_OPTIONS: GdgDropdownOption[] = (
  Object.keys(NOTICE_CATEGORY_LABEL) as NoticeCategory[]
).map((category) => ({ id: category, label: NOTICE_CATEGORY_LABEL[category] }))

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

  const canManage = hasAtLeast(user?.userRole, 'CORE')

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
  }, [apiClient, canManage, id])

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
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 mobile:typo-m-b2">수정 권한이 없습니다.</p>
      </main>
    )
  }

  if (loading) {
    return <p className="py-16 text-center text-white typo-pc-b2 mobile:typo-m-b2">불러오는 중...</p>
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="text-red typo-pc-b2 mobile:typo-m-b2">{loadError}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader
        menus={BOARD_MENUS}
        actionMenu={{ label: '내 정보', url: '/profile/' }}
      />
      <div className="mx-auto w-full max-w-[720px] space-y-6 px-6 mobile:px-4 py-10">
        <h1 className="typo-pc-h3 mobile:typo-m-h2">공지사항 수정</h1>

        <GdgInputField
          label="제목"
          fullWidth
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <GdgDropdown
          label="분류"
          placeholder="분류를 선택하세요"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(value) => setCategory(value as NoticeCategory)}
        />

        <GdgTextarea
          label="내용"
          fullWidth
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        {/* 공개 중인 공지를 임시저장으로 되돌려도 상단 고정은 자동으로 풀리지 않는다.
            백엔드는 고정 '저장 시점'에만 미공개를 거부하고(PinnedNoticeService.replacePinned),
            이미 고정된 글이 나중에 미공개로 바뀌는 경로는 막지 않는다. 프론트가 할 수 있는
            일이 없어 관측한 사실로만 남긴다. */}
        <label className="flex items-center gap-2 typo-pc-b3 mobile:typo-m-b3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          공개 (해제하면 임시저장)
        </label>

        <div className="flex flex-col gap-2">
          <span className="tracking-[0.2em] text-white/80 typo-pc-s3 mobile:typo-m-s3 uppercase">첨부</span>
          <AttachmentUploader
            attachments={attachments}
            onChange={setAttachments}
            apiClient={apiClient}
            s3key={NOTICE_S3_KEY}
          />
        </div>

        {errorMessage && <p className="text-red typo-pc-b3 mobile:typo-m-b3">{errorMessage}</p>}

        <GdgButton variant="active" fullWidth onClick={handleSubmit} loading={submitting}>
          저장
        </GdgButton>
      </div>
    </main>
  )
}
