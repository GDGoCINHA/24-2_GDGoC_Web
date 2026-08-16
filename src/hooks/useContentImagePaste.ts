'use client'

import type { AxiosInstance } from 'axios'
import {
  useCallback,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type SetStateAction
} from 'react'

import {
  describeUploadError,
  requestPresignedUpload,
  toPublicUrl,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import { insertAtCursor } from '@/utils/insertAtCursor'

export interface UseContentImagePasteOptions {
  apiClient: AxiosInstance
  /** 게시판별 S3KeyType 이름 — boardNotice · boardFree · boardEvent */
  s3key: string
  setContent: Dispatch<SetStateAction<string>>
  setErrorMessage: Dispatch<SetStateAction<string | null>>
}

/**
 * 내용 칸에 이미지를 붙여넣으면 업로드하고 그 자리에 이미지 표기를 넣는다.
 * 세 게시판의 작성·수정 화면이 같은 동작을 쓴다.
 */
export const useContentImagePaste = ({
  apiClient,
  s3key,
  setContent,
  setErrorMessage
}: UseContentImagePasteOptions) => {
  const [uploading, setUploading] = useState(false)

  const handlePaste = useCallback(
    async (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const file = Array.from(event.clipboardData.files).find((item) =>
        item.type.startsWith('image/')
      )
      // 이미지가 아니면 손대지 않는다 — 평범한 텍스트 붙여넣기가 그대로 동작해야 한다.
      if (!file) return

      // 붙여넣은 시점의 자리를 잡아 둔다. 업로드를 기다리는 사이 커서가 움직일 수 있다.
      const { selectionStart, selectionEnd } = event.currentTarget
      event.preventDefault()

      const sizeError = validateUploadSize(file)
      if (sizeError) {
        setErrorMessage(sizeError)
        return
      }

      setErrorMessage(null)
      setUploading(true)
      try {
        const { uploadUrl } = await requestPresignedUpload(apiClient, file, s3key)
        await uploadFileToS3(uploadUrl, file)
        // 본문에는 서명이 붙지 않은 주소를 남긴다. presigned URL 은 5분이면 만료된다.
        const markup = `![](${toPublicUrl(uploadUrl)})`
        setContent((prev) => insertAtCursor(prev, selectionStart, selectionEnd, markup))
      } catch (err) {
        setErrorMessage(describeUploadError(err))
      } finally {
        setUploading(false)
      }
    },
    [apiClient, s3key, setContent, setErrorMessage]
  )

  return { uploading, handlePaste }
}
