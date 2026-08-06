---
paths:
  - "src/components/**"
---

# 컴포넌트를 만들거나 고칠 때

## 새로 만들기 전에 있는 것을 본다

`src/components/ui/design-system/index.ts` 가 `Gdg*` 를 배럴 export 한다.

```
GdgButton  GdgSegmentedButton  GdgTag  GdgColorTag  GdgCheckbox  GdgRadio
GdgInputField  GdgTextarea  GdgSearchField  GdgFieldContainer  GdgDropdown
GdgMajorDropdown  GdgFileCard  GdgUploadButton  GdgLogo  GdgGoogleLoginButton
GdgSiteHeader  GdgSiteFooter
```

폭·크기는 `controlMeta.ts` 의 토큰을 쓴다. 임의 Tailwind 클래스를 새로 만들지 않는다.

## `GdgMajorDropdown` 은 `device` prop 이 필수다

빠뜨리면 **편집 모드 진입 즉시 페이지가 크래시한다.** 실제로 배포된 적이 있다.

## 고치기 전에 그 컴포넌트가 렌더되는지 확인한다

```bash
grep -rn "<ComponentName" src/
```

`MobileMenuDrawer` 는 정의만 있고 어디서도 호출되지 않는다. 그 안의 메뉴 항목을 고치고
"버그 수정 완료"로 보고한 적이 있다. 구현자도 리뷰어도 **렌더러가 도는 것까지만** 확인했다.

## 증상으로 원인을 찾을 때는 목적지로도 검색한다

`grep "마이페이지"` 로는 안 걸린다 — 진짜 원인이던 버튼이 **아이콘(svg)** 이었다.
문구뿐 아니라 이동 경로(`/dashboard`, `/login`)로도 찾는다.

## 화면이 도는 시점부터는 클릭이 리뷰보다 싸다

`user-profile` 은 정적 리뷰 29회를 통과하고도 배포 직후 3분 만에 버그 4건이 나왔다.
편집 진입 크래시, 학과 코드 노출, PC 헤더 버튼이 온보딩으로, 모바일 진입 수단 없음 —
전부 브라우저에서 한 번 눌러봤으면 즉시 드러날 것들이었다.
