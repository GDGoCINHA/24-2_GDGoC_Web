'use client'

import { useState } from 'react'

import {
  ADMIN_ACCENT_BUTTON_SM,
  ADMIN_CELL_SELECT,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION
} from '@/components/admin/dashboard/adminStyles'
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABEL,
  TYPES_USABLE_AS_CONDITION,
  TYPES_WITH_OPTIONS,
  type FormQuestion,
  type QuestionOption,
  type QuestionSavePayload,
  type QuestionType
} from '@/types/eventApplication'

const INPUT =
  'w-full rounded-[10px] border border-admin-line bg-admin-card px-3 py-2 text-[14px] text-admin-ink outline-none transition-colors duration-200 focus:border-admin-accent disabled:cursor-not-allowed disabled:opacity-40'

const LABEL = 'shrink-0 whitespace-nowrap text-[12px] tracking-[0.06em] text-admin-ink-dim'

interface QuestionEditorProps {
  question: FormQuestion
  /** 조건의 기준으로 고를 수 있는 앞 순서 질문들. 서버가 앞 순서만 허용한다. */
  candidates: FormQuestion[]
  /** 신청이 한 건이라도 있으면 유형·선택지·필수 강화가 잠긴다. */
  locked: boolean
  saving: boolean
  onSave: (payload: QuestionSavePayload) => void
  onDelete: () => void
  onMove: (direction: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export default function QuestionEditor({
  question,
  candidates,
  locked,
  saving,
  onSave,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown
}: QuestionEditorProps) {
  const [type, setType] = useState<QuestionType>(question.type)
  const [label, setLabel] = useState(question.label)
  const [helpText, setHelpText] = useState(question.helpText ?? '')
  const [isRequired, setIsRequired] = useState(question.isRequired)
  const [options, setOptions] = useState<QuestionOption[]>(question.options ?? [])
  const [baseId, setBaseId] = useState<number | null>(question.visibleWhenQuestionId)
  const [baseValues, setBaseValues] = useState<string[]>(question.visibleWhenValues ?? [])

  const needsOptions = TYPES_WITH_OPTIONS.includes(type)
  const requiredLocked = locked && !question.isRequired
  const base = candidates.find((candidate) => candidate.id === baseId) ?? null
  const conditionValueChoices = base ? conditionValuesOf(base) : []

  const handleSave = () => {
    onSave({
      type,
      label,
      helpText: helpText.trim() === '' ? null : helpText,
      isRequired,
      options: needsOptions ? options : null,
      visibleWhenQuestionId: baseId,
      visibleWhenValues: baseId == null ? null : baseValues,
      clearCondition: baseId == null
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-admin-line-soft bg-admin-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span className={LABEL}>유형</span>
          <select
            className={ADMIN_CELL_SELECT}
            value={type}
            disabled={locked}
            onChange={(e) => {
              const next = e.target.value as QuestionType
              setType(next)
              if (!TYPES_WITH_OPTIONS.includes(next)) setOptions([])
            }}
          >
            {QUESTION_TYPES.map((option) => (
              <option key={option} value={option} className={ADMIN_OPTION}>
                {QUESTION_TYPE_LABEL[option]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={`${ADMIN_GHOST_BUTTON} ml-auto`}
          disabled={!canMoveUp}
          onClick={() => onMove(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          className={ADMIN_GHOST_BUTTON}
          disabled={!canMoveDown}
          onClick={() => onMove(1)}
        >
          ↓
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>질문</span>
        <input className={INPUT} value={label} onChange={(e) => setLabel(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>도움말 (선택)</span>
        <input className={INPUT} value={helpText} onChange={(e) => setHelpText(e.target.value)} />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>답변</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={requiredLocked}
            onClick={() => setIsRequired(true)}
            className={isRequired ? ADMIN_ACCENT_BUTTON_SM : ADMIN_GHOST_BUTTON}
          >
            필수
          </button>
          <button
            type="button"
            onClick={() => setIsRequired(false)}
            className={isRequired ? ADMIN_GHOST_BUTTON : ADMIN_ACCENT_BUTTON_SM}
          >
            선택
          </button>
        </div>
        {requiredLocked && (
          <p className="text-[12px] text-admin-ink-dim">
            신청자가 있어 필수로 바꿀 수 없습니다. 이미 낸 사람은 이 질문에 답한 적이 없어 필수를
            어긴 상태가 되기 때문입니다.
          </p>
        )}
      </div>

      {needsOptions && (
        <div className="flex flex-col gap-2">
          <span className={LABEL}>선택지</span>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className={INPUT}
                value={option.label}
                placeholder="보이는 문구"
                onChange={(e) =>
                  setOptions((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, label: e.target.value } : item))
                  )
                }
              />
              <button
                type="button"
                className={ADMIN_GHOST_BUTTON}
                disabled={locked}
                onClick={() => setOptions((prev) => prev.filter((_, i) => i !== index))}
              >
                삭제
              </button>
            </div>
          ))}
          {/* 값(value)은 답변에 저장되므로 만든 뒤 바꾸지 않는다. 라벨만 고칠 수 있게 둔다. */}
          <button
            type="button"
            className={`${ADMIN_GHOST_BUTTON} self-start`}
            onClick={() =>
              setOptions((prev) => [
                ...prev,
                { value: `OPT_${Date.now()}_${prev.length}`, label: '' }
              ])
            }
          >
            선택지 추가
          </button>
          {locked && (
            <p className="text-[12px] text-admin-ink-dim">
              신청자가 있어 선택지를 지울 수 없습니다. 문구는 고칠 수 있습니다.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-admin-line-soft pt-3">
        <span className={LABEL}>표시 조건 (선택)</span>
        {candidates.length === 0 ? (
          <p className="text-[12px] text-admin-ink-dim">
            앞에 선택형 질문이 있어야 조건을 걸 수 있습니다.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${ADMIN_CELL_SELECT} max-w-[280px]`}
              value={baseId ?? ''}
              onChange={(e) => {
                setBaseId(e.target.value === '' ? null : Number(e.target.value))
                setBaseValues([])
              }}
            >
              <option value="" className={ADMIN_OPTION}>
                항상 보임
              </option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id} className={ADMIN_OPTION}>
                  {candidate.label}
                </option>
              ))}
            </select>

            {base && (
              <>
                <span className="text-[13px] text-admin-ink-muted">의 답이</span>
                <div className="flex flex-wrap gap-1.5">
                  {conditionValueChoices.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() =>
                        setBaseValues((prev) =>
                          prev.includes(choice.value)
                            ? prev.filter((v) => v !== choice.value)
                            : [...prev, choice.value]
                        )
                      }
                      className={
                        baseValues.includes(choice.value)
                          ? ADMIN_ACCENT_BUTTON_SM
                          : ADMIN_GHOST_BUTTON
                      }
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
                <span className="text-[13px] text-admin-ink-muted">일 때만 보임</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={ADMIN_ACCENT_BUTTON_SM}
          disabled={saving || label.trim() === ''}
          onClick={handleSave}
        >
          {saving ? '저장 중…' : '저장'}
        </button>
        <button type="button" className={ADMIN_GHOST_BUTTON} disabled={saving} onClick={onDelete}>
          삭제
        </button>
      </div>
    </div>
  )
}

/** 동의 질문은 선택지가 없어 true/false 를 조건 값으로 쓴다. */
const conditionValuesOf = (question: FormQuestion): QuestionOption[] => {
  if (question.type === 'AGREEMENT') {
    return [
      { value: 'true', label: '동의함' },
      { value: 'false', label: '동의 안 함' }
    ]
  }
  return question.options ?? []
}

/** 조건의 기준이 될 수 있는 질문만 추린다. 서버 규칙과 같다 — 앞 순서 + 선택형. */
export const conditionCandidates = (
  questions: FormQuestion[],
  self: FormQuestion
): FormQuestion[] =>
  questions.filter(
    (candidate) =>
      candidate.id !== self.id &&
      candidate.sortOrder < self.sortOrder &&
      TYPES_USABLE_AS_CONDITION.includes(candidate.type)
  )
