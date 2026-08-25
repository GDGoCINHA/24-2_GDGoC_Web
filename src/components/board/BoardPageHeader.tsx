import Link from 'next/link'
import type { ReactNode } from 'react'

export interface BoardPageHeaderProps {
  title: string
  /** 서버가 준 전체 글 수. 아직 못 받았으면 줄 자체를 그리지 않는다. */
  totalCount?: number
  children?: ReactNode
}

export function BoardPageHeader({ title, totalCount, children }: BoardPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-5">
      <div>
        <h1 className="text-[clamp(28px,3.2vw,42px)] font-semibold leading-[1.24] tracking-[-0.03em]">
          {title}
        </h1>
        {typeof totalCount === 'number' && (
          <p className="mt-3 text-sm text-dusk-ink-700">전체 {totalCount}개의 글</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  )
}

export interface BoardFormHeaderProps {
  /** 취소·뒤로 갈 목록 경로. */
  backHref: string
  title: string
}

/** 글 작성·수정 화면의 머리. 목록 화면의 `BoardPageHeader` 보다 한 단 작다. */
export function BoardFormHeader({ backHref, title }: BoardFormHeaderProps) {
  return (
    <div>
      <Link
        href={backHref}
        className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
      >
        ← 목록으로
      </Link>
      <h1 className="mt-6 break-keep text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
        {title}
      </h1>
    </div>
  )
}
