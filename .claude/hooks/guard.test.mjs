// 가드가 "막는다고 적어둔 것"을 실제로 막나.
//
// 이 파일이 있는 이유: 2026-08-04 이전의 가드는 `$CLAUDE_TOOL_INPUT` 환경변수를 읽었는데
// 훅 입력은 stdin 으로 들어온다. 변수가 늘 비어 grep 이 실패했고, 가드는 **아무것도 막지
// 않으면서 막는 것처럼 보였다.** 조용히 죽은 가드는 없는 가드보다 위험하다 —
// 막힌다고 믿고 위험한 작업을 하기 때문이다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { judge } from "./guard.mjs";

const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });

test("파괴적 명령을 막는다", () => {
  const blocked = [
    "rm -rf /tmp/x",
    "rm -fr /tmp/x",
    "rm -Rf /tmp/x",
    "git push --force origin feature/x",
    "git push -f origin feature/x",
    "git reset --hard HEAD~3",
    "psql -c 'DROP TABLE users'",
    "psql -c 'TRUNCATE users'",
  ];
  for (const c of blocked) {
    assert.ok(judge(bash(c)), `막아야 한다: ${c}`);
  }
});

test("운영 배포 경로를 막는다", () => {
  const blocked = [
    "bash deploy.prod.sh",
    "docker-compose -f docker-compose-prod.yml up -d",
    "git push origin main",
    "git push origin HEAD:main",
    "git push -u origin main", // 기존 패턴은 `\S+\s+main` 이라 -u 가 끼면 새어나갔다
    // Web 리포의 운영 브랜치는 master 다. 부모 폴더 세션에서 두 리포를 함께
    // 다루면 이 구멍이 실제로 밟힌다.
    "git push origin master",
    "git push origin HEAD:master",
    "git push -u origin master",
  ];
  for (const c of blocked) {
    assert.ok(judge(bash(c)), `막아야 한다: ${c}`);
  }
});

test("정상 명령은 통과시킨다", () => {
  const allowed = [
    "git push origin feature/eventboard",
    "git push -u origin fix/deploy-image-prune-order",
    "./gradlew compileJava compileTestJava",
    "git log --oneline -20",
    "docker-compose -f docker-compose-dev.yml up -d",
    "bash deploy.dev.sh",
    "rm build/tmp/scratch",       // -rf 가 아니다
    "rm -r build/tmp",            // -f 가 없다
    "git reset HEAD~1",           // --hard 가 아니다
    "git branch --merged develop",
    "git push origin feature/main-menu", // 브랜치 이름에 main 이 들어갈 뿐이다
    "git push origin feature/master-detail", // 브랜치 이름에 master 가 들어갈 뿐이다
  ];
  for (const c of allowed) {
    assert.equal(judge(bash(c)), null, `통과해야 한다: ${c}`);
  }
});

test("입력이 깨졌으면 통과가 아니라 차단한다 (fail-closed)", () => {
  // 판정할 수 없으면 막는다. 조용히 통과시키면 가드가 없는 것과 같다.
  assert.ok(judge(null), "null 입력은 차단");
  assert.ok(judge("not an object"), "문자열 입력은 차단");
  assert.ok(judge({ tool_name: "Bash" }), "Bash 인데 command 가 없으면 차단");
});

// --- 여기부터는 "막히지 않는다"를 고정한다 -------------------------------
//
// 가드는 명령 **문자열만** 본다. 문자열에 드러나지 않으면 판정할 방법이 없다.
// 이걸 정규식으로 막으려 하면 정상 명령까지 잡혀 가드를 못 쓰게 된다.
// 그래서 막는 대신 **아는 구멍으로 고정**한다 — 막힌다고 오해하는 것이 모르는 것보다 위험하다.

test("아는 구멍: 스크립트 안의 내용은 보이지 않는다", () => {
  assert.equal(judge(bash("bash scripts/cleanup.sh")), null);
  assert.equal(judge(bash("./gradlew someTaskThatDeploys")), null);
});

test("아는 구멍: 변수 치환은 셸이 한다", () => {
  assert.equal(judge(bash("P=push; git $P --force origin main")), null);
  assert.equal(judge(bash('eval "$DANGEROUS_CMD"')), null);
});

// --- PowerShell -----------------------------------------------------------
//
// 이 PC 의 주 셸이 PowerShell 이다. Bash 만 보면 `Remove-Item -Recurse` 로 그냥 지나간다.
// 툴을 바꾸는 것만으로 벗어날 수 있으면 가드가 없는 것과 같다.

const pwsh = (command) => ({ tool_name: "PowerShell", tool_input: { command } });

test("PowerShell 의 재귀 삭제를 막는다", () => {
  const blocked = [
    "Remove-Item -Recurse -Force C:\\build",
    "Remove-Item -Force -Recurse C:\\build",
    "Remove-Item -Rec C:\\build",       // PowerShell 은 파라미터 축약을 허용한다
    "ri -Recurse C:\\build",
    "rmdir -Recurse C:\\build",
  ];
  for (const c of blocked) {
    assert.ok(judge(pwsh(c)), `막아야 한다: ${c}`);
  }
});

test("PowerShell 에서도 git·SQL·운영 패턴이 그대로 걸린다", () => {
  // 명령 문자열이 같으므로 별도 패턴이 필요 없다.
  for (const c of [
    "git push origin main",
    "git reset --hard HEAD~1",
    "psql -c 'DROP TABLE users'",
    "bash deploy.prod.sh",
  ]) {
    assert.ok(judge(pwsh(c)), `막아야 한다: ${c}`);
  }
});

test("PowerShell 정상 명령은 통과시킨다", () => {
  const allowed = [
    "Remove-Item C:\\build\\tmp\\scratch.txt", // -Recurse 가 없다
    "Get-ChildItem -Recurse -Filter *.java",   // 삭제가 아니다
    "Select-String -Pattern 'Remove-Item' -Path notes.md",
    "./gradlew compileJava",
    "git push origin feature/eventboard",
  ];
  for (const c of allowed) {
    assert.equal(judge(pwsh(c)), null, `통과해야 한다: ${c}`);
  }
});

test("PowerShell 도 fail-closed 다", () => {
  assert.ok(judge({ tool_name: "PowerShell" }), "command 가 없으면 차단");
});
