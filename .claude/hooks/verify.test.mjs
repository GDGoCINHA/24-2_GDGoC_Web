// 턴 종료 검증이 언제 도는가.
//
// 실제 컴파일은 CLI 가 한다. 여기서는 "이런 상태면 무엇을 해야 하나"만 고정한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, parseRepo } from "./verify.mjs";

test("변경이 없으면 건너뛴다", () => {
  // 부모 폴더 세션에서는 두 리포의 검증이 모두 등록된다. 안 건드린 리포까지
  // 빌드하면 매 턴이 느려진다.
  assert.equal(decide({ dirty: false, toolReady: true }).action, "skip");
  assert.equal(decide({ dirty: false, toolReady: false }).action, "skip");
});

test("변경이 있고 도구가 준비됐으면 검증한다", () => {
  assert.equal(decide({ dirty: true, toolReady: true }).action, "run");
});

test("변경이 있는데 도구가 없으면 알리되 막지는 않는다", () => {
  // Web 의 node_modules 부재가 이 경우다. 실패로 처리하면 yarn install
  // 전까지 모든 턴이 빨갛게 끝난다.
  assert.equal(decide({ dirty: true, toolReady: false }).action, "tool-missing");
});

test("parseRepo: --repo 가 없으면 현재 디렉터리다", () => {
  // 리포 안에서 띄운 세션은 인자 없이 지금과 같이 동작해야 한다.
  assert.equal(parseRepo([]), ".");
  assert.equal(parseRepo(["--repo"]), ".");
});

test("parseRepo: --repo 값을 읽는다", () => {
  assert.equal(parseRepo(["--repo", "24-2_GDGoC_Web"]), "24-2_GDGoC_Web");
});

// --- 이 리포 고유 ----------------------------------------------------------
//
// 이 리포는 node_modules 없이 클론된 상태로 시작한다. 그 상태에서 검증을 실패로
// 처리하면 `yarn install` 전까지 **모든 턴이 빨갛게 끝난다** — 훅을 끄게 만드는 지름길이다.

test("Web: node_modules 가 없으면 실패가 아니라 안내다", () => {
  const { action } = decide({ dirty: true, toolReady: false });
  assert.equal(action, "tool-missing");
  assert.notEqual(action, "run");
});
