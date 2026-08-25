'use client'

import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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
import { createFreePost } from '@/services/board/freeClient'
import { hasAtLeast } from '@/utils/auth/role'

// S3KeyType enum의 '이름' 그대로다 (value 'board/free'가 아니다).
// 요청 DTO의 s3key 필드 타입이 S3KeyType이라 jackson이 enum 이름으로 역직렬화한다.
const FREE_S3_KEY = 'boardFree'

export default function FreeBoardNewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { apiClient } = useAuthenticatedApi()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { uploading: contentImageUploading, handlePaste: handleContentPaste } =
    useContentImagePaste({ apiClient, s3key: FREE_S3_KEY, setContent, setErrorMessage })

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const id = await createFreePost(apiClient, {
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
        setErrorMessage('등록에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [apiClient, attachments, content, router, title])

  // 공지·행사가 CORE 이상인 것과 다르다. 자유게시판은 회원이면 누구나 쓴다.
  if (!hasAtLeast(user?.userRole, 'MEMBER')) {
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
        <BoardFormHeader backHref="/board/free/" title="자유게시판 작성" />

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
              {submitting ? '등록 중...' : '등록'}
            </button>
            <Link href="/board/free/" className={BOARD_CANCEL_BUTTON}>
              취소
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
