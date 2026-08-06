'use client'

import type { AxiosInstance } from 'axios'
import { Reorder } from 'framer-motion'
import { useCallback, useRef, useState, type ChangeEvent } from 'react'

import { GdgFileCard, GdgInputField, GdgUploadButton } from '@/components/ui/design-system'
import { requestPresignedUpload, uploadFileToS3 } from '@/services/board/uploadClient'
import type { AttachmentKind } from '@/types/board'

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
  onChange: (attachments: AttachmentDraft[]) => void
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

  const updateDraft = useCallback(
    (id: string, patch: Partial<AttachmentDraft>) => {
      onChange(attachments.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    },
    [attachments, onChange]
  )

  const uploadFile = useCallback(
    async (file: File, id: string) => {
      try {
        const { key, uploadUrl } = await requestPresignedUpload(apiClient, file, s3key)
        await uploadFileToS3(uploadUrl, file)
        updateDraft(id, { status: 'done', fileKey: key, fileName: file.name })
      } catch {
        updateDraft(id, {
          status: 'error',
          errorMessage: '업로드에 실패했습니다. 다시 시도해 주세요.'
        })
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
      onChange([
        ...attachments,
        { id, kind: 'FILE', fileName: file.name, status: 'uploading', file }
      ])
      void uploadFile(file, id)
    },
    [attachments, isFull, onChange, uploadFile]
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
              <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-red typo-pc-b3">
                <span className="flex-1 truncate">
                  {draft.fileName ?? draft.url} — {draft.errorMessage}
                </span>
                {draft.file && (
                  <button type="button" className="underline" onClick={() => handleRetry(draft)}>
                    재시도
                  </button>
                )}
                <button type="button" className="underline" onClick={() => handleRemove(draft.id)}>
                  삭제
                </button>
              </div>
            ) : (
              <GdgFileCard
                fileName={draft.kind === 'FILE' ? (draft.fileName ?? '') : (draft.url ?? '')}
                fileSize={draft.status === 'uploading' ? '업로드 중...' : undefined}
                action="remove"
                onAction={() => handleRemove(draft.id)}
                fullWidth
              />
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
        <GdgUploadButton
          label="+ 파일 선택"
          disabled={isFull}
          onClick={() => fileInputRef.current?.click()}
        />
        <GdgInputField
          placeholder="https://... 링크 추가"
          value={linkInput}
          onChange={(event) => setLinkInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAddLink()
            }
          }}
          disabled={isFull}
        />
        <button
          type="button"
          onClick={handleAddLink}
          disabled={isFull}
          className="whitespace-nowrap typo-pc-b3 text-white underline"
        >
          링크 추가
        </button>
      </div>
      {isFull && (
        <p className="typo-pc-c1 text-gray-500">첨부는 최대 {maxCount}개까지 등록할 수 있습니다.</p>
      )}
    </div>
  )
}
