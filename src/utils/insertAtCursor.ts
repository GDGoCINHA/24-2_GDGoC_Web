/**
 * 커서 자리(선택 영역이 있으면 그 범위)를 insertion 으로 갈아 끼운 문자열을 돌려준다.
 *
 * <textarea> 를 직접 고치지 않고 새 문자열만 만든다 — 값은 React state 가 갖고 있다.
 * 위치를 인자로 받는 이유는 붙여넣기 직후 업로드가 끝날 때까지 시간이 걸려서다.
 * 그 사이 커서가 움직일 수 있으므로, 붙여넣은 시점의 자리를 잡아 두고 거기에 넣는다.
 */
export const insertAtCursor = (
  value: string,
  start: number,
  end: number,
  insertion: string
): string => value.slice(0, start) + insertion + value.slice(end)
