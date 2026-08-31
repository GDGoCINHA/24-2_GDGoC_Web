'use client'

import { DUSK_CANCEL_BUTTON, DUSK_SUBMIT_BUTTON } from '@/components/ui/dusk/DuskForm'
import { cn } from '@/utils/cn'

/**
 * 지원서 단계.
 *
 * 운영진 지원서(`app/recruit/core/page.tsx`)가 같은 이름의 네 단계를 이미 쓰고 있다.
 * 두 지원서가 나란히 놓이는 화면이라 **모양을 그쪽에 맞춘다** — 그 파일의 `StepBar`
 * 와 같은 알약 형태다. 거기를 고칠 때는 여기도 같이 본다.
 */
export const RECRUIT_STEP_LABELS = ['기본정보', '내용작성', '일정안내', '약관동의'] as const

export const RECRUIT_STEP_COUNT = RECRUIT_STEP_LABELS.length

type IndicatorProps = {
  current: number
  /** 여기까지는 가 봤다. 지나온 단계만 되돌아갈 수 있다 — 앞선 단계는 검증을 건너뛴다. */
  maxReached: number
  onJump: (index: number) => void
}

export function RecruitStepIndicator({ current, maxReached, onJump }: IndicatorProps) {
  return (
    <div className="mt-[34px] flex flex-wrap items-center gap-2">
      {RECRUIT_STEP_LABELS.map((label, index) => {
        const isCurrent = index === current
        const isClickable = index <= maxReached

        return (
          <div key={label} className="flex items-center gap-2">
            {index > 0 && <span className="hidden text-dusk-ink-800 min-[420px]:inline">·</span>}
            <button
              type="button"
              onClick={() => onJump(index)}
              disabled={!isClickable}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-[9px] text-[13px] transition-colors min-[420px]:px-4 min-[420px]:text-sm',
                isCurrent
                  ? 'bg-ember text-ember-ink'
                  : isClickable
                    ? 'cursor-pointer text-dusk-ink-500 hover:text-dusk-ink-100'
                    : 'cursor-not-allowed text-dusk-ink-700'
              )}
            >
              {label}
            </button>
          </div>
        )
      })}
    </div>
  )
}

type NavProps = {
  step: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
  submitLabel: string
}

/**
 * 단계 이동 버튼.
 *
 * 마지막 단계에서만 `type="submit"` 이다. 중간 단계의 "다음" 이 submit 이 되면
 * 아직 열지도 않은 뒷 단계까지 검증에 걸려 제출이 조용히 실패한다.
 */
export function RecruitStepNav({ step, loading, onPrev, onNext, submitLabel }: NavProps) {
  const isLast = step === RECRUIT_STEP_COUNT - 1

  return (
    <div className="mt-7 flex gap-2.5">
      {step > 0 ? (
        <button type="button" onClick={onPrev} className={DUSK_CANCEL_BUTTON}>
          이전
        </button>
      ) : null}

      {isLast ? (
        <button type="submit" disabled={loading} className={DUSK_SUBMIT_BUTTON}>
          {loading ? '제출 중...' : submitLabel}
        </button>
      ) : (
        <button type="button" onClick={onNext} className={DUSK_SUBMIT_BUTTON}>
          다음
        </button>
      )}
    </div>
  )
}
