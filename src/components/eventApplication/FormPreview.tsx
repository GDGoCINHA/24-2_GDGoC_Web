'use client'

import { useMemo, useState } from 'react'

import { ADMIN_GHOST_BUTTON } from '@/components/admin/dashboard/adminStyles'
import QuestionField from '@/components/eventApplication/QuestionField'
import { DUSK_GHOST_BUTTON, DUSK_SUBMIT_BUTTON } from '@/components/ui/dusk/DuskForm'
import type { AnswerValue, FormQuestion } from '@/types/eventApplication'
import {
  findMissingRequired,
  visibleQuestionIds
} from '@/utils/eventApplication/questionVisibility'

/**
 * 폼 빌더 안의 미리보기.
 *
 * 부원이 보는 것과 같은 컴포넌트(QuestionField)와 같은 조건 판정
 * (questionVisibility)을 쓴다. 미리보기 전용으로 다시 그리면 여기서는 멀쩡한데
 * 실제 화면에서 다르게 보이는 일이 생긴다.
 *
 * 행사 상세는 dusk 배경이라 이 판만 어두운 색으로 두고, 폭은 폰에 맞춘다 —
 * 부원은 거의 폰으로 신청한다.
 */
export default function FormPreview({ questions }: { questions: FormQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({})

  const visible = useMemo(() => visibleQuestionIds(questions, answers), [questions, answers])
  const missing = useMemo(() => findMissingRequired(questions, answers), [questions, answers])

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-medium text-admin-ink">미리보기</p>
          <p className="text-[12px] leading-[1.6] text-admin-ink-dim">
            저장한 내용을 부원이 보는 그대로 그립니다. 답을 눌러보면 조건이 걸린 질문이 언제
            나타나는지 확인할 수 있고, 여기서 답한 내용은 저장되지 않습니다.
          </p>
        </div>
        <button
          type="button"
          className={ADMIN_GHOST_BUTTON}
          disabled={Object.keys(answers).length === 0}
          onClick={() => setAnswers({})}
        >
          답 지우기
        </button>
      </div>

      <div className="flex justify-center rounded-[16px] bg-dusk-base px-4 py-7">
        <div className="flex w-full max-w-[420px] flex-col gap-6 font-pretendard">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-dusk-ink-500">신청</p>
            <p className="text-[13px] text-dusk-ink-800">마감·정원 안내가 이 자리에 들어갑니다.</p>
          </div>

          {questions.length === 0 ? (
            <p className="text-[14px] leading-[1.7] text-dusk-ink-800">
              질문이 없습니다. 부원은 버튼만 눌러 참가 신청하게 됩니다.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {questions
                .filter((question) => visible.has(question.id))
                .map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                  />
                ))}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <div className="flex">
              <button
                type="button"
                disabled={missing.length > 0}
                className={missing.length > 0 ? DUSK_GHOST_BUTTON : DUSK_SUBMIT_BUTTON}
              >
                신청하기
              </button>
            </div>
            {missing.length > 0 && (
              <p className="text-[13px] text-dusk-ink-800">
                필수 항목을 채워주세요 — {missing.map((question) => question.label).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
