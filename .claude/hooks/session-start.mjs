#!/usr/bin/env node
// SessionStart 훅 — 턴 0에 한 줄. stdout 이 컨텍스트에 실린다.
//
// **이 줄이 없으면 훅이 안 붙은 것이다.**
//
// 2026-08-04 세션에서 훅이 안 붙은 줄 모르고 작업할 뻔했다. 프로브를 쏴서야 알았고,
// 프로브를 쏠 생각을 안 했으면 죽은 가드를 믿고 위험한 작업을 했을 것이다.
// 컨텍스트 비용은 한 줄, 얻는 것은 세션 전체다.
//
// 출력은 **검증 가능한 것만** 담는다. "guard 활성" 같은 문구는 settings.json 이
// 바뀌면 거짓말이 된다 — 이 스크립트가 아는 건 자기가 실행됐다는 사실과 리포 상태뿐이다.
// 개별 가드까지 확인하려면 README 의 프로브를 쓴다.

import { spawnSync } from "node:child_process";
import { basename, resolve } from "node:path";

/** `--repo` 를 여러 번 받는다. 없으면 현재 디렉터리 하나. */
export function parseRepos(argv) {
  const repos = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--repo" && argv[i + 1]) repos.push(argv[i + 1]);
  }
  return repos.length ? repos : ["."];
}

/**
 * 한 줄로 만든다. 매 세션 컨텍스트에 실리므로 길어지면 그 자체가 비용이다.
 * @param {Array<{name: string, branch: string, dirty: boolean}>} repos
 */
export function formatStatus(repos) {
  const parts = repos.map((r) =>
    // 못 읽은 것을 clean 으로 보여주면 조용한 거짓말이 된다.
    r.branch ? `${r.name} ${r.branch} ${r.dirty ? "●dirty" : "✓clean"}` : `${r.name} ?`
  );
  return `하네스 훅 활성 | ${parts.join(" | ")}`;
}

// --- CLI ------------------------------------------------------------------

const isMain =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));

if (isMain) {
  const git = (repo, args) => {
    const res = spawnSync("git", ["-C", repo, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return res.status === 0 ? res.stdout.trim() : null;
  };

  const repos = parseRepos(process.argv).map((repo) => {
    const branch = git(repo, ["rev-parse", "--abbrev-ref", "HEAD"]);
    const status = git(repo, ["status", "--porcelain"]);
    return {
      name: repo === "." ? basename(resolve(repo)) : repo,
      branch: branch ?? "",
      dirty: status !== null && status !== "",
    };
  });

  console.log(formatStatus(repos));
  process.exit(0);
}
