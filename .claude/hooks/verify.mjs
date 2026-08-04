#!/usr/bin/env node
// Stop 훅 — 턴이 끝날 때 이 리포가 여전히 성립하는지 확인한다.
//
// **변경이 있을 때만 돈다.** 부모 폴더 세션에서는 두 리포의 검증이 모두 등록되므로,
// 안 건드린 리포까지 빌드하면 매 턴이 느려진다.
//
// dirty 판정을 소스 경로로 좁히지 않는 이유: 경로 목록은 낡으면 **검증을 조용히
// 건너뛴다.** 낭비는 눈에 보이고 조용한 누락은 안 보인다. 이 하네스의 실패 이력이
// 전부 후자다.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

// --- 이 리포의 검증 방법. **리포마다 다른 유일한 부분이다.** -----------------
//
// `yarn build` 가 아니라 `tsc --noEmit` 인 이유:
// `next.config.ts` 에 `typescript.ignoreBuildErrors` 가 없으므로 `next build` 는 타입
// 검사를 포함한다 → `tsc --noEmit` 은 그 **부분집합**이다. "빌드는 통과하는데 훅만
// 막는" 상황이 구조적으로 생기지 않으면서 훨씬 빠르다.
//
// **한계:** `tsconfig.json` 이 strict:false, noImplicitAny:false, strictNullChecks:false
// 라 잡는 범위가 좁다. static export 고유 오류(`output: 'export'` 제약)는 못 잡는다.
// **진짜 게이트는 PR 직전의 `yarn build`** 다. 이 훅은 그걸 대신하지 않는다.
//
// npx 는 cwd 의 node_modules/.bin 을 먼저 뒤지므로 로컬 typescript 가 쓰인다.
const VERIFY = {
  label: "tsc --noEmit",
  command: () => "npx tsc --noEmit",
  toolReady: (repo) => existsSync(join(repo, "node_modules")),
  toolMissingHint: "node_modules 가 없어 타입 검사를 건너뛴다. `yarn install` 을 실행하라.",
};
// ---------------------------------------------------------------------------

/** `--repo <path>` 의 값. 없으면 현재 디렉터리 — 리포 안 세션은 인자가 필요 없다. */
export function parseRepo(argv) {
  const i = argv.indexOf("--repo");
  return i >= 0 && argv[i + 1] ? argv[i + 1] : ".";
}

/** @returns {{action: "skip"|"tool-missing"|"run"}} */
export function decide({ dirty, toolReady }) {
  if (!dirty) return { action: "skip" };
  if (!toolReady) return { action: "tool-missing" };
  return { action: "run" };
}

// --- CLI ------------------------------------------------------------------

const isMain =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));

if (isMain) {
  const repo = parseRepo(process.argv);

  const status = spawnSync("git", ["-C", repo, "status", "--porcelain"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (status.status !== 0) {
    // 리포를 못 읽으면 조용히 넘어가지 않는다. 검증이 죽은 것과 통과가 구별되어야 한다.
    console.error(`[검증] ${repo} 의 git 상태를 읽지 못해 검증을 건너뛴다.`);
    process.exit(0);
  }

  const { action } = decide({
    dirty: status.stdout.trim() !== "",
    toolReady: VERIFY.toolReady(repo),
  });

  if (action === "skip") process.exit(0);
  if (action === "tool-missing") {
    console.error(`[검증] ${repo}: ${VERIFY.toolMissingHint}`);
    process.exit(0);
  }

  const res = spawnSync(VERIFY.command(repo), { cwd: repo, stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`[검증] ${repo}: ${VERIFY.label} 실패 — 위 에러를 확인하라.`);
    process.exit(1);
  }
  process.exit(0);
}
