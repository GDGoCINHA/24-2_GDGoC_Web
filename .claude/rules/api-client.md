---
paths:
  - "src/lib/api/**"
  - "src/app/api/**"
  - "src/types/**"
---

# API 호출부를 건드릴 때

## `src/app/api/`는 죽은 코드다

`route.ts` 4개가 있지만 전부 `POST` 핸들러다. **static export는 POST Route Handler를 지원하지 않으며**, 실제로 이들을 호출하는 코드도 리포에 없다.

인증 흐름은 이 라우트가 아니라 `src/lib/api/`의 axios 클라이언트가 백엔드를 **직접 호출**하는 방식이다. 액세스 토큰은 localStorage에 저장하고 `Authorization: Bearer`로 보낸다.

새 API 연동을 만들 때 이 디렉터리를 참고하지 마라. 동작하지 않는 패턴이다.

## 인증 요청은 `authorizedClient`를 통한다

인증이 필요한 요청은 `src/lib/api/authorizedClient.ts`(axios) 또는 `authorizedFetch.ts`를 쓴다. `axios`를 새로 생성해 직접 호출하지 않는다 — **토큰 주입과 401 재발급 인터셉터를 우회하게 된다.**

## 백엔드 응답은 래퍼에 싸여 온다

모든 API는 다음 형태로 감싸여 온다. `data`를 바로 쓰지 말고 이 래퍼를 벗겨야 한다.

```ts
{ code: number, message: string, data: T, meta?: M }
```

`meta`에는 페이징 정보가 들어온다. `null` 필드는 응답에서 생략된다.

## 타입은 수동 관리다

Server는 `springdoc-openapi`로 스펙을 노출하지만 **자동 생성 파이프라인이 없다.** `src/types/`를 손으로 맞춘다.

따라서 **Server의 DTO가 바뀌면 Web의 대응 타입도 같은 작업에서 함께 고쳐야 한다. 빌드가 알려주지 않는다.**

## 백엔드 주소는 빌드 타임에 박힌다

`NEXT_PUBLIC_BASE_API_URL`은 번들에 인라인되므로 **런타임에 바꿀 수 없다.** 하드코딩하지 않는다.
