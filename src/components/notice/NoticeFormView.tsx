'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

import { NoticeForm, type NoticeFormState } from '@/components/notice/NoticeForm'
import { NoticePinLimitModal } from '@/components/notice/NoticePinLimitModal'
import {
  isNoticePinLimitError,
  noticeApi,
  type Notice,
  type NoticeVisibility
} from '@/services/notice/noticeApi'
import { useNoticeDetail } from '@/services/notice/useNoticeDetail'
import { useNoticeMutations } from '@/services/notice/useNoticeMutations'
import { cn } from '@/utils/cn'

export type NoticeFormMode = 'create' | 'edit'

export interface NoticeFormViewProps {
  mode: NoticeFormMode
  id?: string
}

const EMPTY_STATE: NoticeFormState = {
  title: '',
  content: '',
  attachments: []
}

interface RadioOptionProps {
  checked: boolean
  onClick: () => void
  label: string
}

const RadioOption = ({ checked, onClick, label }: RadioOptionProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={checked}
    className="flex items-center gap-2"
  >
    <span className="relative flex size-4 items-center justify-center rounded-full border border-white">
      {checked && <span className="size-2 rounded-full bg-red" />}
    </span>
    <span className="typo-b3 text-white">{label}</span>
  </button>
)

export const NoticeFormView = ({ mode, id }: NoticeFormViewProps) => {
  const router = useRouter()
  const isEdit = mode === 'edit'

  const { data: notice, loading: loadingNotice } = useNoticeDetail(isEdit ? id : null)
  const { create, update, pending } = useNoticeMutations()

  const [form, setForm] = useState<NoticeFormState>(EMPTY_STATE)
  const [visibility, setVisibility] = useState<NoticeVisibility>('PUBLIC')
  const [isPinned, setIsPinned] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [prefilled, setPrefilled] = useState(false)
  const [pinLimitModal, setPinLimitModal] = useState<Notice[] | null>(null)
  const popoverWrapperRef = useRef<HTMLDivElement>(null)

  // edit 모드: 공지 로드 후 1회 폼 + 메타 prefill
  useEffect(() => {
    if (!isEdit || !notice || prefilled) return
    setForm({
      category: notice.category,
      title: notice.title,
      content: notice.content,
      attachments: notice.attachments.map((a) =>
        a.kind === 'link'
          ? { kind: 'link', name: a.name, url: a.url }
          : {
              kind: 'file',
              name: a.name,
              url: a.url,
              sizeBytes: a.sizeBytes ?? 0
            }
      )
    })
    setVisibility(notice.visibility)
    setIsPinned(notice.isPinned)
    setPrefilled(true)
  }, [isEdit, notice, prefilled])

  // 팝오버 외부 클릭 닫기
  useEffect(() => {
    if (!popoverOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!popoverWrapperRef.current?.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [popoverOpen])

  const titleLabel = isEdit ? '공지사항 수정' : '공지사항 글쓰기'
  const submitLabel = isEdit ? '수정' : '등록'

  const handleSaveDraft = () => {
    // TODO: localStorage 기반 임시저장 — 별도 PR로 분리
    window.alert('임시등록 기능은 준비 중입니다.')
  }

  const handleSubmitButtonClick = () => {
    if (pending) return
    setPopoverOpen((v) => !v)
  }

  // 실제 create/update 수행 + 라우팅. 핀 한도 모달의 재시도에서도 재사용.
  const performSubmit = async (pinFlag: boolean) => {
    if (!form.category) return
    if (isEdit && id) {
      await update(id, {
        category: form.category,
        title: form.title,
        content: form.content,
        visibility,
        isPinned: pinFlag,
        attachments: form.attachments
      })
      router.replace(`/notice/${id}`)
    } else {
      await create({
        category: form.category,
        title: form.title,
        content: form.content,
        visibility,
        isPinned: pinFlag,
        attachments: form.attachments
      })
      router.replace('/notice')
    }
  }

  const handleConfirmSubmit = async () => {
    if (pending) return
    if (!form.category) {
      window.alert('카테고리를 선택해주세요.')
      return
    }
    if (!form.title.trim()) {
      window.alert('제목을 입력해주세요.')
      return
    }
    if (!form.content.trim()) {
      window.alert('내용을 입력해주세요.')
      return
    }
    setPopoverOpen(false)
    try {
      await performSubmit(isPinned)
    } catch (err) {
      if (isNoticePinLimitError(err)) {
        // 핀 한도 초과 — 기존 핀 3개 fetch해서 모달 표시
        try {
          const pinned = await noticeApi.listPinned()
          setPinLimitModal(pinned)
        } catch {
          window.alert('상단 고정은 최대 3개까지 가능합니다.')
        }
        return
      }
      window.alert(err instanceof Error ? err.message : '저장 실패')
    }
  }

  // 핀 한도 모달에서 unpin 대상 선택 후 등록 클릭 시
  const handlePinReplace = async (unpinTargetId: string) => {
    setPinLimitModal(null)
    try {
      // 1. 기존 핀 하나 unpin
      await update(unpinTargetId, { isPinned: false })
      // 2. 원래 의도대로 다시 등록/수정 (핀 슬롯 비었으니 성공)
      await performSubmit(true)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '핀 교체 실패')
    }
  }

  if (isEdit && loadingNotice) {
    return (
      <main className="bg-black text-white">
        <div className="mx-auto w-[1280px] px-[80px] pt-14 pb-[120px]">
          <p className="py-12 text-center typo-b3 text-gray-700">불러오는 중...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative bg-black text-white">
      {/* 팝오버 열렸을 때 배경 어둡게 */}
      {popoverOpen && (
        <div className="fixed inset-0 z-10 bg-black/30" aria-hidden />
      )}

      <div className="relative mx-auto w-[1280px] px-[80px] pt-14 pb-[120px]">
        <div className="flex w-full items-center justify-between">
          <h1 className="typo-h4 text-white">{titleLabel}</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-full border border-red px-4 py-1.5 typo-b3 text-white transition-opacity hover:opacity-90"
            >
              임시등록 | 0
            </button>
            <div ref={popoverWrapperRef} className="relative z-20">
              <button
                type="button"
                onClick={handleSubmitButtonClick}
                disabled={pending}
                aria-haspopup="dialog"
                aria-expanded={popoverOpen}
                className="rounded-full bg-red px-4 py-1.5 typo-b3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitLabel}
              </button>
              {popoverOpen && (
                <div
                  role="dialog"
                  className="absolute right-0 top-full mt-2 w-[200px] overflow-hidden rounded-2xl bg-gray-100 px-4 py-3 shadow-xl"
                >
                  {/* 공개 설정 */}
                  <div className="flex flex-col gap-2">
                    <p className="typo-s3 text-white">공개 설정</p>
                    <div className="flex h-5 items-center gap-8">
                      <RadioOption
                        checked={visibility === 'PUBLIC'}
                        onClick={() => setVisibility('PUBLIC')}
                        label="공개"
                      />
                      <RadioOption
                        checked={visibility === 'PRIVATE'}
                        onClick={() => setVisibility('PRIVATE')}
                        label="비공개"
                      />
                    </div>
                  </div>

                  {/* 상단 고정 */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="typo-s3 text-white">상단 고정</p>
                      <button
                        type="button"
                        onClick={() => setIsPinned((v) => !v)}
                        aria-pressed={isPinned}
                        className={cn(
                          'flex size-5 items-center justify-center rounded-[4px] transition-colors',
                          isPinned ? 'bg-red' : 'border border-white'
                        )}
                      >
                        {isPinned && (
                          <Check size={14} strokeWidth={3} className="text-white" />
                        )}
                      </button>
                    </div>
                    <p className="typo-c2 text-white">
                      * 최대 3개까지 고정할 수 있습니다.
                    </p>
                  </div>

                  {/* 등록/수정 확정 버튼 */}
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={pending}
                    className="mt-4 w-full rounded-full bg-red px-12 py-2 text-center typo-s3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {submitLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14">
          <NoticeForm value={form} onChange={setForm} />
        </div>
      </div>

      {/* 핀 한도 초과 모달 */}
      {pinLimitModal && form.category && (
        <NoticePinLimitModal
          pinnedNotices={pinLimitModal}
          newDraft={{
            category: form.category,
            title: form.title || '새로운 게시글',
            authorName: '본인',
            createdAt: new Date().toISOString(),
            viewCount: 0
          }}
          onCancel={() => setPinLimitModal(null)}
          onConfirm={handlePinReplace}
        />
      )}
    </main>
  )
}
