// 이 모듈이 직접 실행됐는지 판정한다.
//
// **왜 테스트가 있는가:** 같은 판정이 훅 10개에 복제돼 있었고 같은 버그를 공유했다.
// 경로에 공백·한글이 있으면 전부 조용히 무동작했다 — 훅이 붙어 있는데 아무것도 막지
// 않고 아무 말도 안 하는, 이 하네스가 가장 경계하는 실패 형태다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { isMainModule } from "./is-main.mjs";

test("직접 실행이면 true", () => {
  const p = "C:/repo/.claude/hooks/guard.mjs";
  assert.equal(isMainModule(pathToFileURL(p).href, p), true);
});

test("다른 파일이 실행 중이면 false — import 된 경우다", () => {
  // 테스트가 훅을 import 할 때 CLI 가 돌면 stdin 을 기다리며 멈춘다.
  assert.equal(
    isMainModule(
      pathToFileURL("C:/repo/.claude/hooks/guard.mjs").href,
      "C:/repo/.claude/hooks/guard.test.mjs"
    ),
    false
  );
});

test("경로에 공백이 있어도 판정한다", () => {
  // file URL 은 공백을 %20 으로 인코딩한다. 문자열 비교로는 영영 안 맞는다.
  const p = "C:/Users/John Doe/repo/.claude/hooks/guard.mjs";
  assert.equal(isMainModule(pathToFileURL(p).href, p), true);
});

test("경로에 한글이 있어도 판정한다", () => {
  // Windows 계정명이 한글인 경우가 드물지 않다. 2026-08-05 에 이 경로로 실측했을 때
  // 가드가 아무 출력 없이 exit 0 으로 끝났다.
  const p = "C:/Users/홍길동/repo/.claude/hooks/guard.mjs";
  assert.equal(isMainModule(pathToFileURL(p).href, p), true);
});

test("Windows 역슬래시 경로도 같은 파일로 본다", () => {
  const p = "C:/repo/.claude/hooks/guard.mjs";
  assert.equal(
    isMainModule(pathToFileURL(p).href, "C:\\repo\\.claude\\hooks\\guard.mjs"),
    true
  );
});

test("argv[1] 이 없으면 false", () => {
  assert.equal(isMainModule(pathToFileURL("C:/repo/x.mjs").href, undefined), false);
  assert.equal(isMainModule(pathToFileURL("C:/repo/x.mjs").href, ""), false);
});

test("URL 이 아니면 false — 판정 불가를 실행으로 보지 않는다", () => {
  // 여기서 true 를 주면 import 만 해도 CLI 가 돌아 테스트가 멈춘다.
  assert.equal(isMainModule("이건 URL 이 아니다", "C:/repo/x.mjs"), false);
});
