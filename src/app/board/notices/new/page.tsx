'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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
import { createNotice } from '@/services/board/noticeClient'
import { NOTICE_CATEGORY_LABEL, type NoticeCategory } from '@/types/notice'
import { hasAtLeast } from '@/utils/auth/role'

const CATEGORY_OPTIONS = Object.keys(NOTICE_CATEGORY_LABEL) as NoticeCategory[]

// S3KeyType enum의 '이름' 그대로다 (value 'board/notice'가 아니다).
// 요청 DTO의 s3key 필드 타입이 S3KeyType이라 jackson이 enum 이름으로 역직렬화한다.
const NOTICE_S3_KEY = 'boardNotice'

export default function NoticeBoardNewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<NoticeCategory | ''>('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { uploading: contentImageUploading, handlePaste: handleContentPaste } =
    useContentImagePaste({ apiClient, s3key: NOTICE_S3_KEY, setContent, setErrorMessage })

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !category || !content.trim()) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const id = await createNotice(apiClient, {
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
        setErrorMessage('등록에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [apiClient, attachments, category, content, isPublished, router, title])

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
        <BoardFormHeader backHref="/board/notices/" title="공지사항 작성" />

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

          {/* 임시저장은 별도 status가 아니라 isPublished=false 하나로 표현된다 (백엔드 설계 §3). */}
          <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-dusk-ink-400">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="size-[17px] cursor-pointer accent-ember"
            />
            즉시 공개 (해제하면 임시저장)
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
              {submitting ? '등록 중...' : '등록'}
            </button>
            <Link href="/board/notices/" className={DUSK_CANCEL_BUTTON}>
              취소
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
