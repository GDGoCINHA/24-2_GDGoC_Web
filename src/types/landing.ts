/**
 * 온보딩(랜딩)에 실리는 콘텐츠의 모양.
 *
 * 서버의 `LandingContentPayload` 와 같은 모양이다. **한쪽을 바꾸면 반대쪽도 같은 작업에서
 * 고쳐야 한다** — 자동 생성 파이프라인이 없어 빌드가 알려주지 않는다.
 *
 * 화면 구조가 아니라 내용만 담는다. 배치는 컴포넌트가 갖는다.
 */

/** 대회·해커톤 배지 색. 실제 클래스는 `LANDING_BADGE_CLASS` 가 고른다. */
export type LandingBadgeTone = 'UNION' | 'ACADEMIC' | 'INTERNAL'

export type LandingPhoto = {
  /** `/images/` 로 시작하는 번들 사진이거나 `https://` 로 시작하는 업로드 사진. */
  src: string
  /** 스크린리더용. 사진을 교체하면 반드시 함께 고친다. */
  alt: string
  caption: string
  /**
   * `object-position` 의 세로 초점(%). 얼굴이 잘리는 사진을 배포 없이 맞추기
   * 위한 값이라, 관리자 화면에서 슬라이더로 조절한다.
   */
  focusY: number
}

export type LandingHero = {
  photo: LandingPhoto
  /** 제목은 두 조각으로 나눠 뒷부분만 강조 자간을 쓴다. */
  titleLead: string
  titleAccent: string
  titleTail: string
  description: string
  ctaNote: string
}

export type LandingActivity = {
  title: string
  body: string
}

export type LandingHackathonIntro = {
  heading: string
  body: string
  photo: LandingPhoto
}

export type LandingHackathon = {
  /** 연도. 아직 안 정해졌으면 '—'. */
  year: string
  title: string
  /** 배지에 적히는 문구. */
  badge: string
  badgeTone: LandingBadgeTone
  body: string
}

export type LandingFaq = {
  question: string
  /** 문단 배열. 줄바꿈이 아니라 문단으로 나눠 답변 안에서 목록처럼 읽히게 한다. */
  answer: string[]
}

export type LandingContentDocument = {
  hero: LandingHero
  photoStrip: LandingPhoto[]
  activities: LandingActivity[]
  hackathonIntro: LandingHackathonIntro
  hackathons: LandingHackathon[]
  faqs: LandingFaq[]
}

/**
 * 배지 색.
 *
 * 서버는 이름만 준다. Tailwind 는 소스에 적힌 클래스만 CSS 로 만들기 때문에 서버가 클래스
 * 문자열을 보내면 저장은 되고 색은 안 나온다 — 그래서 매핑을 여기 리터럴로 둔다.
 */
export const LANDING_BADGE_CLASS: Record<LandingBadgeTone, string> = {
  UNION: 'bg-[rgba(134,192,143,0.18)] text-signal-ok',
  ACADEMIC: 'bg-[rgba(208,129,85,0.18)] text-ember',
  INTERNAL: 'bg-[rgba(126,150,200,0.20)] text-tag-info'
}

export const LANDING_BADGE_TONE_LABEL: Record<LandingBadgeTone, string> = {
  UNION: '연합 주최',
  ACADEMIC: '학술 행사',
  INTERNAL: '내부 행사'
}
