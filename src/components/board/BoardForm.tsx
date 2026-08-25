import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

/**
 * 글 작성·수정 화면이 함께 쓰는 폼 조각.
 *
 * 디자인 시스템의 `GdgInputField`·`GdgDropdown`·`GdgTextarea`·`GdgButton` 은 밝은 배경을
 * 전제로 만들어졌다. dusk 배경 위에 그대로 두면 흰 입력칸이 떠 버려 여기서는 쓰지 않는다.
 * 로그인·회원가입 같은 밝은 화면은 계속 `Gdg*` 를 쓴다.
 */

export const BOARD_FIELD_LABEL = 'text-[13px] text-dusk-ink-700'

const CONTROL_BASE =
  'w-full appearance-none rounded-xl border border-[rgba(240,234,228,0.14)] bg-[rgba(240,234,228,0.05)] text-[15px] text-dusk-ink-100 outline-none transition-colors placeholder:text-dusk-ink-800 focus:border-[rgba(240,234,228,0.32)] disabled:opacity-50'

export const BOARD_INPUT = `${CONTROL_BASE} px-4 py-3.5`

export const BOARD_SELECT = `${CONTROL_BASE} cursor-pointer px-4 py-3.5 text-dusk-ink-200`

export const BOARD_TEXTAREA = `${CONTROL_BASE} resize-y p-4 leading-[1.8]`

/** `<select>` 의 펼친 목록은 배경을 상속하지 않는다. 옵션마다 직접 칠해야 흰 목록이 안 뜬다. */
export const BOARD_OPTION = 'bg-dusk-field text-dusk-ink-100'

export const BOARD_SUBMIT_BUTTON =
  'flex-1 rounded-full bg-ember px-6 py-4 text-center text-[15px] font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base disabled:opacity-50'

export const BOARD_CANCEL_BUTTON =
  'whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-[26px] py-4 text-[15px] text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100'

export interface BoardFieldProps {
  label: string
  /** 입력칸 아래 회색 안내. 글자 수 제한이나 붙여넣기 안내처럼 상시 보이는 문구를 넣는다. */
  hint?: ReactNode
  className?: string
  children: ReactNode
}

export function BoardField({ label, hint, className, children }: BoardFieldProps) {
  return (
    <label className={cn('flex flex-col gap-[9px]', className)}>
      <span className={BOARD_FIELD_LABEL}>{label}</span>
      {children}
      {hint && <span className="text-[13px] text-dusk-ink-800">{hint}</span>}
    </label>
  )
}

export interface BoardFormHeaderProps {
  /** 취소·뒤로 갈 목록 경로. */
  backHref: string
  title: string
}

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
