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
import { tellAgent } from "./agent-message.mjs";
import { isMainModule } from "./is-main.mjs";

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

// **안내는 `tellAgent` 로만 낸다.** stdout 에 평문을 쓰면 훅 레코드의 `content` 까지는
// 가지만 에이전트 컨텍스트에는 들어오지 않는다 — 훅은 도는데 아무도 못 듣는 상태가 된다.
// 2026-08-05 프로브로 확정했다. 근거는 Server 리포의
// `.claude/work/harness-multirepo/verification.md`.
//
// **exit 0 을 지킨다.** 훅 JSON 은 exit 0 일 때만 파싱된다. 0 이 아니면 stdout 이 통째로
// 버려지므로, 실패를 알리려고 exit 1 을 내면 오히려 알림이 사라진다.

const isMain = isMainModule(import.meta.url, process.argv[1]);

if (isMain) {
  const repo = parseRepo(process.argv);

  const status = spawnSync("git", ["-C", repo, "status", "--porcelain"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (status.status !== 0) {
    // 리포를 못 읽으면 조용히 넘어가지 않는다. 검증이 죽은 것과 통과가 구별되어야 한다.
    tellAgent("Stop", `[검증] ${repo} 의 git 상태를 읽지 못해 검증을 건너뛴다.`);
    process.exit(0);
  }

  const { action } = decide({
    dirty: status.stdout.trim() !== "",
    toolReady: VERIFY.toolReady(repo),
  });

  if (action === "skip") process.exit(0);
  if (action === "tool-missing") {
    tellAgent("Stop", `[검증] ${repo}: ${VERIFY.toolMissingHint}`);
    process.exit(0);
  }

  // 빌드 출력은 사용자 화면용이라 stdio: "inherit" 로 그대로 흘린다. 판정은 아래에서
  // 따로 알린다 — 흘려보낸 출력은 에이전트에게 닿지 않기 때문이다.
  const res = spawnSync(VERIFY.command(repo), { cwd: repo, stdio: "inherit", shell: true });
  if (res.status !== 0) {
    // **exit 0 으로 끝낸다.** exit 1 이면 이 JSON 이 파싱되지 않아 실패가 조용해진다.
    tellAgent("Stop", `[검증] ${repo}: ${VERIFY.label} 실패. 고치기 전에는 완료라고 하지 마라.`);
    process.exit(0);
  }
  process.exit(0);
}
