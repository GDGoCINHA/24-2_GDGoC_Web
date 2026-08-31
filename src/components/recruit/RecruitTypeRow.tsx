'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type Props = {
  /** 띠 왼쪽 위에 붙는 순번. `01`·`02`. */
  index: string
  title: string
  /** 한글명과 조건을 한 줄로. 예: `운영진 · 서류 후 면접` */
  subtitle: string
  /** 문자열 외에 부가 문구를 붙일 수 있게 노드로 받는다 — 부원 띠가 '(집중 모집 기간)' 을 단다. */
  period: ReactNode
  href: string
  statusLabel: string
  isOpen: boolean
  accent: 'core' | 'member'
}

/** 호버 때 텍스트가 필 위로 올라오면서 뒤집히는 색. 필이 밝아 어두운 글자를 쓴다. */
const INVERTED = 'group-hover:text-ember-ink'
const INVERTED_SOFT = 'group-hover:text-[rgba(36,28,34,0.72)]'
const INVERTED_FAINT = 'group-hover:text-[rgba(36,28,34,0.6)]'

/**
 * 지원 종류 한 줄.
 *
 * 카드가 아니라 **전폭 가로 띠**다. 카드 그리드·사진 썸네일 안을 거쳐 이 타이포 중심
 * 형태로 확정됐다(핸드오프 "최근 확정된 결정" 1번). 배경·라운드·그림자를 넣지 않는다.
 *
 * 띠 전체가 링크다. 안에 또 버튼을 두면 인터랙티브 요소가 중첩돼 스크린 리더에서
 * 두 번 읽히므로, "지원하기 →" 는 버튼이 아니라 글자로만 둔다.
 */
export function RecruitTypeRow({
  index,
  title,
  subtitle,
  period,
  href,
  statusLabel,
  isOpen,
  accent
}: Props) {
  const accentFill = accent === 'core' ? 'bg-ember' : 'bg-signal-ok'
  const accentText = accent === 'core' ? 'text-ember' : 'text-signal-ok'

  const body = (
    <>
      {/*
        아래에서 위로 솟는 필. 터치 기기에는 hover 가 없어 그냥 안 나타난다 —
        탭하면 바로 이동하므로 효과가 없어도 동작에는 영향이 없다.
      */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 translate-y-[101%] transition-transform duration-[550ms] ease-[cubic-bezier(.22,.61,.36,1)]',
          accentFill,
          isOpen && 'group-hover:translate-y-0'
        )}
      />

      {/*
        좁은 폭에서는 두 띠가 같은 모양이어야 한다. flex-wrap 에 맡기면 기간 문구가 긴
        쪽만 줄바꿈돼(부원의 '(집중 모집 기간)') 나란히 놓인 띠의 생김새가 갈린다.
      */}
      <span className="relative flex flex-col gap-6 min-[600px]:flex-row min-[600px]:items-end min-[600px]:justify-between min-[600px]:gap-x-8">
        <span className="min-w-0">
          <span
            className={cn(
              'block text-[13px] text-dusk-ink-800 transition-colors duration-[400ms]',
              isOpen && INVERTED_FAINT
            )}
          >
            {index}
          </span>
          <span
            className={cn(
              'mt-2.5 block text-[clamp(38px,6vw,76px)] font-bold leading-[0.94] tracking-[-0.05em] transition-colors duration-[400ms]',
              isOpen && INVERTED
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              'mt-3 block break-keep text-[15px] text-dusk-ink-700 transition-colors duration-[400ms]',
              isOpen && INVERTED_SOFT
            )}
          >
            {subtitle}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-start gap-2.5 min-[600px]:items-end">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                'size-1.5 shrink-0 rounded-full transition-colors duration-[400ms]',
                isOpen ? accentFill : 'bg-dusk-ink-800',
                isOpen && 'group-hover:bg-ember-ink'
              )}
            />
            <span
              className={cn(
                'text-[13px] transition-colors duration-[400ms]',
                isOpen ? accentText : 'text-dusk-ink-800',
                isOpen && INVERTED
              )}
            >
              {statusLabel}
            </span>
          </span>

          <span
            className={cn(
              'break-keep text-[15px] text-dusk-ink-400 transition-colors duration-[400ms] min-[600px]:text-right',
              isOpen && INVERTED_SOFT
            )}
          >
            {period}
          </span>

          {isOpen ? (
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-[9px] text-[15px] font-medium transition-[gap,color] duration-[400ms] group-hover:gap-3.5',
                accentText,
                INVERTED
              )}
            >
              지원하기
              <span aria-hidden>→</span>
            </span>
          ) : null}
        </span>
      </span>
    </>
  )

  const shell = cn(
    'group relative block overflow-hidden border-t border-[rgba(240,234,228,0.14)]',
    'px-[clamp(20px,2.6vw,32px)] py-[clamp(26px,3.4vw,40px)]',
    !isOpen && 'cursor-default opacity-55'
  )

  if (!isOpen) {
    return <div className={shell}>{body}</div>
  }

  return (
    <Link href={href} className={shell}>
      {body}
    </Link>
  )
}
