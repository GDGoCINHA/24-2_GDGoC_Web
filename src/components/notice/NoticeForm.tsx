'use client'

import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent
} from 'react'
import { Link2, Trash2 } from 'lucide-react'

import { NoticeDropdown } from '@/components/notice/NoticeDropdown'
import { NoticeFileCard } from '@/components/notice/NoticeFileCard'
import { NoticeUploadButton } from '@/components/notice/NoticeUploadButton'
import { NOTICE_CATEGORY_LABEL } from '@/constant/notice'
import {
  NOTICE_CATEGORIES,
  type NoticeAttachmentInput,
  type NoticeCategory
} from '@/services/notice/noticeApi'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i

export interface NoticeFormState {
  category?: NoticeCategory
  title: string
  content: string
  attachments: NoticeAttachmentInput[]
}

export interface NoticeFormProps {
  value: NoticeFormState
  onChange: (next: NoticeFormState) => void
}

const fileToAttachment = (f: File): NoticeAttachmentInput => ({
  kind: 'file',
  name: f.name,
  url: URL.createObjectURL(f),
  sizeBytes: f.size
})

const isImageAttachment = (att: NoticeAttachmentInput): boolean =>
  att.kind === 'file' && IMAGE_EXT_RE.test(att.name)

const attachmentKind = (att: NoticeAttachmentInput): 'file' | 'image' | 'link' => {
  if (att.kind === 'link') return 'link'
  return isImageAttachment(att) ? 'image' : 'file'
}

const categoryOptions = NOTICE_CATEGORIES.map((c) => ({
  id: c,
  label: NOTICE_CATEGORY_LABEL[c]
}))

export const NoticeForm = ({ value, onChange }: NoticeFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [linkDraft, setLinkDraft] = useState('')

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, title: e.target.value })
  }

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...value, content: e.target.value })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newAttachments = Array.from(files).map(fileToAttachment)
    onChange({ ...value, attachments: [...value.attachments, ...newAttachments] })
    e.target.value = ''
  }

  const handleRemoveAttachment = (idx: number) => {
    onChange({
      ...value,
      attachments: value.attachments.filter((_, i) => i !== idx)
    })
  }

  // 등록된 link 첨부의 URL을 인라인으로 수정
  const updateLinkUrl = (idx: number, nextUrl: string) => {
    onChange({
      ...value,
      attachments: value.attachments.map((att, i) =>
        i === idx && att.kind === 'link'
          ? { ...att, url: nextUrl, name: nextUrl }
          : att
      )
    })
  }

  // 링크 input의 값을 첨부 리스트에 commit (Enter 또는 blur 시점)
  const commitLinkDraft = () => {
    const url = linkDraft.trim()
    if (!url) return
    onChange({
      ...value,
      attachments: [...value.attachments, { kind: 'link', name: url, url }]
    })
    setLinkDraft('')
  }

  const handleLinkKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitLinkDraft()
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 본문 영역 — 카테고리 / 제목 / 에디터 / 내용 */}
      <div className="flex w-full flex-col gap-4">
        {/* 카테고리 선택 드롭다운 */}
        <NoticeDropdown
          options={categoryOptions}
          value={value.category}
          onChange={(c) => onChange({ ...value, category: c as NoticeCategory })}
          placeholder="카테고리 선택"
          width="w-full"
        />

        {/* 제목 / 에디터 / 내용 3단 */}
        <div className="flex w-full flex-col">
          <div className="rounded-t-2xl border border-gray-800 px-4 py-3">
            <input
              type="text"
              value={value.title}
              onChange={handleTitleChange}
              placeholder="제목을 입력하세요."
              className="w-full bg-transparent typo-b2 text-white outline-none placeholder:text-gray-700"
            />
          </div>
          <div className="flex h-10 w-full items-center justify-center bg-gray-900">
            <p className="typo-b2 text-black">텍스트 에디터 영역</p>
          </div>
          <div className="rounded-b-2xl border border-gray-800 px-4 py-3">
            <textarea
              value={value.content}
              onChange={handleContentChange}
              placeholder="내용을 입력하세요."
              className="block h-[296px] w-full resize-none bg-transparent typo-b2 text-white outline-none placeholder:text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* 첨부자료 영역 */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="pl-2 typo-h5 text-white">첨부자료</h2>
          <p className="typo-c1 text-gray-700">다중 파일 업로드 가능</p>
        </div>

        {/* 추가된 첨부 카드들 — link는 항상 하단에 위치하도록 정렬 (원본 인덱스 추적해서 핸들러 동작 유지) */}
        {value.attachments
          .map((att, originalIdx) => ({ att, originalIdx }))
          .sort((a, b) => {
            if (a.att.kind === 'link' && b.att.kind !== 'link') return 1
            if (a.att.kind !== 'link' && b.att.kind === 'link') return -1
            return 0
          })
          .map(({ att, originalIdx }) => {
            // 링크 첨부는 인라인 편집 가능한 input 카드로 렌더 — 클릭/타이핑 즉시 반영
            if (att.kind === 'link') {
              return (
                <div key={originalIdx} className="flex w-full items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5">
                    <Link2 size={16} strokeWidth={2} className="shrink-0 text-white" />
                    <input
                      type="text"
                      value={att.url}
                      onChange={(e) => updateLinkUrl(originalIdx, e.target.value)}
                      placeholder="http://"
                      className="flex-1 bg-transparent typo-b2 text-white outline-none placeholder:text-gray-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(originalIdx)}
                    aria-label={`${att.name} 삭제`}
                    className="text-white transition-opacity hover:opacity-70"
                  >
                    <Trash2 size={20} strokeWidth={2} />
                  </button>
                </div>
              )
            }
            // 파일/이미지 첨부는 그대로 NoticeFileCard 사용
            return (
              <NoticeFileCard
                key={originalIdx}
                kind={attachmentKind(att)}
                fileName={att.name}
                sizeBytes={att.kind === 'file' ? att.sizeBytes : undefined}
                action="remove"
                onRemove={() => handleRemoveAttachment(originalIdx)}
              />
            )
          })}

        {/* 항상 보이는 링크 input — Enter 또는 blur 시 첨부 리스트에 추가됨 */}
        <div className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5">
          <Link2 size={16} strokeWidth={2} className="shrink-0 text-white" />
          <input
            type="text"
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            onBlur={commitLinkDraft}
            placeholder="http://"
            className="flex-1 bg-transparent typo-b2 text-white outline-none placeholder:text-gray-700"
          />
        </div>

        {/* 파일 선택 버튼 */}
        <NoticeUploadButton onClick={() => fileInputRef.current?.click()} />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
