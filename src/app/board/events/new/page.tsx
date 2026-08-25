'use client'

import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, type ChangeEvent } from 'react'

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
import { createEvent } from '@/services/board/boardClient'
import {
  describeUploadError,
  requestPresignedUpload,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import { useContentImagePaste } from '@/hooks/useContentImagePaste'
import type { EventOrganizingTeam } from '@/types/board'
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

export default function EventBoardNewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [title, setTitle] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [organizingTeam, setOrganizingTeam] = useState<EventOrganizingTeam | ''>('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
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
        setThumbnailPreview(null)
      } finally {
        setThumbnailUploading(false)
      }
    },
    [apiClient]
  )

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !eventStartDate || !eventEndDate || !organizingTeam || !content.trim()) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const id = await createEvent(apiClient, {
        title: title.trim(),
        eventStartDate,
        eventEndDate,
        organizingTeam,
        thumbnailKey: thumbnailKey ?? undefined,
        content,
        // 행사 목록 응답에 isPublished 가 없어 임시저장 뱃지를 띄울 수 없다. 비공개로 저장하면
        // 작성자도 목록에서 글을 찾지 못하므로 선택지를 없애고 항상 공개로 등록한다.
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
        setErrorMessage('등록에 실패했습니다.')
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
    organizingTeam,
    router,
    thumbnailKey,
    title
  ])

  if (!hasAtLeast(user?.userRole, 'CORE')) {
    return (
      <main className="min-h-screen px-6 py-16 text-center">
        <p className="text-base text-dusk-ink-600">글쓰기 권한이 없습니다.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <GdgSiteHeader menus={BOARD_MENUS} actionMenu={{ label: '내 정보', url: '/profile/' }} />
      <div className="mx-auto w-full max-w-[720px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-11">
        <BoardFormHeader backHref="/board/events/" title="행사 게시글 작성" />

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
              {thumbnailUploading ? '업로드 중...' : '이미지 선택'}
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
              {submitting ? '등록 중...' : '등록'}
            </button>
            <Link href="/board/events/" className={BOARD_CANCEL_BUTTON}>
              취소
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
