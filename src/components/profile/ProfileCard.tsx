'use client'

import { useRef } from 'react'

import { GdgColorTag } from '@/components/ui/design-system'
import type { UserProfile } from '@/types/profile'
import { cn } from '@/utils/cn'

import { getRoleBanner, getRoleTagColor, getTeamLabel, getTeamTagColor } from './profileTagMeta'

const BANNER_CLASS: Record<string, string> = {
  green: 'bg-green text-white',
  blue: 'bg-blue text-white',
  yellow: 'bg-yellow text-black',
  red: 'bg-red text-white',
  white: ''
}

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

  const roleColor = getRoleTagColor(profile.userRole)
  const banner = getRoleBanner(profile.userRole)

  return (
    <section className="overflow-hidden rounded-2xl bg-gray-100/30">
      <div className="flex items-center gap-4 p-5">
        {profile.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.image} alt="" className="size-16 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="size-16 shrink-0 rounded-full bg-gray-400" aria-hidden />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="typo-pc-h4 text-white">{profile.name}</span>
            <GdgColorTag color={roleColor} size="mini">
              {profile.userRole}
            </GdgColorTag>
            <GdgColorTag color={getTeamTagColor(profile.team)} size="mini">
              {getTeamLabel(profile.team)}
            </GdgColorTag>
          </div>
          <p className="typo-pc-b3 truncate text-gray-700">{profile.email}</p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-full border border-white/10 px-3 py-1 typo-pc-c2 text-gray-700 transition hover:border-white/30 hover:text-white disabled:opacity-50"
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

      {imageError && <p className="px-5 pb-3 typo-pc-c1 text-red">{imageError}</p>}

      {banner && (
        <div className={cn('px-5 py-3 text-center typo-pc-b3', BANNER_CLASS[roleColor])}>
          {banner}
        </div>
      )}
    </section>
  )
}
