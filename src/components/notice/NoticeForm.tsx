'use client'

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent
} from 'react'
import {
  Check,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Link2,
  Trash2
} from 'lucide-react'

import { NOTICE_CATEGORY_LABEL } from '@/constant/notice'
import {
  NOTICE_CATEGORIES,
  type NoticeAttachmentInput,
  type NoticeCategory
} from '@/services/notice/noticeApi'
import { cn } from '@/utils/cn'

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

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0.00mb'
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)}mb`
}

const isImageAttachment = (att: NoticeAttachmentInput): boolean =>
  att.kind === 'file' && IMAGE_EXT_RE.test(att.name)

const AttachmentIcon = ({ att }: { att: NoticeAttachmentInput }) => {
  if (att.kind === 'link')
    return <Link2 size={16} strokeWidth={2} className="shrink-0 text-white" />
  if (isImageAttachment(att))
    return <ImageIcon size={16} strokeWidth={2} className="shrink-0 text-white" />
  return <FileText size={16} strokeWidth={2} className="shrink-0 text-white" />
}

export const NoticeForm = ({ value, onChange }: NoticeFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')

  // 외부 클릭 시 카테고리 드롭다운 닫기
  useEffect(() => {
    if (!categoryOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!categoryRef.current?.contains(e.target as Node)) setCategoryOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [categoryOpen])

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

  const handleCategorySelect = (c: NoticeCategory) => {
    onChange({ ...value, category: c })
    setCategoryOpen(false)
  }

  const handleRemoveAttachment = (idx: number) => {
    onChange({
      ...value,
      attachments: value.attachments.filter((_, i) => i !== idx)
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
        <div ref={categoryRef} className="relative w-full">
          <button
            type="button"
            onClick={() => setCategoryOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
            className="flex h-11 w-full items-center justify-between rounded-full border border-gray-800 bg-black px-4 py-2 typo-b2 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span className={cn(value.category ? 'text-white' : 'text-gray-700')}>
              {value.category ? NOTICE_CATEGORY_LABEL[value.category] : '카테고리 선택'}
            </span>
            <ChevronDown size={12} className="text-white" />
          </button>
          {categoryOpen && (
            <ul
              role="listbox"
              className="absolute left-0 top-[52px] z-10 flex w-full flex-col rounded-[12px] bg-gray-100 py-2 shadow-lg"
            >
              {NOTICE_CATEGORIES.map((c) => {
                const selected = value.category === c
                return (
                  <li key={c} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(c)}
                      className="group flex w-full items-center px-2"
                    >
                      <span className="flex h-9 w-full items-center justify-between rounded-lg px-3 typo-b2 text-white transition-colors group-hover:bg-white group-hover:text-black">
                        <span>{NOTICE_CATEGORY_LABEL[c]}</span>
                        {selected && <Check size={16} strokeWidth={2.4} />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

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

        {/* 추가된 첨부 카드들 */}
        {value.attachments.map((att, idx) => (
          <div key={idx} className="flex w-full items-center gap-2">
            <div className="flex flex-1 items-center gap-4 rounded-lg bg-gray-100 px-4 py-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <AttachmentIcon att={att} />
                <p className="flex-1 truncate typo-b2 text-white">{att.name}</p>
              </div>
              {att.kind === 'file' && (
                <p className="whitespace-nowrap text-right typo-b2 text-gray-700">
                  {formatFileSize(att.sizeBytes)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveAttachment(idx)}
              aria-label={`${att.name} 삭제`}
              className="text-white transition-opacity hover:opacity-70"
            >
              <Trash2 size={20} strokeWidth={2} />
            </button>
          </div>
        ))}

        {/* 항상 보이는 링크 input — Enter 또는 blur 시 첨부 리스트에 추가됨 */}
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5">
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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-lg bg-red px-4 py-2.5 typo-b2 text-white transition-opacity hover:opacity-90"
        >
          + 파일 선택
        </button>
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
