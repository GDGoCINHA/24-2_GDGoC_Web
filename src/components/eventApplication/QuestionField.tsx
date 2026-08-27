'use client'

import {
  DUSK_CHECKBOX,
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_INPUT,
  DUSK_LABEL,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import type { AnswerValue, FormQuestion } from '@/types/eventApplication'

interface QuestionFieldProps {
  question: FormQuestion
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
  disabled?: boolean
}

/**
 * 질문 하나를 유형에 맞는 입력으로 그린다.
 *
 * 행사 상세는 dusk 배경이라 `Gdg*` 입력을 쓰지 않는다 — 흰 입력칸이 떠 버린다
 * (DuskForm.tsx 주석 참고). 밝은 배경 화면에서 이 폼을 다시 쓰게 되면 그때 분기한다.
 *
 * 모르는 유형을 만나면 화면을 죽이지 않고 안내 문구로 대체한다. 배포는 서버가 먼저
 * 올라가므로 웹이 아직 모르는 유형이 잠깐 내려올 수 있고, 그때 폼 전체가 깨지면
 * 다른 질문에도 답할 수 없게 된다.
 */
export default function QuestionField({ question, value, onChange, disabled }: QuestionFieldProps) {
  const options = question.options ?? []
  const common = {
    label: question.label,
    required: question.isRequired,
    hint: question.helpText ?? undefined
  }

  switch (question.type) {
    case 'SHORT_TEXT':
      return (
        <DuskField {...common}>
          <input
            className={DUSK_INPUT}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </DuskField>
      )

    case 'LONG_TEXT':
      return (
        <DuskField {...common}>
          <textarea
            className={DUSK_TEXTAREA}
            rows={4}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </DuskField>
      )

    case 'NUMBER':
      return (
        <DuskField {...common}>
          <input
            type="number"
            className={DUSK_INPUT}
            value={typeof value === 'number' ? String(value) : ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            disabled={disabled}
          />
        </DuskField>
      )

    case 'DATE':
      return (
        <DuskField {...common}>
          <input
            type="date"
            className={DUSK_INPUT}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
          />
        </DuskField>
      )

    case 'DROPDOWN':
      return (
        <DuskField {...common}>
          <select
            className={DUSK_SELECT}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
          >
            <option value="" className={DUSK_OPTION}>
              선택해주세요
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value} className={DUSK_OPTION}>
                {option.label}
              </option>
            ))}
          </select>
        </DuskField>
      )

    /** 알약 버튼이 라디오보다 손가락으로 누르기 쉬워 모바일에서 낫다. */
    case 'SINGLE_CHOICE':
      return (
        <DuskField {...common}>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option.value)}
                className={value === option.value ? DUSK_CHIP_ACTIVE : DUSK_CHIP}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DuskField>
      )

    case 'MULTI_CHOICE': {
      const selected = Array.isArray(value) ? value : []
      return (
        <DuskField {...common}>
          <div className="flex flex-col gap-2.5 pt-1">
            {options.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className={DUSK_CHECKBOX}
                  checked={selected.includes(option.value)}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, option.value]
                        : selected.filter((item) => item !== option.value)
                    )
                  }
                />
                <span className="text-[15px] text-dusk-ink-200">{option.label}</span>
              </label>
            ))}
          </div>
        </DuskField>
      )
    }

    case 'AGREEMENT':
      return (
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className={`${DUSK_CHECKBOX} mt-0.5`}
            checked={value === true}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-[15px] text-dusk-ink-200">
            {question.label}
            {question.isRequired && <span className="text-signal-err"> *</span>}
            {question.helpText ? (
              <span className="mt-1 block text-[13px] text-dusk-ink-800">{question.helpText}</span>
            ) : null}
          </span>
        </label>
      )

    case 'FILE':
      return (
        <DuskField {...common} hint="파일 첨부는 준비 중입니다.">
          <input
            type="file"
            disabled
            className="text-[13px] text-dusk-ink-800 file:mr-3 file:rounded-full file:border-0 file:bg-[rgba(240,234,228,0.08)] file:px-4 file:py-2 file:text-dusk-ink-400"
          />
        </DuskField>
      )

    default:
      return (
        <div className="rounded-xl border border-dashed border-[rgba(240,234,228,0.18)] px-4 py-3">
          <p className={DUSK_LABEL}>{question.label}</p>
          <p className="mt-1 text-[13px] text-dusk-ink-800">
            아직 표시할 수 없는 질문입니다. 새로고침해도 같으면 운영진에게 알려주세요.
          </p>
        </div>
      )
  }
}
