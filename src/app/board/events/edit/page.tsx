'use client'

import axios from 'axios'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'

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
import { fetchEventDetail, updateEvent } from '@/services/board/boardClient'
import { requestPresignedUpload, uploadFileToS3 } from '@/services/board/uploadClient'
import type { AttachmentResponse, EventOrganizingTeam } from '@/types/board'
import { hasAtLeast } from '@/utils/auth/role'

const TEAM_OPTIONS: GdgDropdownOption[] = [
  { id: 'HQ', label: 'HQ' },
  { id: 'HR', label: 'HR' },
  { id: 'PR_DESIGN', label: 'PR/DESIGN' },
  { id: 'TECH', label: 'TECH' },
  { id: 'BD', label: 'BD' }
]

// TODO: 백엔드 S3KeyType에 boardEvent가 추가되면 그 값과 일치하는지 재확인한다.
const THUMBNAIL_S3_KEY = 'boardEvent'

const createDraftId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

/**
 * 현재 dev-api 의 첨부 응답에는 kind 가 없다(PR #336 머지 전, {id, fileUrl, fileName} 뿐).
 * 그대로 복원하면 kind 가 undefined 가 되어 저장 시 링크 분기로 떨어지고
 * { url: undefined } 를 보내 서버가 400 을 준다. 구계약에는 링크 첨부가 없으므로
 * 파일 흔적이 있으면 FILE 로 본다.
 */
const resolveKind = (attachment: AttachmentResponse): AttachmentDraft['kind'] =>
  attachment.kind ?? (attachment.fileKey || attachment.fileName ? 'FILE' : 'LINK')

export default function EventBoardEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const idParam = searchParams.get('id')
  const id = idParam ? Number(idParam) : NaN

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [organizingTeam, setOrganizingTeam] = useState<EventOrganizingTeam | ''>('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
  // 새 썸네일을 올리지 않으면 undefined로 보낸다 — 서버는 thumbnailKey가 null이면
  // 기존 값을 유지한다 (EventBoard.update(): "if (thumbnailKey != null) this.thumbnailKey = ...").
  // 상세 응답이 thumbnailKey 자체를 안 주므로 이 partial-update 의미론에 기대는 것이 유일한 방법이다.
  const [thumbnailKey, setThumbnailKey] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false)
      setLoadError('잘못된 접근입니다.')
      return
    }

    let alive = true
    fetchEventDetail(id)
      .then((detail) => {
        if (!alive) return
        setTitle(detail.title)
        setEventStartDate(detail.eventStartDate)
        setEventEndDate(detail.eventEndDate)
        setOrganizingTeam((detail.organizingTeam ?? '') as EventOrganizingTeam | '')
        setContent(detail.content)
        setIsPublished(detail.isPublished)
        setThumbnailPreview(detail.thumbnailUrl)
        setAttachments(
          detail.attachments.map((attachment) => ({
            id: createDraftId(),
            kind: resolveKind(attachment),
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
  }, [id])

  const handleThumbnailSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      setThumbnailPreview(URL.createObjectURL(file))
      setThumbnailUploading(true)
      try {
        const { key, uploadUrl } = await requestPresignedUpload(apiClient, file, THUMBNAIL_S3_KEY)
        await uploadFileToS3(uploadUrl, file)
        setThumbnailKey(key)
      } catch {
        setErrorMessage('썸네일 업로드에 실패했습니다.')
      } finally {
        setThumbnailUploading(false)
      }
    },
    [apiClient]
  )

  const handleSubmit = useCallback(async () => {
    if (!Number.isFinite(id)) return
    if (!title.trim() || !eventStartDate || !eventEndDate || !organizingTeam || !content.trim()) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await updateEvent(apiClient, id, {
        title: title.trim(),
        eventStartDate,
        eventEndDate,
        organizingTeam,
        thumbnailKey: thumbnailKey ?? undefined,
        content,
        isPublished,
        attachments: attachments
          .filter((item) => item.status === 'done')
          .map((item) =>
            item.kind === 'FILE'
              ? { fileKey: item.fileKey, fileName: item.fileName }
              : { url: item.url }
          )
      })
      router.push(`/board/events/detail?id=${id}`)
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage('수정에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [
    apiClient,
    attachments,
    content,
    eventEndDate,
    eventStartDate,
    id,
    isPublished,
    organizingTeam,
    router,
    thumbnailKey,
    title
  ])

  if (!hasAtLeast(user?.userRole, 'CORE')) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2">수정 권한이 없습니다.</p>
      </main>
    )
  }

  if (loading) {
    return <p className="py-16 text-center text-white typo-pc-b2">불러오는 중...</p>
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 text-red">{loadError}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <GdgSiteHeader
        menus={BOARD_MENUS}
        actionMenu={{ label: '내 정보', url: '/profile/' }}
      />
      <div className="mx-auto w-full max-w-[720px] space-y-6 px-6 py-10">
        <h1 className="typo-pc-h3 mobile:typo-m-h2">행사 게시글 수정</h1>

        <GdgInputField
          label="제목"
          fullWidth
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-2">
            <span className="typo-pc-s3 uppercase tracking-[0.2em] text-white/80">시작일</span>
            <input
              type="date"
              value={eventStartDate}
              onChange={(event) => setEventStartDate(event.target.value)}
              className="h-11 rounded-full border border-gray-800 bg-black px-4 text-white"
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="typo-pc-s3 uppercase tracking-[0.2em] text-white/80">종료일</span>
            <input
              type="date"
              value={eventEndDate}
              onChange={(event) => setEventEndDate(event.target.value)}
              className="h-11 rounded-full border border-gray-800 bg-black px-4 text-white"
            />
          </label>
        </div>

        <GdgDropdown
          label="주최 팀"
          options={TEAM_OPTIONS}
          value={organizingTeam}
          onChange={(value) => setOrganizingTeam(value as EventOrganizingTeam)}
        />

        <div className="flex flex-col gap-2">
          <span className="typo-pc-s3 uppercase tracking-[0.2em] text-white/80">썸네일</span>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbnailSelect}
          />
          <GdgButton
            variant="bordered"
            onClick={() => thumbnailInputRef.current?.click()}
            disabled={thumbnailUploading}
          >
            {thumbnailUploading ? '업로드 중...' : '이미지 변경'}
          </GdgButton>
          {thumbnailPreview && (
            <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl bg-gray-100">
              <Image src={thumbnailPreview} alt="" fill className="object-cover" />
            </div>
          )}
        </div>

        <GdgTextarea
          label="내용"
          fullWidth
          rows={10}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        <label className="flex items-center gap-2 typo-pc-b3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          공개
        </label>

        <div className="flex flex-col gap-2">
          <span className="typo-pc-s3 uppercase tracking-[0.2em] text-white/80">첨부</span>
          <AttachmentUploader
            attachments={attachments}
            onChange={setAttachments}
            apiClient={apiClient}
            s3key={THUMBNAIL_S3_KEY}
          />
        </div>

        {errorMessage && <p className="typo-pc-b3 text-red">{errorMessage}</p>}

        <GdgButton variant="active" fullWidth onClick={handleSubmit} loading={submitting}>
          저장
        </GdgButton>
      </div>
    </main>
  )
}
