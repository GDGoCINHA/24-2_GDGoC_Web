// 세션 시작 한 줄. **이 줄이 없으면 훅이 안 붙은 것이다.**
//
// 2026-08-04 세션에서 훅이 안 붙은 줄 모르고 작업할 뻔했다. 프로브를 쏴서야 알았고,
// 프로브를 쏠 생각을 안 했으면 죽은 가드를 믿고 위험한 작업을 했을 것이다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRepos, formatStatus } from "./session-start.mjs";

test("parseRepos: 인자가 없으면 현재 디렉터리 하나다", () => {
  assert.deepEqual(parseRepos([]), ["."]);
});

test("parseRepos: --repo 를 여러 번 받는다", () => {
  // 부모 폴더 세션은 두 리포를 한 번에 넘긴다.
  assert.deepEqual(parseRepos(["--repo", "24-2_GDGoC_Server", "--repo", "24-2_GDGoC_Web"]), [
    "24-2_GDGoC_Server",
    "24-2_GDGoC_Web",
  ]);
});

test("formatStatus: 한 줄이다", () => {
  // 매 세션 컨텍스트에 실리므로 길어지면 그 자체가 비용이다.
  const line = formatStatus([{ name: "Server", branch: "develop", dirty: false }]);
  assert.equal(line.includes("\n"), false);
});

test("formatStatus: 훅이 살아 있음과 리포 상태를 담는다", () => {
  const line = formatStatus([
    { name: "24-2_GDGoC_Server", branch: "chore/harness-multirepo", dirty: true },
    { name: "24-2_GDGoC_Web", branch: "chore/claude-harness", dirty: false },
  ]);
  assert.match(line, /하네스 훅 활성/);
  assert.match(line, /24-2_GDGoC_Server chore\/harness-multirepo/);
  assert.match(line, /24-2_GDGoC_Web chore\/claude-harness/);
});

test("formatStatus: dirty 와 clean 을 구별해 보여준다", () => {
  const dirty = formatStatus([{ name: "S", branch: "develop", dirty: true }]);
  const clean = formatStatus([{ name: "S", branch: "develop", dirty: false }]);
  assert.notEqual(dirty, clean);
});

test("formatStatus: 리포를 못 읽으면 그 사실을 감추지 않는다", () => {
  // 못 읽은 것을 clean 으로 보여주면 조용한 거짓말이 된다.
  const line = formatStatus([{ name: "S", branch: "", dirty: false }]);
  assert.match(line, /\?/);
});
