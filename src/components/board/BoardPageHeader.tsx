import type { ReactNode } from 'react'

/**
 * 게시판 목록·휴지통이 함께 쓰는 버튼 모양. 세 게시판이 같은 클래스를 되풀이하지
 * 않도록 여기 모아 둔다.
 */
export const BOARD_GHOST_BUTTON =
  'whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-[22px] py-[11px] text-sm text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100'

export const BOARD_PRIMARY_BUTTON =
  'whitespace-nowrap rounded-full bg-ember px-6 py-3 text-sm font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base'

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
