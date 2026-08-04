'use client'

import { useRouter } from 'next/navigation'
import { GdgButton } from '@/components/ui/design-system'
import { cn } from '@/utils/cn'

type Props = {
  title: string
  subtitle: string
  period: string
  href: string
  statusLabel: string
  isOpen: boolean
}

export function RecruitTypeCard({ title, subtitle, period, href, statusLabel, isOpen }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-gray-100 px-6 py-6 mobile:gap-4 mobile:px-4 mobile:py-5">
      <div className="flex items-center gap-2">
        <span
          className={cn('inline-block h-2 w-2 rounded-full', isOpen ? 'bg-red' : 'bg-gray-700')}
          aria-hidden
        />
        <span className={cn('typo-pc-c1 mobile:typo-m-c2', isOpen ? 'text-red' : 'text-gray-700')}>
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="typo-pc-h3 text-white mobile:typo-m-h3">{title}</p>
        <p className="typo-pc-b3 text-gray-700 mobile:typo-m-c1">{subtitle}</p>
      </div>

      <p className="typo-pc-b2 text-white mobile:typo-m-b3">{period}</p>

      <GdgButton
        variant={isOpen ? 'active' : 'disabled'}
        size="small"
        fullWidth
        disabled={!isOpen}
        onClick={() => router.push(href)}
      >
        지원하기
      </GdgButton>
    </div>
  )
}
