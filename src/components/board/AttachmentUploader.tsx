'use client'

import type { AxiosInstance } from 'axios'
import { Reorder } from 'framer-motion'
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction
} from 'react'

import { DUSK_INPUT } from '@/components/ui/dusk/DuskForm'
import {
  describeUploadError,
  requestPresignedUpload,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import type { AttachmentKind } from '@/types/board'
import { cn } from '@/utils/cn'

export type AttachmentDraftStatus = 'uploading' | 'done' | 'error'

export interface AttachmentDraft {
  id: string
  kind: AttachmentKind
  fileName?: string
  fileKey?: string
  url?: string
  status: AttachmentDraftStatus
  errorMessage?: string
  /** 업로드 실패 시 재시도하려면 원본 File이 필요하다. 서버로는 절대 보내지 않는다
   *  (AttachmentEntry에는 이 필드가 없다) — 화면 상태로만 들고 있는다. */
  file?: File
}

export interface AttachmentUploaderProps {
  attachments: AttachmentDraft[]
  /**
   * 업로드는 비동기라 완료 시점의 목록이 시작 시점과 다를 수 있다. 갱신을 항상 함수형으로
   * 넘길 수 있어야 진행 중인 업로드가 그 사이 추가된 항목을 지우지 않는다.
   */
  onChange: Dispatch<SetStateAction<AttachmentDraft[]>>
  apiClient: AxiosInstance
  s3key: string
  maxCount?: number
}

const MAX_COUNT_DEFAULT = 10

const createDraftId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export function AttachmentUploader({
  attachments,
  onChange,
  apiClient,
  s3key,
  maxCount = MAX_COUNT_DEFAULT
}: AttachmentUploaderProps) {
  const [linkInput, setLinkInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isFull = attachments.length >= maxCount
  const hasPendingLink = linkInput.trim().length > 0

  // 렌더 시점의 attachments 를 닫아 두면 업로드가 끝나는 순간 그 사이에 추가된 항목이
  // 통째로 지워진다. 함수형으로 최신 목록을 받아 갱신한다.
  const updateDraft = useCallback(
    (id: string, patch: Partial<AttachmentDraft>) => {
      onChange((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    },
    [onChange]
  )

  const uploadFile = useCallback(
    async (file: File, id: string) => {
      try {
        const { key, uploadUrl } = await requestPresignedUpload(apiClient, file, s3key)
        await uploadFileToS3(uploadUrl, file)
        updateDraft(id, { status: 'done', fileKey: key, fileName: file.name })
      } catch (err) {
        updateDraft(id, { status: 'error', errorMessage: describeUploadError(err) })
      }
    },
    [apiClient, s3key, updateDraft]
  )

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || isFull) return

      const id = createDraftId()

      // 크기 초과는 재시도해도 결과가 같으므로 file 을 들려 보내지 않는다 — 재시도 버튼이 뜨지 않는다.
      const sizeError = validateUploadSize(file)
      if (sizeError) {
        onChange((prev) => [
          ...prev,
          { id, kind: 'FILE', fileName: file.name, status: 'error', errorMessage: sizeError }
        ])
        return
      }

      onChange((prev) => [
        ...prev,
        { id, kind: 'FILE', fileName: file.name, status: 'uploading', file }
      ])
      void uploadFile(file, id)
    },
    [isFull, onChange, uploadFile]
  )

  const handleRetry = useCallback(
    (draft: AttachmentDraft) => {
      if (!draft.file) return
      updateDraft(draft.id, { status: 'uploading', errorMessage: undefined })
      void uploadFile(draft.file, draft.id)
    },
    [updateDraft, uploadFile]
  )

  const handleAddLink = useCallback(() => {
    const url = linkInput.trim()
    if (!url || isFull) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) return

    onChange([...attachments, { id: createDraftId(), kind: 'LINK', url, status: 'done' }])
    setLinkInput('')
  }, [attachments, isFull, linkInput, onChange])

  const handleRemove = useCallback(
    (id: string) => {
      onChange(attachments.filter((item) => item.id !== id))
    },
    [attachments, onChange]
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <Reorder.Group
        axis="y"
        values={attachments}
        onReorder={onChange}
        className="flex flex-col gap-2"
      >
        {attachments.map((draft) => (
          <Reorder.Item key={draft.id} value={draft}>
            {draft.status === 'error' ? (
              <div className="flex items-center gap-3 rounded-[10px] border border-[rgba(196,88,74,0.4)] bg-[rgba(196,88,74,0.08)] px-4 py-[9px] text-sm text-signal-err">
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {draft.fileName ?? draft.url} — {draft.errorMessage}
                </span>
                {draft.file && (
                  <button
                    type="button"
                    className="shrink-0 underline"
                    onClick={() => handleRetry(draft)}
                  >
                    재시도
                  </button>
                )}
                <button
                  type="button"
                  className="shrink-0 underline"
                  onClick={() => handleRemove(draft.id)}
                >
                  삭제
                </button>
              </div>
            ) : (
              <div className="flex cursor-grab items-center gap-3 rounded-[10px] bg-[rgba(240,234,228,0.06)] px-4 py-[9px] text-[15px] text-dusk-ink-100 active:cursor-grabbing">
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {draft.kind === 'FILE' ? (draft.fileName ?? '') : (draft.url ?? '')}
                </span>
                {draft.status === 'uploading' && (
                  <span className="shrink-0 text-sm text-dusk-ink-800">업로드 중...</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(draft.id)}
                  className="shrink-0 text-sm text-dusk-ink-800 transition-colors hover:text-signal-err"
                >
                  삭제
                </button>
              </div>
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      {/* 파일 선택은 자체 행에 둔다. 아래 링크 입력칸과 같은 행에 넣으면 좁은 화면에서
          눌려 '+ 파일 선택' 이 세로로 쪼개진다. */}
      <button
        type="button"
        disabled={isFull}
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-xl border border-[rgba(240,234,228,0.22)] px-6 py-[15px] text-[15px] text-dusk-ink-100 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:bg-[rgba(208,129,85,0.06)] disabled:opacity-50 disabled:hover:border-[rgba(240,234,228,0.22)] disabled:hover:bg-transparent"
      >
        + 파일 선택
      </button>

      <div className="flex w-full items-center gap-2.5">
        <input
          type="text"
          placeholder="https://"
          value={linkInput}
          onChange={(event) => setLinkInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAddLink()
            }
          }}
          disabled={isFull}
          className={cn('min-w-0 flex-1', DUSK_INPUT)}
        />
        <button
          type="button"
          onClick={handleAddLink}
          disabled={isFull}
          className="shrink-0 whitespace-nowrap text-[15px] text-dusk-ink-100 underline transition-colors hover:text-ember disabled:opacity-50"
        >
          링크 추가
        </button>
      </div>

      {/* 입력만 하고 등록하면 그 URL 은 아무 데도 저장되지 않는다. 조용히 사라지는 대신
          알려준다 — 실제로 이걸 모르고 첨부가 안 됐다는 보고가 있었다. */}
      {hasPendingLink && (
        <p className="text-[13px] text-signal-err">
          입력한 링크는 아직 첨부되지 않았습니다. &lsquo;링크 추가&rsquo;를 눌러 주세요.
        </p>
      )}

      {isFull && (
        <p className="text-[13px] text-dusk-ink-800">
          첨부는 최대 {maxCount}개까지 등록할 수 있습니다.
        </p>
      )}
    </div>
  )
}
