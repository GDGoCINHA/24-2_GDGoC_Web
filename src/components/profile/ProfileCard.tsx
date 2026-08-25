'use client'

import { useRef } from 'react'

import type { UserProfile } from '@/types/profile'
import { cn } from '@/utils/cn'

import {
  getRoleBanner,
  getRoleBannerClass,
  getRoleTagClass,
  getTeamLabel,
  getTeamTagClass
} from './profileTagMeta'

const TAG_BASE = 'shrink-0 rounded-full px-2.5 py-1 text-[11px]'

interface ProfileCardProps {
  profile: UserProfile
  onImageChange: (file: File) => void
  uploading?: boolean
  imageError?: string | null
}

export default function ProfileCard({
  profile,
  onImageChange,
  uploading = false,
  imageError = null
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const banner = getRoleBanner(profile.userRole)

  return (
    <section className="overflow-hidden rounded-[18px] border border-[rgba(240,234,228,0.09)] bg-[rgba(240,234,228,0.05)]">
      <div className="flex flex-wrap items-center gap-5 p-6">
        {profile.image ? (
          // next/image 는 못 쓴다 — S3 호스트를 remotePatterns 에 적을 수 없다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.image} alt="" className="size-16 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="size-16 shrink-0 rounded-full bg-[rgba(240,234,228,0.14)]" aria-hidden />
        )}

        <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-[9px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[21px] font-semibold tracking-[-0.02em]">{profile.name}</span>
            <span className={cn(TAG_BASE, getRoleTagClass(profile.userRole))}>
              {profile.userRole}
            </span>
            <span className={cn(TAG_BASE, getTeamTagClass(profile.team))}>
              {getTeamLabel(profile.team)}
            </span>
          </div>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-dusk-ink-700">
            {profile.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.18)] px-4 py-[9px] text-[13px] text-dusk-ink-600 transition-colors hover:border-[rgba(240,234,228,0.45)] hover:text-dusk-ink-100 disabled:opacity-50"
        >
          {uploading ? '변경 중…' : '프로필 이미지 변경'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImageChange(file)
            event.target.value = ''
          }}
        />
      </div>

      {imageError && <p className="px-6 pb-4 text-[13px] text-signal-err">{imageError}</p>}

      {banner && (
        <div
          className={cn('px-6 py-[13px] text-center text-sm', getRoleBannerClass(profile.userRole))}
        >
          {banner}
        </div>
      )}
    </section>
  )
}
