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

  /**
   * 아직 저장하지 않은 편집이 남아 있는지.
   *
   * 이 편집기는 서버 값을 첫 상태로만 받고 그 뒤로는 스스로 들고 있다. 저장을 누르지 않으면
   * 화면은 고친 값을 보여주지만 부원이 보는 폼과 미리보기는 여전히 옛 값이다 — 유형을
   * 「객관식 (하나)」로 바꿔 두고 저장하지 않으면 화면에는 하나만 고를 수 있는 것처럼
   * 보이는데 실제로는 체크박스 그대로다. 그래서 어긋난 상태를 눈에 보이게 적는다.
   */
  const unsaved =
    shapeOf(
      type,
      label,
      helpText.trim() === '' ? null : helpText,
      needsOptions ? options : null,
      isRequired,
      baseId,
      baseValues
    ) !== questionRevision(question)

  /** 선택형인데 선택지가 없거나 문구가 빈 것이 있으면 서버가 400 으로 막는다. 미리 잠근다. */
  const optionsIncomplete =
    needsOptions && (options.length === 0 || options.some((option) => option.label.trim() === ''))

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
            {/*
              파일 첨부는 입력칸이 아직 잠겨 있어 부원이 답할 수 없다. 필수로 걸면 아무도
              제출하지 못하는 폼이 되므로 고를 수 없게 둔다. 이미 이 유형인 질문은 유형이
              사라져 보이지 않도록 그대로 남긴다.
            */}
            {QUESTION_TYPES.map((option) => (
              <option
                key={option}
                value={option}
                disabled={option === 'FILE' && type !== 'FILE'}
                className={ADMIN_OPTION}
              >
                {QUESTION_TYPE_LABEL[option]}
                {option === 'FILE' ? ' (준비 중)' : ''}
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

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={ADMIN_ACCENT_BUTTON_SM}
          disabled={saving || label.trim() === '' || optionsIncomplete}
          onClick={handleSave}
        >
          {saving ? '저장 중…' : '저장'}
        </button>
        <button type="button" className={ADMIN_GHOST_BUTTON} disabled={saving} onClick={onDelete}>
          삭제
        </button>
        {unsaved && !saving && (
          <span className="text-[12px] text-signal-err">
            저장하지 않았습니다 — 부원에게는 아직 옛 내용이 보입니다.
          </span>
        )}
      </div>

      {optionsIncomplete && (
        <p className="text-[12px] text-admin-ink-dim">
          {options.length === 0
            ? '선택지를 하나 이상 넣어야 저장할 수 있습니다.'
            : '문구가 비어 있는 선택지가 있습니다.'}
        </p>
      )}
    </div>
  )
}

/**
 * 서버가 준 질문의 지문.
 *
 * 부모가 이것을 `key` 에 넣어, 저장이 실제로 반영됐을 때만 편집기를 새 값으로 다시
 * 세운다. 저장이 실패하면 지문이 그대로라 사용자가 치던 내용이 살아남는다.
 *
 * sortOrder 는 넣지 않는다 — 다른 질문을 위아래로 옮기면 이 질문의 순서도 따라 바뀌는데,
 * 그때 편집 중이던 내용까지 되돌아가면 안 된다.
 */
export const questionRevision = (question: FormQuestion): string =>
  shapeOf(
    question.type,
    question.label,
    question.helpText,
    question.options,
    question.isRequired,
    question.visibleWhenQuestionId,
    question.visibleWhenValues
  )

/** 저장되는 값만 추린 문자열. 키 순서에 흔들리지 않게 배열로 편다. */
const shapeOf = (
  type: QuestionType,
  label: string,
  helpText: string | null,
  options: QuestionOption[] | null,
  isRequired: boolean,
  baseId: number | null,
  baseValues: string[] | null
): string =>
  JSON.stringify([
    type,
    label,
    helpText ?? '',
    (options ?? []).map((option) => [option.value, option.label]),
    isRequired,
    baseId,
    baseId == null ? [] : (baseValues ?? [])
  ])

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
