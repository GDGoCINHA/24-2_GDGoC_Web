# 하네스

이 레포용 Claude Code 하네스. **커밋된다 — 클론하면 팀원 모두에게 붙는다.**

백엔드 레포(`24-2_GDGoC_Server`)에 같은 하네스가 있다. **사본이며 자동 동기화되지 않는다.**
리포 하나만 클론해도 동작해야 하므로 의도한 중복이다. 테스트 파일이 함께 이동하므로
어긋나면 각 리포의 `node --test` 가 잡는다.

## 구성

| 경로 | 역할 | 커밋 |
|---|---|---|
| `settings.json` | 훅 등록 | O |
| `hooks/guard.mjs` | 되돌릴 수 없는 명령 차단 (PreToolUse) | O |
| `hooks/lifecycle.mjs` | 산출물 수명 — 승격·회수 안내 | O |
| `hooks/verify.mjs` | 턴 종료 검증 — 변경이 있을 때만 (Stop) | O |
| `hooks/session-start.mjs` | 훅 활성 여부·리포 상태 한 줄 (SessionStart) | O |
| `rules/artifact-lifecycle.md` | 문서를 어디에 쓰나 (해당 경로를 건드릴 때 로드) | O |
| `work/<과제>/` | **작업 공간** — 산출물의 기본 목적지 | X |
| `attic/<과제>/` | 회수 보관소 — 끝난 과제에서 물러난 것 | X |

`work/`·`attic/` 이 커밋되지 않는 것이 요점이다. 레포에 남는 건 최종본뿐이다.

**백엔드에만 있는 `migration-guard.mjs` 는 여기 없다.** 이 리포엔 Flyway 가 없다.

## 훅

| 언제 | 무엇 |
|---|---|
| 세션 시작 | `session-start.mjs` — 훅 활성 여부와 리포 상태 한 줄 |
| Bash·PowerShell 실행 전 | `guard.mjs` — `rm -rf`·force push·`reset --hard`·`DROP TABLE`·운영 배포(`main`·`master`) 차단 |
| `gh pr create` 직전 | `lifecycle.mjs promote` — `work/` 에 남은 산출물의 승격 여부를 묻는다 |
| 턴 종료 | `verify.mjs` — 변경이 있으면 `tsc --noEmit` |
| 턴 종료 | `lifecycle.mjs retire` — 머지된 과제의 작업 공간이 남아 있으면 알린다 |

세션 시작 한 줄을 빼면 **조건을 만족할 때만 말한다.** 평소에는 완전히 조용하다.

그 한 줄이 예외인 이유는 침묵의 뜻이 둘이기 때문이다 — "문제 없음"과 "내가 죽었음"이
구별되지 않는다. 훅이 살아 있다는 사실만은 조건 없이 말해야 한다.

### 이 리포의 운영 브랜치는 `master` 다

백엔드는 `main` 이다. `guard.mjs` 는 **둘 다** 막는다 — 그래야 파일이 리포에 무관해져
두 리포가 같은 사본을 쓸 수 있다. 이 리포에 `main` 이, 백엔드에 `master` 가 없으므로
서로 무해하다.

### 턴 종료 검증이 `yarn build` 가 아닌 이유

`next.config.ts` 에 `typescript.ignoreBuildErrors` 가 없으므로 `next build` 는 타입 검사를
포함한다. 즉 **`tsc --noEmit` 은 `yarn build` 의 부분집합**이다 — "빌드는 통과하는데 훅만
막는" 상황이 구조적으로 생기지 않으면서 훨씬 빠르다. 정적 export 빌드를 매 턴 돌리는 것은
비용이 너무 크다.

**한계를 알고 써라.** `tsconfig.json` 이 `strict: false`, `noImplicitAny: false`,
`strictNullChecks: false` 라 잡는 범위가 좁고, `output: 'export'` 제약에서 오는 빌드 오류는
못 잡는다. **진짜 게이트는 PR 직전의 `yarn build`** 이며 이 훅이 그걸 대신하지 않는다.

`node_modules` 가 없으면 검증을 건너뛰고 한 줄 안내만 한다. 실패로 처리하면 `yarn install`
전까지 모든 턴이 빨갛게 끝나고, 그건 훅을 끄게 만드는 지름길이다.

## 테스트

```bash
node --test ".claude/hooks/*.test.mjs"
```

**따옴표와 글로브가 필요하다.** `node --test .claude/hooks/` 는 동작하지 않는다 —
Node 의 테스트 러너가 점으로 시작하는 디렉터리를 건너뛰어 테스트를 하나도 찾지 못하고,
인자를 모듈로 해석해 엉뚱한 `MODULE_NOT_FOUND` 를 낸다.

**가드는 반드시 테스트로 고정한다.** 백엔드 레포에서 2026-08-04 이전 가드는
`$CLAUDE_TOOL_INPUT` 환경변수를 읽었는데 훅 입력은 stdin 으로 들어온다. 변수가 늘 비어
있어 **아무것도 막지 않으면서 막는 것처럼 보였다.** 조용히 죽은 가드는 없는 가드보다
위험하다 — 막힌다고 믿고 위험한 작업을 하기 때문이다.

## 훅이 안 뜰 때

**설정은 세션을 띄운 디렉터리에서만 읽힌다.**

> "Claude Code reads this file from the directory the session runs in"
> — https://code.claude.com/docs/en/settings

하위 디렉터리의 `.claude/settings.json` 은 **읽히지 않는다.** 그래서 이 리포를 하위에 둔
부모 폴더에서 세션을 띄우면 여기 훅이 하나도 붙지 않는다. **재시작해도 같은 곳에서 띄우면
결과가 같다 — 실행 디렉터리가 원인이다.**

살리는 방법은 둘이다.

1. 리포 안에서 띄운다 — `cd 24-2_GDGoC_Web && claude`
2. 부모 폴더에서 띄운다면 부모에도 배선이 필요하다 — 아래 「부모 폴더에서 띄울 때」

### 훅이 실제로 붙었는지 확인하는 법

세션 시작 한 줄이 1차 증거다.

```
하네스 훅 활성 | 24-2_GDGoC_Web develop ✓clean
```

이 줄이 없으면 훅이 안 붙은 것이다. **개별 가드까지 확인하려면 프로브를 쏜다.**
실행돼도 무해하다 — `echo` 다.

```bash
echo "DROP TABLE hook_probe"
```

차단되면 가드가 살아 있다. 그냥 출력되면 훅이 안 붙었거나 가드가 죽은 것이다.
둘을 가르려면 스크립트를 직접 실행해 본다.

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"echo DROP TABLE x"}}' | node .claude/hooks/guard.mjs
```

여기서 `deny` 가 나오면 **스크립트는 살아 있고 배선이 안 된 것**이다.
**둘은 원인이 다르므로 반드시 가른 뒤에 고친다.**

## 부모 폴더에서 띄울 때

이 리포와 `24-2_GDGoC_Server` 를 나란히 둔 폴더에서 세션을 띄우면, 그 폴더에도
`.claude/settings.json` 이 있어야 한다. **예시는 백엔드 레포에 있다** — 두 리포를 모두
다루는 설정이라 한 곳에만 둔다.

```bash
cd <부모 폴더>
mkdir -p .claude
cp 24-2_GDGoC_Server/.claude/parent-settings.example.json .claude/settings.json
```

부모 폴더는 git 리포가 아니므로 그 설정은 어디에도 커밋되지 않는다.

스크립트 사본은 **리포 안에만** 둔다. 부모 설정은 그것을 경로로 가리킬 뿐이다.
`--repo` 인자의 기본값이 `.` 이라 **리포 안에서 띄운 세션의 동작은 바뀌지 않는다.**

## 작업 산출물을 어디에 쓰나

조사 메모·중간 산출물의 기본 목적지는 **`.claude/work/<과제>/`** 다. 커밋되지 않는다.
과제 이름은 브랜치에서 나온다(`feature/noticepage` → `noticepage`).

레포에 남기는 건 **작업이 끝난 뒤에 쓴 최종본**뿐이고, 최종본은 근거·판정 사유·재생성
방법을 담아야 한다. 자세한 판정 기준은 `rules/artifact-lifecycle.md` 가 정본이다.

## 로컬 전용 자산

스킬·에이전트는 여기 두지 않는다. `description` 이 매 세션 컨텍스트에 실려 스킬 선택을
흐리는데 받는 쪽엔 뺄 수단이 없다. 각자 `~/.claude/skills/` 에 두고, 팀에 줄 만하면
플러그인으로 배포한다 — **설치가 명시적 행위가 되는 것이 핵심이다.**
