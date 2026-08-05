---
paths:
  - "Dockerfile"
  - "docker-compose.yml"
  - "buildspec.yml"
  - "appspec.yml"
  - ".github/workflows/**"
  - "next.config.ts"
---

# 배포 설정을 건드릴 때

## Docker 관련 파일은 과거 배포 방식의 잔재다

`Dockerfile`, `docker-compose.yml`, `appspec.yml`, `buildspec.yml`은 2026-01 이후 방치돼 있고 **현재 배포 경로에서 쓰이지 않는다.** 실제 배포는 GitHub Actions → S3 → CloudFront다.

배포 문제를 디버깅할 때 이 파일들을 보면 엉뚱한 곳을 파게 된다. `.github/workflows/deploy.yml`을 보라.

## 서버가 없다

`next.config.ts`의 `output: 'export'`로 정적 파일을 생성해 S3에 올린다. **SSR·ISR·Route Handler·미들웨어·서버 액션은 동작하지 않는다.** 데이터는 클라이언트에서 백엔드 API를 직접 호출해 가져온다.

`trailingSlash: true`이므로 내부 링크 경로 끝에 슬래시가 붙고, 이미지는 `unoptimized: true`라 `next/image` 최적화가 꺼져 있다.

## 초록불이 반영을 뜻하지 않는다

S3 sync는 즉시지만 **CloudFront 캐시 무효화 전파에 시간이 걸린다.** Actions가 성공해도 사용자가 보는 것은 아직 구버전일 수 있다.

배포 후에는 실제 사이트에서 확인한다. 캐시 때문에 헷갈리면 쿼리스트링을 붙이거나 시크릿 창으로 연다.
