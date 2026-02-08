# UI Design-System Prompt

## 요청 배경
Figma 디자인을 코드로 통합해 공용 UI 컴포넌트를 구축하고자 함. 요구 범위는 다음과 같음.

1. **버튼/토글/태그/체크박스/라디오**: PC/M 사이즈, 상태(기본/활성/프레스/비활성), 양쪽 라운드 형태, 빨간 강조 컬러.
2. **입력(한 줄/장문/검색)**: 폭 토큰(Full, 2/3, Medium, Small, Mini, Quarter), 상태(기본/활성/에러/비활성), 라벨/헬퍼/에러, 장문 박스, 검색 아이콘 포함.
3. 컴포넌트는 디자인 시스템 위치(`src/components/ui/design-system`)에서 재사용 가능해야 하며 Showcase 컴포넌트로 결과를 확인할 수 있어야 함.

## 현재까지 완료된 작업
- `src/utils/cn.ts`: className 병합 헬퍼 작성.
- 디자인 시스템 기본 컴포넌트:
  - `GdgButton`, `GdgSegmentedButton`, `GdgTag`, `GdgColorTag`, `GdgCheckbox`, `GdgRadio`
- 입력 계열 컴포넌트:
  - `GdgInputField` (PC/M, width token, error/disabled, helperText, adornment)
  - `GdgTextarea` (PC/M, helper/error, auto-resize & 포커스 강조 통일)
  - `GdgSearchField` (PC/M, full/quarter width, search icon)
  - `GdgMajorDropdown` (여유 필터 기반 일반 검색, 학과 그룹화, Showcase 예제 포함)
- 업로드 계열 컴포넌트:
  - `GdgFileCard` (파일 정보, 삭제/다운로드 액션, PC/M 폭 대응)
  - `GdgUploadButton` (파일 선택 CTA, PC/M)
- 드롭다운 컴포넌트:
  - `GdgDropdown` (PC/M, small/mini/full, NextUI Autocomplete + 기존 스타일 조합, 뱃지/메타 슬롯, Showcase 예제 포함)
- `src/components/ui/design-system/index.ts`에서 전체 export 정리.
- `DesignSystemShowcase`에 위 컴포넌트를 실시간으로 확인할 수 있는 섹션 추가(버튼/세그먼트/태그/체크박스/라디오/입력/장문/검색/파일 첨부/드롭다운/학과 드롭다운).
- `src/app/design-system/page.tsx`: 디자인 시스템 전용 임시 페이지 추가(작업 중 프리뷰/QA용, PR 시 삭제 예정).
- `npm run lint` 실행 (기존 경고만 존재).

## 남은 TODO
- 기존 화면에서 새 디자인 시스템 컴포넌트를 실제로 교체.
- 옵셔널 상태(placeholder, icon set 등) 추후 Figma 업데이트 시 반영.
- 필요 시 Storybook/Docs 추가.

## 기술 메모
- **Tailwind CSS v4** 환경을 기본으로 한다. 기존 v3 이전 문법(예: `@apply` 기반 theme 선언, `text-base/6` 표현 등)은 그대로 붙여 넣지 말고 v4 기준으로 재작성한다.
- v4 `@theme`에서 정의한 토큰은 곧바로 클래스 이름으로 노출되므로, `bg-red`, `text-gray-400`, `border-yellow-400`처럼 Tailwind 유틸을 사용하면 자동으로 토큰을 참조한다.

## 정책 메모
- `src/components/ui/design-system` 내 모든 컴포넌트/타입은 **named export만 사용**한다. (default export 금지)
- 화면 구현 시 **디자인 시스템에 정의된 컴포넌트를 우선적으로 사용**한다. 신규 UI가 필요하면 먼저 디자인 시스템에 추가하고 공유한다.
- **모든 페이지는 레이아웃 그리드 토큰**(`.layout-grid--wide`, `--short`, `--mobile` 등)을 명시적으로 적용해 설계한다. Figma 기준 Long/Short/Mobile 중 해당 화면 성격에 맞는 형태를 판단해 선택하고, 그리드 없이 임의 배치하지 않는다.
- 페이지의 최상단 래퍼에 적절한 `layout-grid--*`만 부여하고, 내부 컴포넌트는 `col-span-*`으로 세부 단폭을 지정해 배치한다. 한 화면에서 2단/3단/4단을 혼합 사용 가능하며, 반응형을 위해서는 `layout-grid--wide-screen`(Long) 또는 `layout-grid--narrow-screen`(Short) 조합 클래스를 사용해 모바일/PC 폭을 동시에 처리한다.
- 모바일 개발 시에 상하단 여백은 브라우저 영역을 고려한 것이므로 이를 제외하고 구현한다.

## 컬러 토큰 가이드
- `src/styles/globals.css`에 정의된 `--color-*` 토큰은 Figma 팔레트와 1:1로 대응한다. (Red/Green/Blue/Yellow 본색 + 400, Gray 100~900, Black/White)
- 퍼블리싱/개발 시 **HEX/RGB/HSL 직접 입력 금지**. Tailwind 유틸(`text-red`, `bg-gray-200`, `border-white`)을 사용하면 자동으로 토큰을 가리키므로 `text-[var(--color-red)]` 같은 수동 참조는 금지한다.
- 새로운 색상이 필요하면 먼저 Figma 디자인 시스템에 반영한 뒤 토큰을 추가하고 공유한다. 임의 HEX를 생성해 쓰지 않는다.
- 투명도·그라데이션 등 변형 색상은 `color-mix` 등으로 기존 토큰을 조합해 표현한다. (예: `bg-[linear-gradient(90deg,var(--color-red),var(--color-yellow))]`)
- PR 전에 `rg '#[0-9A-Fa-f]{6}' src`를 실행해 하드코딩된 색상이 남지 않았는지 확인하고, 발견되면 즉시 토큰으로 교체한다.
