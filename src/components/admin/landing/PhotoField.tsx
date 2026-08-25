'use client'

import type { AxiosInstance } from 'axios'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

import { DuskField, DUSK_INPUT } from '@/components/ui/dusk/DuskForm'
import {
  describeUploadError,
  requestPresignedUpload,
  toPublicUrl,
  uploadFileToS3,
  validateUploadSize
} from '@/services/board/uploadClient'
import type { LandingPhoto } from '@/types/landing'

/** 서버 S3KeyType.landing 과 같은 값. enum 의 '이름'이지 경로가 아니다. */
export const LANDING_S3_KEY = 'landing'

export interface PhotoFieldProps {
  photo: LandingPhoto
  onChange: (next: LandingPhoto) => void
  apiClient: AxiosInstance
  /** 미리보기 높이. 히어로는 넓게, 목록 항목은 낮게 쓴다. */
  previewClassName?: string
}

/**
 * 사진 한 장을 고치는 조각.
 *
 * 초점(focusY)은 슬라이더로 둔다 — 얼굴이 잘리는 사진을 배포 없이 맞추려고 둔 값이라,
 * 미리보기가 즉시 따라 움직여야 쓸모가 있다.
 */
export function PhotoField({
  photo,
  onChange,
  apiClient,
  previewClassName = 'h-[220px]'
}: PhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      const sizeError = validateUploadSize(file)
      if (sizeError) {
        setError(sizeError)
        return
      }

      setUploading(true)
      setError(null)
      try {
        const { uploadUrl } = await requestPresignedUpload(apiClient, file, LANDING_S3_KEY)
        await uploadFileToS3(uploadUrl, file)
        // 서명 쿼리를 뗀 주소를 저장한다. presigned URL 은 5분이면 만료된다.
        onChange({ ...photo, src: toPublicUrl(uploadUrl) })
      } catch (err) {
        setError(describeUploadError(err))
      } finally {
        setUploading(false)
      }
    },
    [apiClient, onChange, photo]
  )

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`relative w-full overflow-hidden rounded-[14px] bg-dusk-slot ${previewClassName}`}
      >
        {/* next/image 최적화는 꺼져 있고 업로드 사진은 임의 호스트라 fill 로만 쓴다. */}
        <Image
          src={photo.src}
          alt=""
          fill
          unoptimized
          className="object-cover"
          style={{ objectPosition: `50% ${photo.focusY}%` }}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void handleFile(file)
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-xl border border-[rgba(240,234,228,0.22)] px-6 py-3.5 text-sm text-dusk-ink-100 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:bg-[rgba(208,129,85,0.06)] disabled:opacity-50"
      >
        {uploading ? '올리는 중...' : '사진 교체'}
      </button>
      {error && <p className="text-[13px] text-signal-err">{error}</p>}

      <DuskField label="사진 설명 (대체 텍스트)" hint="눈으로 못 보는 사람에게 읽히는 문구다.">
        <input
          type="text"
          value={photo.alt}
          onChange={(event) => onChange({ ...photo, alt: event.target.value })}
          className={DUSK_INPUT}
        />
      </DuskField>

      <DuskField label="캡션" hint="사진 위에 작게 표시된다.">
        <input
          type="text"
          value={photo.caption}
          onChange={(event) => onChange({ ...photo, caption: event.target.value })}
          className={DUSK_INPUT}
        />
      </DuskField>

      <div className="flex flex-col gap-[9px]">
        <span className="text-[13px] text-dusk-ink-700">
          사진 초점 <span className="text-dusk-ink-800">인물이 잘리면 조정</span>
        </span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={photo.focusY}
            onChange={(event) => onChange({ ...photo, focusY: Number(event.target.value) })}
            className="h-1 flex-1 cursor-pointer accent-ember"
          />
          <span className="w-12 shrink-0 text-right text-[13px] text-dusk-ink-600">
            {photo.focusY}%
          </span>
        </div>
      </div>
    </div>
  )
}
