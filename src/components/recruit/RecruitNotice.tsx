import Link from 'next/link'
import type { ReactNode } from 'react'

import { GdgLogo } from '@/components/ui/design-system'
import { DUSK_GHOST_BUTTON, DUSK_PRIMARY_BUTTON } from '@/components/ui/dusk/DuskForm'

/**
 * 폼 대신 안내만 띄우는 화면. 모집 전·마감·제출 완료가 모두 같은 모양이다.
 */
export function RecruitNotice({
  title,
  message,
  children,
  action
}: {
  title: string
  message: string
  /** 안내 아래 붙일 일정표 등. */
  children?: ReactNode
  /**
   * 여기서 이어서 할 수 있는 일(로그인 등). 주면 이쪽이 주 버튼이 되고 「홈으로 이동」은
   * 한 단 내려간다 — 둘 다 주 버튼이면 나가는 쪽이 할 일처럼 보인다.
   */
  action?: { label: string; href?: string; onClick?: () => void }
}) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
      <div className="flex items-center gap-3">
        <GdgLogo mode="auto" />
        <h1 className="text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.26] tracking-[-0.03em]">
          {title}
        </h1>
      </div>

      <p className="mt-7 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px] text-[15px] leading-[1.7] text-dusk-ink-300">
        {message}
      </p>

      {children ? <div className="mt-8">{children}</div> : null}

      <div className="mt-10 flex justify-end gap-2.5">
        <Link href="/" className={action ? DUSK_GHOST_BUTTON : DUSK_PRIMARY_BUTTON}>
          홈으로 이동
        </Link>
        {action ? (
          action.href ? (
            <Link href={action.href} className={DUSK_PRIMARY_BUTTON}>
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className={DUSK_PRIMARY_BUTTON}>
              {action.label}
            </button>
          )
        ) : null}
      </div>
    </main>
  )
}
