// 이 모듈이 직접 실행됐는지 판정한다. import 된 경우(테스트)와 구별하기 위한 것이다.
//
// **왜 따로 빼는가:** 같은 판정이 훅 여럿에 복제돼 있었고, 그래서 같은 버그를 공유했다.
//
// ```js
// import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))   // 틀렸다
// ```
//
// `import.meta.url` 은 file URL 이라 공백을 `%20` 으로, 한글을 퍼센트 시퀀스로
// 인코딩한다. `process.argv[1]` 은 인코딩하지 않는다. 그래서 **경로에 공백이나 한글이
// 있으면 이 비교가 영영 거짓**이고, CLI 블록이 통째로 실행되지 않는다.
//
// 결과는 훅이 stdin 을 읽지도 않고 `exit 0` 으로 끝나는 것이다. **붙어 있는데 아무것도
// 막지 않고 아무 말도 안 하는 상태** — 이 하네스가 가장 경계하는 실패 형태다.
// 2026-08-05 에 `C:/Users/홍길동/...` 형태 경로로 실측해 확인했다.
//
// 경로를 문자열로 비교하지 않는다. URL 을 실제 경로로 되돌리고(`fileURLToPath`)
// 양쪽을 정규화해서(`resolve`) 비교한다.

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/**
 * @param {string} moduleUrl 호출부의 `import.meta.url`
 * @param {string|undefined} argv1 `process.argv[1]`
 * @returns {boolean} 이 모듈이 진입점이면 true
 */
export function isMainModule(moduleUrl, argv1) {
  if (!argv1) return false;
  try {
    return resolve(fileURLToPath(moduleUrl)) === resolve(argv1);
  } catch {
    // URL 로 해석되지 않으면 실행이 아닌 것으로 본다.
    // 여기서 true 를 주면 import 만 해도 CLI 가 돌아 테스트가 stdin 을 기다리며 멈춘다.
    return false;
  }
}
