import type { AxiosInstance } from 'axios'

const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

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
