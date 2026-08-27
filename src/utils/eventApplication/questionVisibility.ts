import type { AnswerValue, FormQuestion } from '@/types/eventApplication'

/**
 * 답변을 놓고 각 질문이 보이는지 판정한다.
 *
 * ⚠️ 같은 판정이 서버의 QuestionConditionEvaluator 에도 있다. 한쪽만 고치면
 * 화면에는 보이는데 서버가 필수라고 거절하거나 그 반대가 된다. 규칙을 바꿀 때는
 * 반드시 양쪽을 함께 고친다.
 *
 * 기준 질문이 자기보다 앞 순서라는 규칙(서버가 강제) 덕분에 한 번 훑으면 끝난다.
 */
export const visibleQuestionIds = (
  questions: FormQuestion[],
  answers: Record<number, AnswerValue>
): Set<number> => {
  const visible = new Set<number>()
  const byId = new Map<number, FormQuestion>()
  questions.forEach((question) => byId.set(question.id, question))

  for (const question of questions) {
    if (question.visibleWhenQuestionId == null) {
      visible.add(question.id)
      continue
    }

    const base = byId.get(question.visibleWhenQuestionId)
    // 기준 질문이 지워졌으면 판정할 수 없다. 숨기는 쪽이 안전하다.
    if (!base) continue
    // 기준 질문 자체가 숨겨져 있으면 답이 있을 수 없다.
    if (!visible.has(base.id)) continue

    if (matches(answers[base.id], question.visibleWhenValues)) {
      visible.add(question.id)
    }
  }

  return visible
}

/** 다중선택은 고른 값 중 하나라도 걸리면 참이다. */
export const matches = (answer: AnswerValue | undefined, expected: string[] | null): boolean => {
  if (answer == null || !expected || expected.length === 0) return false

  if (Array.isArray(answer)) {
    return answer.some((item) => item != null && expected.includes(String(item)))
  }
  return expected.includes(String(answer))
}

/** 제출할 답변만 남긴다. 숨겨진 질문의 값은 화면에 남아 있어도 보내지 않는다. */
export const collectSubmittableAnswers = (
  questions: FormQuestion[],
  answers: Record<number, AnswerValue>
): { questionId: number; value: AnswerValue }[] => {
  const visible = visibleQuestionIds(questions, answers)

  return questions
    .filter((question) => visible.has(question.id))
    .map((question) => ({ questionId: question.id, value: answers[question.id] ?? null }))
    .filter((entry) => !isEmpty(entry.value))
}

/** 보이는 필수 질문 중 아직 채우지 못한 것. 제출 버튼을 막는 데 쓴다. */
export const findMissingRequired = (
  questions: FormQuestion[],
  answers: Record<number, AnswerValue>
): FormQuestion[] => {
  const visible = visibleQuestionIds(questions, answers)

  return questions.filter(
    (question) =>
      visible.has(question.id) && question.isRequired && !isAnswered(question, answers[question.id])
  )
}

/**
 * 필수 질문이 채워졌는지.
 *
 * 필수 동의 항목은 체크를 해야 채워진 것으로 본다. 체크를 풀어도 '답했다'고 보면
 * 개인정보 동의에 동의하지 않고 신청이 되어버린다. 서버 AnswerValidator 도 같은 규칙이다.
 */
export const isAnswered = (question: FormQuestion, value: AnswerValue | undefined): boolean => {
  if (question.type === 'AGREEMENT') return value === true
  return !isEmpty(value)
}

export const isEmpty = (value: AnswerValue | undefined): boolean => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}
