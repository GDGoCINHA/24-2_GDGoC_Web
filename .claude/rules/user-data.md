---
paths:
  - "src/constant/majorOptions.ts"
  - "src/utils/phoneNumber.ts"
  - "src/types/profile.ts"
  - "src/components/profile/**"
---

# 저장 형식과 표시 형식이 다른 값

학과와 전화번호는 **DB 에 든 모양과 화면에 보일 모양이 다르다.** 둘 다 같은 구조다.

## 학과 — 저장은 코드, 표시는 라벨

DB 에는 `DTE` 처럼 코드로 저장된다. 서버의 `MajorNormalizer` 에는 정방향(label→code)만
있고 **역변환이 없다.** 그래서 표시용 변환은 프론트가 한다.

- 매핑과 역변환: `src/constant/majorOptions.ts` 의 `{ code, label }` 과 `normalizeMajorCode()`
- **자유 입력을 받지 마라.** 목록에서 고르게 해야 정규화 실패가 원천 차단된다.

그대로 뿌리면 사용자에게 `ME` 가 보인다. 실제로 배포된 적이 있다.

### 어디서 무엇을 쓰나 (2026-08-25)

| 화면 | 입력 수단 |
|---|---|
| 회원가입(`/signup`) | `GdgMajorDropdown` — 밝은 배경 |
| 마이페이지·지원하기 | `optgroup` 을 쓴 native `<select>` — dusk 배경 |

`GdgMajorDropdown` 은 밝은 배경 전제라 dusk 화면에서는 흰 목록이 그대로 뜬다.
dusk 쪽은 `majorOptions` 를 `<optgroup>` 으로 펼쳐 값을 **코드로** 내보낸다 —
선택지가 곧 코드라 정규화가 필요 없다. 모바일에서는 네이티브 피커가 떠서 더 낫다.

## 전화번호 — 저장은 숫자만, 표시는 하이픈

| 어디 | 모양 | 무엇으로 |
|---|---|---|
| 저장·전송 | `01012345678` | `usePhoneNumber().toDigits` |
| 조회·편집 표시 | `010-1234-5678` | `formatPhoneNumberInput(value)` |
| 입력 중 | 자동 하이픈 | `usePhoneNumber().formatInput` |

회원가입 페이지가 이미 이 흐름을 쓴다. 새로 만들지 말고 따른다.

**하이픈을 포함해 서버로 보내면 저장된 기존 값과 형식이 어긋난다.** 서버 정규식은
`^01[0-9]\d{7,8}$` 로 숫자만 받는다.
