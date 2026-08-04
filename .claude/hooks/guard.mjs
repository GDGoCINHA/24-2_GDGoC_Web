#!/usr/bin/env node
// PreToolUse 가드 — 되돌릴 수 없는 동작을 차단한다.
//
// 훅 입력은 **stdin 의 JSON** 으로 들어온다. 환경변수가 아니다.
// (이전 버전은 `$CLAUDE_TOOL_INPUT` 을 읽어 늘 빈 문자열이었고, 아무것도 막지 못하면서
//  막는 것처럼 보였다. `guard.test.mjs` 가 그 회귀를 고정한다.)
//
// 판정은 `judge()` 하나에 모아 두고 CLI 는 입출력만 한다 — 그래야 테스트가 붙는다.

// 셸 툴 — 이 툴들은 command 를 못 읽으면 판정 불가로 보고 차단한다.
const SHELL_TOOLS = new Set(["Bash", "PowerShell"]);

const DESTRUCTIVE = [
  // rm -rf / -fr / -Rf / -rfv ... 플래그 뭉치에 r 과 f 가 함께 있으면 잡는다.
  [/\brm\s+-[a-zA-Z]*([rR][a-zA-Z]*[fF]|[fF][a-zA-Z]*[rR])/, "`rm -rf` 는 되돌릴 수 없다"],
  // PowerShell 의 재귀 삭제. `-Force` 없이도 트리를 지운다.
  // PowerShell 은 파라미터 축약을 허용하므로 `-Rec` 접두사로 본다.
  [
    /\b(Remove-Item|ri|rd|rmdir)\b[^\n]*\s-[Rr]ec/,
    "`Remove-Item -Recurse` 는 되돌릴 수 없다",
  ],
  [/\bgit\s+push\b[^\n]*\s(--force\b|-f\b)/, "force push 는 남의 커밋을 지운다"],
  [/\bgit\s+reset\s+--hard\b/, "`git reset --hard` 는 작업 트리를 버린다"],
  [/\bDROP\s+TABLE\b/i, "`DROP TABLE` 은 되돌릴 수 없다"],
  [/\bTRUNCATE\b/i, "`TRUNCATE` 는 되돌릴 수 없다"],
];

const PRODUCTION = [
  [/\bdeploy\.prod\.sh\b/, "운영 배포 스크립트다"],
  [/\bdocker-compose-prod\.yml\b/, "운영 컴포즈 파일이다"],
  // `git push -u origin main` 처럼 플래그가 끼어도 잡히도록 위치를 고정하지 않는다.
  // 단 ref 끝이 main·master 일 때만 — `feature/main-menu` 는 대상이 아니다.
  //
  // 두 이름을 모두 막는 이유: Server 의 운영 브랜치는 main, Web 은 master 다.
  // 둘 다 막으면 이 파일이 리포에 무관해져 사본이 어느 쪽이든 판정이 같고,
  // 부모 폴더 배선에서 가드를 한 번만 호출하면 된다.
  [/\bgit\s+push\b.*\b(main|master)(\s|$)/, "main·master 푸시는 운영 자동 배포를 트리거한다"],
];

/**
 * @returns {{reason: string} | null}  차단이면 사유, 통과면 null
 */
export function judge(input) {
  // 판정할 수 없으면 통과가 아니라 차단한다(fail-closed).
  // 조용히 통과시키면 가드가 없는 것과 같다.
  if (input === null || typeof input !== "object") {
    return { reason: "훅 입력을 해석할 수 없다" };
  }

  const command = input?.tool_input?.command;
  if (SHELL_TOOLS.has(input.tool_name) && typeof command !== "string") {
    return { reason: `${input.tool_name} 호출인데 command 를 읽을 수 없다` };
  }
  if (typeof command !== "string") return null;

  for (const [re, why] of DESTRUCTIVE) {
    if (re.test(command)) return { reason: `${why}. 사용자 확인 없이 실행하지 마라.` };
  }
  for (const [re, why] of PRODUCTION) {
    if (re.test(command)) {
      return { reason: `${why}. 머지 즉시 자동 배포되므로 사용자 확인 없이 실행하지 마라.` };
    }
  }
  return null;
}

// --- CLI ------------------------------------------------------------------
// 이 파일이 직접 실행될 때만 stdin 을 읽는다. import 하는 테스트는 여기 오지 않는다.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (raw += d));
  process.stdin.on("end", () => {
    let verdict;
    try {
      verdict = judge(JSON.parse(raw));
    } catch {
      verdict = { reason: "훅 입력 JSON 을 파싱하지 못했다" };
    }
    if (!verdict) process.exit(0);
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `BLOCKED: ${verdict.reason}`,
        },
      })
    );
    process.exit(0);
  });
}
