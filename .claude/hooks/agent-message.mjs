#!/usr/bin/env node
// 훅이 에이전트에게 말하는 유일한 통로.
//
// **평문으로 쓰면 사라진다.** `console.error` 는 훅 레코드의 `stderr` 에만 남고,
// `console.log` 는 `content` 까지 가지만 에이전트 컨텍스트에는 들어오지 않는다.
// 2026-08-05 에 프로브로 확정했다. 근거는 Server 리포에 있다 —
// `24-2_GDGoC_Server/.claude/work/harness-multirepo/verification.md`.
//
// 이 하네스의 실패 이력이 전부 "훅은 도는데 아무도 못 듣는" 형태였다. 조언을 낼 때는
// **반드시 이 함수를 쓴다.**
//
// 차단(deny)은 이것과 다른 채널이다 — `permissionDecision`/`permissionDecisionReason`
// 은 그 자체로 에이전트에 전달되므로 그대로 두면 된다.

/**
 * @param {"Stop"|"PreToolUse"} event 훅 이벤트 이름. 실제 이벤트와 달라도 조용히 무시된다.
 * @param {string} text 에이전트에게 보일 문장.
 * @returns {string} stdout 에 그대로 쓸 JSON 한 줄.
 */
export function agentMessage(event, text) {
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: event, additionalContext: text },
  });
}

/** `agentMessage` 를 stdout 으로 내보낸다. 훅 CLI 에서 쓰는 형태. */
export function tellAgent(event, text) {
  process.stdout.write(agentMessage(event, text) + "\n");
}
