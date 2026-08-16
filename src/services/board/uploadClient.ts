import axios, { type AxiosInstance } from 'axios'

const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

/** 서버 ResourceService.MAX_FILE_SIZE 와 같은 값. 넘으면 presigned 요청이 413 이다. */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

/** 업로드 가능한 크기면 null, 아니면 사용자에게 보여줄 사유. 서버 왕복 전에 거른다. */
export const validateUploadSize = (file: File): string | null =>
  file.size > MAX_UPLOAD_SIZE
    ? `파일 크기는 10MB를 넘을 수 없습니다. (선택한 파일: ${(file.size / 1024 / 1024).toFixed(1)}MB)`
    : null

/**
 * 업로드 실패 사유를 화면에 띄울 문구로 바꾼다. 서버는 413에 "파일 크기는 10Mb를 넘을 수
 * 없습니다" 처럼 원인을 담아 주는데, 호출부가 이를 버리고 "업로드에 실패했습니다" 만 띄우면
 * 사용자는 무엇을 고쳐야 할지 알 수 없다.
 */
export const describeUploadError = (err: unknown): string => {
  if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
    return err.response.data.message
  }
  if (err instanceof Error && err.message) return err.message
  return '업로드에 실패했습니다.'
}

export interface PresignedUpload {
  key: string
  uploadUrl: string
}

export const requestPresignedUpload = async (
  apiClient: AxiosInstance,
  file: File,
  s3key: string
): Promise<PresignedUpload> => {
  const response = await apiClient.post('/resource/presigned-upload', {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    s3key
  })
  return unwrapOnce<PresignedUpload>(response.data)
}

/**
 * presigned URL은 서명에 헤더 집합이 포함돼 있어 Authorization 헤더 등을 더 붙이면
 * 서명이 깨진다. apiClient가 아니라 순수 fetch를 쓴다.
 */
export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, { method: 'PUT', body: file })
  if (!response.ok) {
    throw new Error(`파일 업로드에 실패했습니다. (status: ${response.status})`)
  }
}
