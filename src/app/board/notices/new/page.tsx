'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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
import { useContentImagePaste } from '@/hooks/useContentImagePaste'
import { createNotice } from '@/services/board/noticeClient'
import { NOTICE_CATEGORY_LABEL, type NoticeCategory } from '@/types/notice'
import { hasAtLeast } from '@/utils/auth/role'

const CATEGORY_OPTIONS: GdgDropdownOption[] = (
  Object.keys(NOTICE_CATEGORY_LABEL) as NoticeCategory[]
).map((category) => ({ id: category, label: NOTICE_CATEGORY_LABEL[category] }))

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
        <h1 className="typo-pc-h3 mobile:typo-m-h2">공지사항 작성</h1>

        <GdgInputField
          label="제목"
          fullWidth
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <GdgDropdown
          // 기본 size=small(122px) 은 플레이스홀더를 담지 못하고 잘린다.
          size="medium"
          label="분류"
          placeholder="분류를 선택하세요"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(value) => setCategory(value as NoticeCategory)}
        />

        <div className="flex flex-col gap-2">
          <GdgTextarea
            label="내용"
            fullWidth
            rows={12}
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

        {/* 임시저장은 별도 status가 아니라 isPublished=false 하나로 표현된다 (백엔드 설계 §3). */}
        <label className="flex items-center gap-2 typo-pc-b3 mobile:typo-m-b3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          즉시 공개 (해제하면 임시저장)
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
          등록
        </GdgButton>
      </div>
    </main>
  )
}
