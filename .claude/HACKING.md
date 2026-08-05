# 하네스를 고칠 때

> **이 파일은 사본이다.** 반대쪽: `24-2_GDGoC_Server/.claude/HACKING.md`
> 공통 내용을 고치면 **반드시 양쪽을 함께 고친다.** 두 파일은 리포 고유 내용이 섞여
> 파일 단위 비교가 불가능하므로 자동 대조 대상이 아니다.

훅을 수정하거나 부모 폴더에 설치할 때 읽는다.
**훅이 안 뜨는 진단은 `README.md` 에 있다.**

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

**사본 대조는 `sync.test.mjs` 가 한다.** 두 리포가 나란히 있을 때만 돌고, 없으면
skip 하며 사유를 출력에 남긴다. **skip 을 통과로 읽지 마라 — 대조하지 못한 것이다.**
사본이 각자 자기 테스트를 통과하므로, 맞대보지 않으면 달라져도 양쪽 다 초록불이다.

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

복사한 뒤 **가리키는 파일이 전부 있는지 확인한다.** 없는 파일을 가리키는 훅은 조용히 죽는다.

```bash
node -e "
const s=require('./.claude/settings.json'), {existsSync}=require('fs');
let bad=0;
for (const ev of Object.values(s.hooks)) for (const g of ev) for (const h of g.hooks) {
  const m=h.command.match(/node\s+(\S+\.mjs)/); if(!m) continue;
  const ok=existsSync(m[1]); if(!ok) bad++;
  console.log((ok?'OK  ':'MISS')+' '+m[1]);
}
process.exit(bad?1:0);"
```

## 로컬 전용 자산

스킬·에이전트는 여기 두지 않는다. `description` 이 매 세션 컨텍스트에 실려 스킬 선택을
흐리는데 받는 쪽엔 뺄 수단이 없다. 각자 `~/.claude/skills/` 에 두고, 팀에 줄 만하면
플러그인으로 배포한다 — **설치가 명시적 행위가 되는 것이 핵심이다.**
