// 훅이 에이전트에게 말하는 유일한 통로.
//
// 이 형식이 아니면 **말은 나가지만 아무에게도 닿지 않는다.** 2026-08-05 실측:
//
// | 방식 | 훅 레코드 | 에이전트 |
// |---|---|---|
// | `console.error` (stderr) | `stderr` 에만 남음 | 안 닿음 |
// | `console.log` (평문 stdout) | `content` 까지 감 | **안 닿음** |
// | `hookSpecificOutput.additionalContext` | — | **닿음** |
//
// 세 번째만 통한다. 프로브 원문은 Server 리포의
// `.claude/work/harness-multirepo/verification.md` 에 있다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { agentMessage } from "./agent-message.mjs";

test("hookSpecificOutput.additionalContext 로 싣는다", () => {
  // 이 세 필드의 위치가 계약이다. 하나라도 어긋나면 조용히 사라진다.
  const parsed = JSON.parse(agentMessage("Stop", "검증 실패"));
  assert.deepEqual(parsed, {
    hookSpecificOutput: {
      hookEventName: "Stop",
      additionalContext: "검증 실패",
    },
  });
});

test("이벤트 이름을 그대로 싣는다", () => {
  // Stop 과 PreToolUse 가 같은 함수를 쓴다. 이름이 이벤트와 다르면 무시된다.
  assert.equal(JSON.parse(agentMessage("PreToolUse", "x")).hookSpecificOutput.hookEventName, "PreToolUse");
});

test("한 줄이다", () => {
  // 훅 stdout 은 JSON 으로 파싱된다. 개행이 섞이면 파싱이 깨질 수 있다.
  assert.ok(!agentMessage("Stop", "여러\n줄\n텍스트").includes("\n"));
});

test("줄바꿈은 이스케이프되어 보존된다", () => {
  // 안내문은 여러 줄일 수 있다. JSON 이스케이프로 살아남아야 한다.
  assert.equal(JSON.parse(agentMessage("Stop", "첫 줄\n둘째 줄")).hookSpecificOutput.additionalContext, "첫 줄\n둘째 줄");
});
