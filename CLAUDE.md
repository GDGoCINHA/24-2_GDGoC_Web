# 프로젝트: GDGoC INHA 프론트엔드

인하대학교 GDGoC 공식 웹사이트. 백엔드 API는 별도 리포(`GDGoCINHA/24-2_GDGoC_Server`, Spring Boot)에서 관리한다.

## 기술 스택

- Next.js 15 (App Router) — **`output: 'export'` 정적 사이트**
- React 18.3 / TypeScript 5.9
- Tailwind CSS 4 (`@tailwindcss/postcss`)
- NextUI + HeroUI
- axios (인증 클라이언트)
- framer-motion, gsap, lenis (애니메이션)

패키지 매니저는 **yarn**을 쓴다 (배포 워크플로우 기준).

## 아키텍처 규칙

- CRITICAL: **이 프로젝트에는 서버가 없다.** `next.config.ts`의 `output: 'export'`로 정적 파일을 생성해 S3에 올린다. SSR·ISR·Route Handler·미들웨어·서버 액션은 **동작하지 않는다.** 데이터는 클라이언트에서 백엔드 API를 직접 호출해 가져온다.
- CRITICAL: 인증이 필요한 요청은 `src/lib/api/authorizedClient.ts`(axios) 또는 `authorizedFetch.ts`를 통한다. `axios`를 새로 생성해 직접 호출하지 않는다 — 토큰 주입과 401 재발급 인터셉터를 우회하게 된다.
- CRITICAL: 백엔드 주소는 `NEXT_PUBLIC_BASE_API_URL`로 주입된다. **빌드 타임에 번들로 인라인되므로 런타임에 바꿀 수 없다.** 하드코딩하지 않는다.
- 경로 별칭은 `@` → `src`, `@public` → `public` (`next.config.ts`의 webpack alias).
- 컴포넌트는 `src/components/{도메인}/`, 공용 UI는 `src/components/ui/`에 둔다.
- `trailingSlash: true`이므로 내부 링크 경로 끝에 슬래시가 붙는다.
- 이미지는 `unoptimized: true` — `next/image` 최적화가 꺼져 있다.

## 개발 프로세스

- 커밋 메시지는 conventional commits를 따른다 (`feat:`, `fix:`, `refactor:`, `chore:`).
- 브랜치는 `feature/{기능}` → `develop` → `master` 순으로 올린다.
- 코드 스타일은 Prettier가 강제한다. 수정 후 `yarn format`을 실행한다.

## 명령어

```bash
yarn dev            # 개발 서버
yarn build          # 정적 빌드 (out/ 생성)
yarn lint           # ESLint
yarn format         # Prettier 적용
yarn format:check   # 포맷 검사만
```

**테스트 스크립트는 없다.** 테스트 인프라가 구성돼 있지 않으므로 검증은 `yarn build`와 수동 확인에 의존한다.

## ⚠️ 이 프로젝트의 함정

코드만 읽어서는 드러나지 않는 것들. **작업 전에 반드시 인지할 것.**

### `src/app/api/`는 죽은 코드다

`route.ts` 4개가 있지만 전부 `POST` 핸들러다. **static export는 POST Route Handler를 지원하지 않으며**, 실제로 이들을 호출하는 코드도 리포에 없다.

인증 흐름은 이 라우트가 아니라 `src/lib/api/`의 axios 클라이언트가 백엔드를 **직접 호출**하는 방식이다. 액세스 토큰은 localStorage에 저장하고 `Authorization: Bearer`로 보낸다.

새 API 연동을 만들 때 이 디렉터리를 참고하지 마라. 동작하지 않는 패턴이다.

### 운영 브랜치가 `master`다

백엔드 리포는 `main`인데 **이 리포는 `master`**다. 헷갈리기 쉽다.

| 브랜치 | 배포 대상 | `NEXT_PUBLIC_APP_ENV` |
|---|---|---|
| `develop` push | 개발 S3 버킷 | `dev` |
| `master` push | **운영 S3 버킷** | `production` |

머지가 곧 배포다. 승인 단계가 없으며, 빌드 후 S3 sync(`--delete`) → CloudFront 캐시 무효화까지 자동 실행된다.

또한 **`develop`을 거치지 않고 `master`로 직접 머지되는 경우가 있다.** 그래서 `develop`이 `master`보다 뒤쳐져 있을 수 있다. 작업을 시작하기 전에 두 브랜치의 차이를 확인하라.

```bash
git log --oneline origin/develop..origin/master
```

### 패키지 매니저가 섞여 있다

- `.github/workflows/deploy.yml` → **`yarn install --frozen-lockfile`** (실제 배포 경로)
- `Dockerfile`, `buildspec.yml` → `npm install`

`yarn.lock`과 `package-lock.json`이 **둘 다 존재**한다. 의존성을 추가할 때 yarn을 쓰면 `package-lock.json`이 뒤처지고, npm을 쓰면 배포 빌드와 어긋난다. **배포 기준인 yarn을 따르라.**

### Docker 관련 파일은 과거 배포 방식의 잔재다

`Dockerfile`, `docker-compose.yml`, `appspec.yml`, `buildspec.yml`은 2026-01 이후 방치돼 있고 **현재 배포 경로에서 쓰이지 않는다.** 실제 배포는 GitHub Actions → S3 → CloudFront다.

배포 문제를 디버깅할 때 이 파일들을 보면 엉뚱한 곳을 파게 된다. `.github/workflows/deploy.yml`을 보라.

### 백엔드 응답 형식

모든 API는 다음 형태로 감싸여 온다. `data`를 바로 쓰지 말고 이 래퍼를 벗겨야 한다.

```ts
{ code: number, message: string, data: T, meta?: M }
```

`meta`에는 페이징 정보가 들어온다. `null` 필드는 응답에서 생략된다.
