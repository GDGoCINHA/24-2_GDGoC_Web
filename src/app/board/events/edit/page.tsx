'use client'

import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'

import { AttachmentUploader, type AttachmentDraft } from '@/components/board/AttachmentUploader'
import {
  BoardField,
  BoardFormHeader,
  BOARD_CANCEL_BUTTON,
  BOARD_INPUT,
  BOARD_OPTION,
  BOARD_SELECT,
  BOARD_SUBMIT_BUTTON,
  BOARD_TEXTAREA
} from '@/components/board/BoardForm'
import { BOARD_MENUS } from '@/components/board/boardMenus'
import { GdgSiteHeader } from '@/components/ui/design-system'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import { fetchEventDetail, updateEvent } from '@/services/board/boardClient'
import {
  describeUploadError,
  requestPresignedUpload,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import { useContentImagePaste } from '@/hooks/useContentImagePaste'
import type { AttachmentResponse, EventOrganizingTeam } from '@/types/board'
import { hasAtLeast } from '@/utils/auth/role'

const TEAM_OPTIONS = [
  { id: 'HQ', label: 'HQ' },
  { id: 'HR', label: 'HR' },
  { id: 'PR_DESIGN', label: 'PR/DESIGN' },
  { id: 'TECH', label: 'TECH' },
  { id: 'BD', label: 'BD' }
]

// 백엔드 S3KeyType.boardEvent("board/event") 와 같은 값. develop·main 양쪽에 배포돼 있다.
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
  // 다른 팀 행사면 서버가 403 을 줄 것을 미리 알아내 폼 대신 안내를 띄운다.
  const [forbidden, setForbidden] = useState(false)

  const [title, setTitle] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [organizingTeam, setOrganizingTeam] = useState<EventOrganizingTeam | ''>('')
  const [content, setContent] = useState('')
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

  const { uploading: contentImageUploading, handlePaste: handleContentPaste } =
    useContentImagePaste({
      apiClient,
      s3key: THUMBNAIL_S3_KEY,
      setContent,
      setErrorMessage
    })

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

        // 서버 규칙(EventBoardService.requireTeamAccess)과 같은 조건이다.
        // CORE 라고 다른 팀 행사를 고칠 수 있는 것이 아니다.
        const allowed =
          hasAtLeast(user?.userRole, 'ORGANIZER') ||
          (user?.team != null && user.team === detail.organizingTeam)
        if (!allowed) {
          setForbidden(true)
          return
        }

        setTitle(detail.title)
        setEventStartDate(detail.eventStartDate)
        setEventEndDate(detail.eventEndDate)
        setOrganizingTeam((detail.organizingTeam ?? '') as EventOrganizingTeam | '')
        setContent(detail.content)
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
  }, [id, user?.team, user?.userRole])

  const handleThumbnailSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      const sizeError = validateUploadSize(file)
      if (sizeError) {
        setErrorMessage(sizeError)
        return
      }

      setErrorMessage(null)
      setThumbnailPreview(URL.createObjectURL(file))
      setThumbnailUploading(true)
      try {
        const { key, uploadUrl } = await requestPresignedUpload(apiClient, file, THUMBNAIL_S3_KEY)
        await uploadFileToS3(uploadUrl, file)
        setThumbnailKey(key)
      } catch (err) {
        setErrorMessage(describeUploadError(err))
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
        // 작성 화면과 같은 이유로 공개 선택지를 두지 않는다. true 로 보내므로 예전에 비공개로
        // 저장돼 목록에서 사라진 글도 한 번 저장하면 다시 드러난다.
        isPublished: true,
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
    organizingTeam,
    router,
    thumbnailKey,
    title
  ])

  if (!hasAtLeast(user?.userRole, 'CORE')) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">수정 권한이 없습니다.</p>
      </main>
    )
  }

  if (forbidden) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">주최 팀만 수정할 수 있습니다.</p>
      </main>
    )
  }

  if (loading) {
    return <p className="py-16 text-center text-[15px] text-dusk-ink-800">불러오는 중...</p>
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
        <BoardFormHeader backHref="/board/events/" title="행사 게시글 수정" />

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

          {/* color-scheme 을 어둡게 잡지 않으면 브라우저가 그리는 달력 아이콘이 검정으로
              나와 배경에 묻힌다. */}
          <div className="flex flex-wrap gap-4">
            <BoardField label="시작일" className="min-w-[150px] flex-1">
              <input
                type="date"
                value={eventStartDate}
                onChange={(event) => setEventStartDate(event.target.value)}
                className={`${BOARD_INPUT} [color-scheme:dark]`}
              />
            </BoardField>
            <BoardField label="종료일" className="min-w-[150px] flex-1">
              <input
                type="date"
                value={eventEndDate}
                onChange={(event) => setEventEndDate(event.target.value)}
                className={`${BOARD_INPUT} [color-scheme:dark]`}
              />
            </BoardField>
          </div>

          <BoardField label="주최 팀" className="max-w-[260px]">
            <select
              value={organizingTeam}
              onChange={(event) => setOrganizingTeam(event.target.value as EventOrganizingTeam)}
              className={BOARD_SELECT}
            >
              {TEAM_OPTIONS.map((option) => (
                <option key={option.id} value={option.id} className={BOARD_OPTION}>
                  {option.label}
                </option>
              ))}
            </select>
          </BoardField>

          <div className="flex flex-col gap-[9px]">
            <span className="text-[13px] text-dusk-ink-700">썸네일</span>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailSelect}
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={thumbnailUploading}
              className="w-full rounded-xl border border-[rgba(240,234,228,0.22)] px-6 py-[15px] text-[15px] text-dusk-ink-100 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:bg-[rgba(208,129,85,0.06)] disabled:opacity-50"
            >
              {thumbnailUploading ? '업로드 중...' : '이미지 변경'}
            </button>
            {thumbnailPreview && (
              <div className="relative mt-1 h-40 w-full overflow-hidden rounded-xl bg-dusk-slot">
                <Image src={thumbnailPreview} alt="" fill className="object-cover" />
              </div>
            )}
          </div>

          <BoardField
            label="내용"
            hint={
              contentImageUploading
                ? '이미지 올리는 중...'
                : '이미지를 복사해 붙여넣으면 그 자리에 들어갑니다.'
            }
          >
            <textarea
              rows={12}
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
              s3key={THUMBNAIL_S3_KEY}
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
            <Link href={`/board/events/detail?id=${id}`} className={BOARD_CANCEL_BUTTON}>
              취소
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
