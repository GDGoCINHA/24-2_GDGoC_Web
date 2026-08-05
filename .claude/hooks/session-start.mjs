#!/usr/bin/env node
// SessionStart 훅 — 턴 0에 한 줄. stdout 이 컨텍스트에 실린다.
//
// **이 줄이 없으면 훅이 안 붙은 것이다.**
//
// 2026-08-04, 훅이 배선되지 않은 채로 세션이 진행된 적이 있다. 프로브를 쏘기 전까지
// 드러나지 않았다 — 죽은 가드와 조용한 가드는 출력이 같기 때문이다. 그 상태에서는
// 막힌다고 믿고 위험한 작업을 하게 된다.
// 컨텍스트 비용은 한 줄, 얻는 것은 세션 전체다.
//
// 출력은 **검증 가능한 것만** 담는다. "guard 활성" 같은 문구는 settings.json 이
// 바뀌면 거짓말이 된다 — 이 스크립트가 아는 건 자기가 실행됐다는 사실과 리포 상태뿐이다.
// 개별 가드까지 확인하려면 README 의 프로브를 쓴다.

import { spawnSync } from "node:child_process";
import { basename, resolve } from "node:path";
import { isMainModule } from "./is-main.mjs";

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

const isMain = isMainModule(import.meta.url, process.argv[1]);

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
