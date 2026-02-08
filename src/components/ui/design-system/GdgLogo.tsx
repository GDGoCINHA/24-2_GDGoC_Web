'use client'

import Image from 'next/image'

import { cn } from '@/utils/cn'

type LogoMode = 'auto' | 'pc' | 'mobile'
type LogoVariant = 'icon' | 'short' | 'long'

const LOGO_ASSETS = {
  pc: {
    src: '/icons/gdgocIcon/pc.svg',
    width: 53,
    height: 30,
    alt: 'GDGoC INHA desktop logo'
  },
  mobile: {
    src: '/icons/gdgocIcon/mobile.svg',
    width: 42,
    height: 24,
    alt: 'GDGoC INHA mobile logo'
  }
} as const

export interface GdgLogoProps {
  mode?: LogoMode
  variant?: LogoVariant
  className?: string
  priority?: boolean
}

export function GdgLogo({
  mode = 'auto',
  variant = 'icon',
  className,
  priority = false
}: GdgLogoProps) {
  const renderLogo = (target: 'pc' | 'mobile') => {
    const asset = LOGO_ASSETS[target]
    const isPc = target === 'pc'

    if (variant === 'icon') {
      return (
        <span className={cn('inline-flex select-none', className)} aria-label={asset.alt}>
          <Image
            src={asset.src}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            className="h-auto w-auto"
            priority={priority}
          />
        </span>
      )
    }

    return (
      <span
        className={cn(
          'inline-flex select-none font-google-sans-flex text-white',
          variant === 'long'
            ? cn('items-center', isPc ? 'gap-2.5' : 'gap-2')
            : 'flex-col items-start gap-1.5',
          className
        )}
        aria-label={
          variant === 'long'
            ? `GDGoC INHA ${target} long logo`
            : `GDGoC INHA ${target} short logo`
        }
      >
        <Image
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          className="h-auto w-auto shrink-0"
          priority={priority}
        />
        {variant === 'long' ? (
          <span className="inline-flex flex-col items-start gap-0.5">
            <span
              className={cn(
                'font-normal leading-normal tracking-tight text-white whitespace-nowrap',
                isPc ? 'text-base' : 'text-sm'
              )}
            >
              Google Developer Group
            </span>
            <span className="text-xs font-normal leading-none tracking-tight text-blue whitespace-nowrap">
              Inha University
            </span>
          </span>
        ) : (
          <>
            <span
              className={cn(
                'font-normal leading-normal tracking-tight text-white',
                isPc ? 'text-base' : 'text-sm'
              )}
            >
              Google
              <br />
              Developer
              <br />
              Group
            </span>
            <span className="text-xs font-normal leading-none tracking-tight text-blue">
              Inha University
            </span>
          </>
        )}
      </span>
    )
  }

  if (mode === 'pc') {
    return renderLogo('pc')
  }

  if (mode === 'mobile') {
    return renderLogo('mobile')
  }

  return (
    <>
      <span className="hidden pc:inline-flex">{renderLogo('pc')}</span>
      <span className="inline-flex pc:hidden">{renderLogo('mobile')}</span>
    </>
  )
}
