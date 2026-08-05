// 반대쪽 리포의 사본과 어긋났는지 대조한다.
//
// **왜 필요한가:** 사본은 각자 자기 테스트를 통과하므로, 두 사본이 달라져도 양쪽 다
// 초록불이다. 드리프트를 잡으려면 사본끼리 맞대봐야 한다.
//
// **왜 훅이 아니라 테스트인가:** 훅은 배선이 필요하고 배선은 세션 시작 때만 읽힌다.
// 테스트는 기존 `node --test ".claude/hooks/*.test.mjs"` 한 줄에 얹히고, 훅을 고칠 때
// 자연히 함께 돈다.
//
// **상대 리포가 없으면 skip 한다.** `node --test` 출력에 skipped 로 찍히므로 조용한
// 통과가 아니다 — 통과와 미판정이 출력으로 구별된다. **skip 을 통과로 읽지 마라.**
//
// 이 파일 자신도 대조 대상이다. 그래서 상대 리포 이름을 상수로 박지 않고 목록에서
// 유도한다 — 박으면 두 사본이 서로 달라져 이 테스트가 자기 자신을 잡는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** 나란히 놓이는 두 리포. 어느 쪽 사본이든 이 목록은 같다. */
const REPOS = ["24-2_GDGoC_Server", "24-2_GDGoC_Web"];

/** 완전히 동일해야 하는 사본. 리포 루트 기준 경로다. */
const SHARED = [
  ".claude/hooks/guard.mjs",
  ".claude/hooks/guard.test.mjs",
  ".claude/hooks/lifecycle.mjs",
  ".claude/hooks/lifecycle.test.mjs",
  ".claude/hooks/session-start.mjs",
  ".claude/hooks/session-start.test.mjs",
  ".claude/hooks/agent-message.mjs",
  ".claude/hooks/agent-message.test.mjs",
  ".claude/hooks/sync.test.mjs",
  ".claude/rules/artifact-lifecycle.md",
];

const THIS_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const otherName = REPOS.includes(basename(THIS_REPO))
  ? REPOS.find((r) => r !== basename(THIS_REPO))
  : null;
const other = otherName ? resolve(THIS_REPO, "..", otherName) : null;

// 못 하는 이유를 문자열로 남긴다. node:test 는 skip 사유를 출력에 함께 찍는다.
const skip = !other
  ? `리포 디렉터리 이름이 ${REPOS.join("·")} 가 아니라 반대쪽을 찾지 못했다`
  : !existsSync(other)
    ? `반대쪽 리포(${otherName})가 없다 — 대조하지 못했다`
    : false;

/** CRLF/LF 차이는 드리프트가 아니다. 내용만 본다. */
const norm = (s) => s.replace(/\r\n/g, "\n");

for (const rel of SHARED) {
  test(`사본 일치: ${rel}`, { skip }, () => {
    assert.equal(
      norm(readFileSync(join(THIS_REPO, rel), "utf8")),
      norm(readFileSync(join(other, rel), "utf8")),
      `${rel} 가 반대쪽 리포와 다르다. 사본은 양쪽을 함께 고쳐야 한다.`
    );
  });
}
