'use client'

import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, type ChangeEvent } from 'react'

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

const TEAM_OPTIONS: GdgDropdownOption[] = [
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
      <main className="min-h-screen bg-black px-6 py-16 text-center text-white">
        <p className="typo-pc-b2 mobile:typo-m-b2">글쓰기 권한이 없습니다.</p>
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
        <h1 className="typo-pc-h3 mobile:typo-m-h2">행사 게시글 작성</h1>

        <GdgInputField
          label="제목"
          fullWidth
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-2">
            <span className="typo-pc-s3 mobile:typo-m-s3 uppercase tracking-[0.2em] text-white/80">시작일</span>
            <input
              type="date"
              value={eventStartDate}
              onChange={(event) => setEventStartDate(event.target.value)}
              className="h-11 rounded-full border border-gray-800 bg-black px-4 text-white"
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="typo-pc-s3 mobile:typo-m-s3 uppercase tracking-[0.2em] text-white/80">종료일</span>
            <input
              type="date"
              value={eventEndDate}
              onChange={(event) => setEventEndDate(event.target.value)}
              className="h-11 rounded-full border border-gray-800 bg-black px-4 text-white"
            />
          </label>
        </div>

        <GdgDropdown
          // 기본 size=small(122px) 은 플레이스홀더를 담지 못하고 잘린다.
          size="medium"
          label="주최 팀"
          options={TEAM_OPTIONS}
          value={organizingTeam}
          onChange={(value) => setOrganizingTeam(value as EventOrganizingTeam)}
        />

        <div className="flex flex-col gap-2">
          <span className="typo-pc-s3 mobile:typo-m-s3 uppercase tracking-[0.2em] text-white/80">썸네일</span>
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
            {thumbnailUploading ? '업로드 중...' : '이미지 선택'}
          </GdgButton>
          {thumbnailPreview && (
            <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl bg-gray-100">
              <Image src={thumbnailPreview} alt="" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <GdgTextarea
            label="내용"
            fullWidth
            rows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onPaste={handleContentPaste}
          />
          <p className="typo-pc-c1 mobile:typo-m-c1 text-gray-500">
            {contentImageUploading
              ? '이미지 올리는 중...'
              : '이미지를 복사해 붙여넣으면 그 자리에 들어갑니다.'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="typo-pc-s3 mobile:typo-m-s3 uppercase tracking-[0.2em] text-white/80">첨부</span>
          <AttachmentUploader
            attachments={attachments}
            onChange={setAttachments}
            apiClient={apiClient}
            s3key={THUMBNAIL_S3_KEY}
          />
        </div>

        {errorMessage && <p className="typo-pc-b3 mobile:typo-m-b3 text-red">{errorMessage}</p>}

        <GdgButton variant="active" fullWidth onClick={handleSubmit} loading={submitting}>
          등록
        </GdgButton>
      </div>
    </main>
  )
}
