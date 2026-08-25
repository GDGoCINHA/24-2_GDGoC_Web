import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

/**
 * 어두운(dusk) 배경 화면이 함께 쓰는 폼 조각.
 *
 * 디자인 시스템의 `GdgInputField`·`GdgDropdown`·`GdgTextarea`·`GdgButton` 은 밝은 배경을
 * 전제로 만들어졌다. dusk 배경 위에 그대로 두면 흰 입력칸이 떠 버려 여기서는 쓰지 않는다.
 * 로그인·회원가입 같은 밝은 화면은 계속 `Gdg*` 를 쓴다.
 */

export const DUSK_LABEL = 'text-[13px] text-dusk-ink-700'

const CONTROL_BASE =
  'w-full appearance-none rounded-xl border border-[rgba(240,234,228,0.14)] bg-[rgba(240,234,228,0.05)] text-[15px] text-dusk-ink-100 outline-none transition-colors placeholder:text-dusk-ink-800 focus:border-[rgba(240,234,228,0.32)] disabled:opacity-50'

export const DUSK_INPUT = `${CONTROL_BASE} px-4 py-3.5`

export const DUSK_SELECT = `${CONTROL_BASE} cursor-pointer px-4 py-3.5 text-dusk-ink-200`

export const DUSK_TEXTAREA = `${CONTROL_BASE} resize-y p-4 leading-[1.8]`

/**
 * 고칠 수 없는 값. 흐리게 두어 옆의 입력칸과 구분한다 — 눌러도 안 되는 칸이
 * 같은 밝기면 왜 안 써지는지 알 수 없다.
 */
export const DUSK_INPUT_READONLY =
  'w-full appearance-none rounded-xl border border-[rgba(240,234,228,0.09)] bg-[rgba(240,234,228,0.03)] px-4 py-3.5 text-[15px] text-dusk-ink-800 outline-none'

/** `<select>` 의 펼친 목록은 배경을 상속하지 않는다. 옵션마다 직접 칠해야 흰 목록이 안 뜬다. */
export const DUSK_OPTION = 'bg-dusk-field text-dusk-ink-100'

/** 목록 화면의 주 버튼(글쓰기 등). 폼 제출 버튼보다 한 단 작다. */
export const DUSK_PRIMARY_BUTTON =
  'whitespace-nowrap rounded-full bg-ember px-6 py-3 text-sm font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base disabled:opacity-50'

export const DUSK_GHOST_BUTTON =
  'whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-[22px] py-[11px] text-sm text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100 disabled:opacity-50'

export const DUSK_SUBMIT_BUTTON =
  'flex-1 rounded-full bg-ember px-6 py-4 text-center text-[15px] font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base disabled:opacity-50'

export const DUSK_CANCEL_BUTTON =
  'whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.20)] px-[26px] py-4 text-[15px] text-dusk-ink-400 transition-colors hover:border-[rgba(240,234,228,0.5)] hover:text-dusk-ink-100 disabled:opacity-50'

export const DUSK_DANGER_BUTTON =
  'whitespace-nowrap rounded-full border border-[rgba(196,88,74,0.6)] px-[22px] py-[11px] text-sm text-signal-err transition-colors hover:bg-[rgba(196,88,74,0.12)] disabled:opacity-50'

export interface DuskFieldProps {
  label: string
  /** 입력칸 아래 회색 안내. 글자 수 제한이나 붙여넣기 안내처럼 상시 보이는 문구를 넣는다. */
  hint?: ReactNode
  /** 붉게 뜨는 검증 문구. 있으면 hint 대신 이쪽이 보인다. */
  error?: ReactNode
  className?: string
  children: ReactNode
}

export function DuskField({ label, hint, error, className, children }: DuskFieldProps) {
  return (
    <label className={cn('flex flex-col gap-[9px]', className)}>
      <span className={DUSK_LABEL}>{label}</span>
      {children}
      {error ? (
        <span className="text-[13px] text-signal-err">{error}</span>
      ) : (
        hint && <span className="text-[13px] text-dusk-ink-800">{hint}</span>
      )}
    </label>
  )
}
