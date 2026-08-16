/**
 * textarea 의 커서 자리에 텍스트를 끼워 넣은 결과를 돌려준다. 선택 영역이 있으면 그것을 덮는다.
 * ref 가 아직 없으면(포커스한 적이 없는 경우) 끝에 줄을 바꿔 붙인다.
 *
 * <textarea> 를 직접 고치지 않고 새 문자열만 만든다 — 값은 React state 가 갖고 있다.
 */
export const insertAtCursor = (
  textarea: HTMLTextAreaElement | null,
  value: string,
  insertion: string
): string => {
  if (!textarea) return value ? `${value}\n${insertion}` : insertion

  const start = textarea.selectionStart ?? value.length
  const end = textarea.selectionEnd ?? value.length
  return value.slice(0, start) + insertion + value.slice(end)
}
