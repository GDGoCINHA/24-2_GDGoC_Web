'use client'

import Image from 'next/image'
import { GdgButton } from './GdgButton'
import type { Device } from './controlMeta'

export interface GdgGoogleLoginButtonProps {
  device?: Device
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

/**
 * GdgGoogleLoginButton component
 * Strictly follows Figma design: PC (300x52), Mobile (260x46)
 * Background is always white, text is black.
 */
export function GdgGoogleLoginButton({
  device = 'pc',
  onClick,
  disabled,
  loading
}: GdgGoogleLoginButtonProps) {
  // Fixed dimensions from design spec
  const sizeClasses = device === 'pc' ? 'w-[300px] h-[52px]' : 'w-[260px] h-[46px]'
  const typoClasses = 'typo-pc-s2 mobile:typo-m-s3'
  
  return (
    <GdgButton
      device={device}
      variant="white"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={`${sizeClasses} ${typoClasses}`}
      icon={<Image src="/icons/logo/google-g.svg" alt="Google logo" height={20} width={20} />}
    >
      Google 계정으로 로그인
    </GdgButton>
  )
}
