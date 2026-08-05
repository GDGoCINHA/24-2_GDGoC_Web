---
paths:
  - "package.json"
  - "yarn.lock"
  - "package-lock.json"
---

# 의존성을 건드릴 때

## 패키지 매니저가 섞여 있다

- `.github/workflows/deploy.yml` → **`yarn install --frozen-lockfile`** (실제 배포 경로)
- `Dockerfile`, `buildspec.yml` → `npm install`

`yarn.lock`과 `package-lock.json`이 **둘 다 존재**한다. 의존성을 추가할 때 yarn을 쓰면 `package-lock.json`이 뒤처지고, npm을 쓰면 배포 빌드와 어긋난다. **배포 기준인 yarn을 따르라.**

## 로컬에 yarn이 없을 때

`npx --yes yarn@1.22.22`로 실행한다. corepack은 관리자 권한이 필요해 이 PC에서 막힌다.

## 검증

```bash
yarn build          # 정적 빌드 (out/ 생성). 성공(exit 0)이 유일한 게이트다
```

**테스트 인프라가 없다.** 검증은 `yarn build`와 수동 확인뿐이므로, 의존성 변경은 반드시 빌드까지 확인한다.
