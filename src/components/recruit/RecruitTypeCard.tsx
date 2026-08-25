'use client'

import { useRouter } from 'next/navigation'

import { cn } from '@/utils/cn'

type Props = {
  title: string
  subtitle: string
  /** 문자열 외에 부가 문구를 붙일 수 있게 노드로 받는다 — 부원 카드가 '(집중 모집 기간)' 을 단다. */
  period: React.ReactNode
  href: string
  statusLabel: string
  isOpen: boolean
}

export function RecruitTypeCard({ title, subtitle, period, href, statusLabel, isOpen }: Props) {
  const router = useRouter()

  return (
    // h-full + 버튼 mt-auto: 두 카드의 내용 길이가 달라도 높이와 버튼 위치가 맞는다.
    <div className="flex h-full flex-col gap-[22px] rounded-[14px] border border-[rgba(240,234,228,0.12)] bg-[rgba(240,234,228,0.05)] px-6 py-[26px]">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block size-2 rounded-full',
            isOpen ? 'bg-ember' : 'bg-dusk-ink-800'
          )}
          aria-hidden
        />
        <span className={cn('text-[13px]', isOpen ? 'text-ember' : 'text-dusk-ink-800')}>
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[30px] font-bold leading-[1.15] tracking-[-0.03em]">{title}</p>
        <p className="text-sm text-dusk-ink-700">{subtitle}</p>
      </div>

      <p className="text-[15px] text-dusk-ink-100">{period}</p>

      <button
        type="button"
        disabled={!isOpen}
        onClick={() => router.push(href)}
        className="mt-auto w-full rounded-full bg-ember px-5 py-[13px] text-center text-[15px] font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base disabled:cursor-not-allowed disabled:bg-[rgba(240,234,228,0.10)] disabled:text-dusk-ink-800"
      >
        지원하기
      </button>
    </div>
  )
}
