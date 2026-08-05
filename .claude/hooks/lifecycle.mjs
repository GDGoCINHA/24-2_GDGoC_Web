#!/usr/bin/env node
// 산출물 수명 훅 — 작업 공간이 조용히 쌓이는 것을 막는다.
//
// 두 가지만 본다.
//   회수: 머지된 브랜치의 `.claude/work/<과제>/` 가 남아 있나  (Stop)
//   승격: PR 을 올리려는데 `work/` 에 아직 판정 안 한 산출물이 있나  (PreToolUse)
//
// 판정은 순수 함수로 두고 git·fs 접근은 CLI 쪽에 모았다 — 그래야 테스트가 붙는다.
// 규칙 본문은 `.claude/rules/artifact-lifecycle.md` 가 정본이다.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tellAgent } from "./agent-message.mjs";

// master 는 Web 리포의 운영 브랜치다. 두 리포가 사본을 공유하므로 함께 보호한다.
const PROTECTED = new Set(["develop", "main", "master", "HEAD", ""]);
const PREFIXES = /^(feature|fix|chore|hotfix|refactor|test|docs)\//;

/** 브랜치 이름 → 과제 이름. 과제가 아니면 null. */
export function taskFromBranch(branch) {
  if (branch == null || PROTECTED.has(branch)) return null;
  const withoutPrefix = branch.replace(PREFIXES, "");
  if (!withoutPrefix) return null;
  // 디렉터리 이름이므로 남은 슬래시는 하이픈으로 접는다.
  return withoutPrefix.replace(/\//g, "-");
}

/** 머지가 끝났는데 아직 작업 공간이 남아 있는 과제들. */
export function retirementTargets({ workDirs, mergedTasks }) {
  const merged = new Set(mergedTasks);
  return workDirs.filter((d) => merged.has(d));
}

/** 이 명령이 PR 생성인가. `gh pr view`·`merge`·`list` 는 아니다. */
export function isPrCreate(command) {
  return typeof command === "string" && /\bgh\s+pr\s+create\b/.test(command);
}

/** `--repo <path>` 의 값. 없으면 현재 디렉터리 — 리포 안 세션은 인자가 필요 없다. */
export function parseRepo(argv) {
  const i = argv.indexOf("--repo");
  return i >= 0 && argv[i + 1] ? argv[i + 1] : ".";
}

/**
 * 안내에 찍을 작업 공간 경로.
 * 부모 폴더 세션에서는 cwd 가 리포 밖이므로 리포 이름이 앞에 붙어야
 * **찍힌 명령을 그대로 실행할 수 있다.**
 */
export function workPath(repo, task) {
  return repo === "." ? `.claude/work/${task}` : `${repo}/.claude/work/${task}`;
}

/** 회수 안내. 대상이 없으면 null — 조건을 만족할 때만 말한다. */
export function retirementNotice({ repo, targets }) {
  if (!targets.length) return null;
  const moves = targets
    .map((t) => `  mv ${workPath(repo, t)} ${workPath(repo, t).replace("/work/", "/attic/")}`)
    .join("\n");
  return (
    `[산출물 수명] 머지가 끝난 과제의 작업 공간이 남아 있다: ${targets.join(", ")}\n` +
    moves +
    "\n삭제가 아니라 이동이다. 되돌릴 수 있다."
  );
}

/** PR 직전에 띄울 승격 안내. 판정할 게 없으면 null. */
export function promotionNotice({ repo, task, workFileCount }) {
  if (!task || workFileCount <= 0) return null;
  return [
    `[산출물 수명] ${workPath(repo, task)}/ 에 파일 ${workFileCount}개가 있다.`,
    "PR 을 올리기 전에 레포에 남길 것을 판정하라.",
    "  · 남긴다면 docs/<주제>.md 최종본으로 쓰고 기존 문서에 엮는다.",
    "    최종본은 근거·판정 사유·재생성 방법 셋을 담아야 작업 공간을 버릴 수 있다.",
    "  · 남기지 않는다면 그대로 둔다. 머지 후 attic 으로 회수된다.",
    "규칙: .claude/rules/artifact-lifecycle.md",
  ].join("\n");
}

// --- 수집 ------------------------------------------------------------------

const git = (repo, ...args) => {
  try {
    return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

function currentBranch(repo) {
  return git(repo, "rev-parse", "--abbrev-ref", "HEAD");
}

function workDirs(repo) {
  const dir = join(repo, ".claude/work");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile()) n += 1;
  }
  return n;
}

/** develop 에 이미 들어간 브랜치들의 과제 이름. */
function mergedTasks(repo) {
  const out = git(repo, "branch", "--merged", "origin/develop", "--format=%(refname:short)");
  if (!out) return [];
  return out
    .split("\n")
    .map((b) => taskFromBranch(b.trim()))
    .filter(Boolean);
}

// --- CLI -------------------------------------------------------------------
// stdin 은 읽지 않는다. 이 훅은 훅 입력이 아니라 레포 상태를 본다.
//   node lifecycle.mjs retire  [--repo <path>]  → 회수 대상 보고 (Stop)
//   node lifecycle.mjs promote [--repo <path>]  → 승격 안내 (PreToolUse, gh pr create 직전)
//
// `--repo` 기본값은 `.` 이다. 부모 폴더에서 띄운 세션은 cwd 가 리포 밖이므로
// 대상 리포를 명시해야 한다 — 없으면 조용히 아무것도 찾지 못한다.

const isMain =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));

if (isMain) {
  const mode = process.argv[2];
  const repo = parseRepo(process.argv);

  if (mode === "retire") {
    const notice = retirementNotice({
      repo,
      targets: retirementTargets({ workDirs: workDirs(repo), mergedTasks: mergedTasks(repo) }),
    });
    // 평문 stdout 은 에이전트에 닿지 않는다 — `agent-message.mjs` 주석 참조.
    if (notice) tellAgent("Stop", notice);
    process.exit(0);
  }

  if (mode === "promote") {
    // 이 모드만 stdin(훅 입력)을 읽는다. PR 생성 명령일 때만 말한다.
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (raw += d));
    process.stdin.on("end", () => {
      let command = "";
      try {
        command = JSON.parse(raw)?.tool_input?.command ?? "";
      } catch {
        // 입력을 못 읽으면 조용히 넘어간다. 이 훅은 안내일 뿐 차단이 아니므로
        // fail-closed 로 막을 이유가 없다 — 가드(guard.mjs)와 역할이 다르다.
      }
      if (!isPrCreate(command)) process.exit(0);

      const task = taskFromBranch(currentBranch(repo));
      const notice = promotionNotice({
        repo,
        task,
        workFileCount: task ? countFiles(join(repo, ".claude/work", task)) : 0,
      });
      // PreToolUse 는 stdout 이 JSON 제어 채널이다. 평문을 흘리면 파싱과 섞이므로
      // 안내도 반드시 JSON 으로 싣는다. 이 훅은 차단하지 않으므로 결정 필드는 없다.
      if (notice) tellAgent("PreToolUse", notice);
      process.exit(0);
    });
  } else if (mode !== "retire") {
    console.error("사용법: lifecycle.mjs <retire|promote> [--repo <path>]");
    process.exit(2);
  }
}
