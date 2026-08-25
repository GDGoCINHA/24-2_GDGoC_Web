import type {
  LandingActivity,
  LandingContentDocument,
  LandingFaq,
  LandingHackathon,
  LandingHackathonIntro,
  LandingHero,
  LandingPhoto
} from '@/types/landing'

/**
 * 온보딩(랜딩)에 실리는 콘텐츠의 **기본값**.
 *
 * 관리자가 서버에 발행한 문서가 있으면 화면은 그것을 쓴다(`LandingContentProvider`).
 * 여기 값은 **첫 프레임과 조회 실패 때** 쓰이는 바닥이다 — 서버가 비어 있어도 화면이
 * 그대로 나오게 하려는 것이라, 지우거나 비워 두지 않는다.
 *
 * 모양은 `@/types/landing` 이 정하고 서버의 `LandingContentPayload` 와 같다.
 * **필드를 늘리거나 이름을 바꿀 때는 서버·관리자 화면과 함께 고친다.**
 *
 * 현재 사진과 행사명은 2026-1 학기 기준이다. 학기가 바뀌면 이 파일만 고치면 되도록
 * 슬롯의 개수·비율은 그대로 두고 값만 갈아끼우는 것을 전제로 짰다.
 *
 * 모집 일정 문구는 여기 두지 않는다 — `recruitSchedule.ts` 가 이미 갖고 있고
 * 실제 지원 가능 여부는 서버가 판정한다.
 */

/** 집중 모집 기간 문구 앞에 붙는 학기 표기. `recruitSchedule.ts` 와 함께 고친다. */
export const LANDING_SEMESTER_LABEL = '2026-2'

export const LANDING_HERO: LandingHero = {
  photo: {
    src: '/images/landing/aingthon-hero-web.jpg',
    alt: 'Build with AI : AINGTHON 시상식에 모인 참가자 단체 사진',
    caption: 'Build with AI : AINGTHON · GDGoC INHA × GDGoC AJOU',
    focusY: 50
  },
  /** 제목은 두 조각으로 나눠 뒷부분만 강조 자간을 쓴다. */
  titleLead: 'Google 개발자 커뮤니티에서 함께 성장하는 즐거움,',
  titleAccent: 'GDGoC INHA',
  titleTail: '에서',
  description: '모두가 함께하는 성장을 꿈꿉니다.',
  ctaNote: 'GDGoC INHA와 함께해요.'
}

export const LANDING_ABOUT = {
  heading: ['GDGoC INHA는', '인하대학교의 Google 개발자 커뮤니티예요.'],
  body: 'Google Developer Groups on Campus는 Google이 대학생 개발자 성장을 위해 지원하는 대학 거점형 커뮤니티입니다.',
  /** 번호 색은 GDG 4색 고정이라 데이터에 함께 둔다. */
  values: [
    {
      index: '01',
      title: '함께',
      body: '팀으로 배우고 만들며 더 멀리 나아가요.',
      colorClass: 'text-[#4285F4]'
    },
    {
      index: '02',
      title: '공유',
      body: '지식과 경험을 나누며 함께 나아가요.',
      colorClass: 'text-[#EA4335]'
    },
    {
      index: '03',
      title: '성장',
      body: '도전하며 한 단계씩 성장해요.',
      colorClass: 'text-[#FBBC04]'
    },
    {
      index: '04',
      title: '존중',
      body: '서로의 관점과 속도를 존중해요.',
      colorClass: 'text-[#34A853]'
    }
  ]
} as const

/** 사진 띠 3칸. 관리자 화면에서 추가·삭제·순서 변경이 되므로 개수를 고정하지 않는다. */
export const LANDING_PHOTO_STRIP: LandingPhoto[] = [
  {
    src: '/images/landing/goat-group-web.jpg',
    alt: 'GOAT 2.0 Final Pitch 를 마치고 현수막을 들고 모인 참가자 단체 사진',
    caption: 'GOAT 2.0 · Final Pitch',
    focusY: 55
  },
  {
    /** 밤 해변이라 하늘이 넓게 잡혀 원본 위쪽 26%를 잘라낸 판이다. */
    src: '/images/landing/mt-web.jpg',
    alt: '밤바다에서 현수막을 들고 찍은 MT 단체 사진',
    caption: 'MT',
    focusY: 60
  },
  {
    src: '/images/landing/opening-web.jpg',
    alt: '개강총회를 위해 강의실에 모인 부원들',
    caption: '개강총회',
    focusY: 60
  }
]

export const LANDING_ACTIVITIES: LandingActivity[] = [
  { title: '세미나', body: '현업·선배 강연으로 인사이트를 빠르게 얻어요.' },
  { title: '스터디', body: '함께 목표를 세우고 꾸준히 학습해요.' },
  { title: '네트워킹', body: '관심사가 비슷한 사람들과 자연스럽게 연결돼요.' },
  { title: '대표 이벤트', body: 'Google 커뮤니티와 함께 대규모 행사에 참여해요.' },
  { title: 'GOAT', body: '한 학기 팀 프로젝트로 기획부터 개발까지 완주해요.' }
]

export const LANDING_HACKATHON_INTRO: LandingHackathonIntro = {
  heading: '해커톤과 대회를 직접 열고, 나갑니다',
  body: '자체 행사부터 다른 챕터·학교와 함께하는 연합 행사, Google 연계 행사까지 이어집니다.',
  photo: {
    src: '/images/landing/ax-group-web.jpg',
    alt: 'AX 창업 프로그램 X Sinsa 를 마치고 무대 앞에 모인 참가자 단체 사진',
    caption: 'AX 창업 프로그램 X Sinsa',
    focusY: 58
  }
}

export const LANDING_HACKATHONS: LandingHackathon[] = [
  {
    year: '2026',
    title: 'Build with AI : AINGTHON',
    badge: '연합 주최',
    badgeTone: 'UNION',
    body: 'AI를 주제로 팀을 이뤄 하나를 만들어 보는 해커톤. 06.26 ~ 06.27, 인하대학교 정석학술정보관에서 GDGoC AJOU와 함께 열었습니다.'
  },
  {
    year: '2026',
    title: 'Build with AI',
    badge: '학술 행사',
    badgeTone: 'ACADEMIC',
    body: 'Google의 Build with AI 프로그램과 연계해 연 학술 행사. AI 기술을 주제로 강연과 실습을 함께 진행했습니다.'
  },
  {
    year: '2026',
    title: 'AX 창업 프로그램 X Sinsa',
    badge: '학술 행사',
    badgeTone: 'ACADEMIC',
    body: 'AX를 주제로 Sinsa와 함께 연 창업 프로그램. 아이디어를 다듬어 발표까지 이어갑니다.'
  },
  {
    year: '2026',
    title: 'GOAT 2.0',
    badge: '내부 행사',
    badgeTone: 'INTERNAL',
    body: 'GDGoC Original Advanced Track. 04.09 ~ 06.22, 한 학기 동안 팀을 이뤄 기획부터 개발까지 완주하고 Final Pitch 에서 결과를 발표합니다.'
  },
  {
    year: '2025',
    title: 'GreenTech Globalthon',
    badge: '연합 주최',
    badgeTone: 'UNION',
    body: '지속가능성을 주제로 한 글로벌 해커톤. 01.17 ~ 01.18, 인하대학교 60주년기념관에서 AIESEC in INHA와 함께 열었습니다.'
  }
]

export const LANDING_FAQS: LandingFaq[] = [
  {
    question: '가입하면 무엇을 할 수 있나요?',
    answer: [
      'GDGoC INHA만의 다채로운 행사를 즐기실 수 있습니다!',
      '2026년 1학기 기준,',
      '네트워킹 행사: 개강총회, MT, 잔막, 동방에서 만나용, 간식드리미',
      '학술 행사: GOAT 2.0, AX 창업 프로그램 X Sinsa, 스터디',
      'Google 연계 행사: Build with AI, Build with AI : AINGTHON 등의 행사를 진행했습니다'
    ]
  },
  {
    question: '비개발자도 참여할 수 있나요?',
    answer: [
      '비개발자도 참여가능합니다! 현재 저희 동아리에는 경영학과, 경제학과, 중국학과, 소비자학과 등 여러 학과의 학생들도 많이 활동하고 있습니다.'
    ]
  },
  {
    question: '활동은 얼마나 자주 하나요?',
    answer: [
      '네트워킹 활동은 한 달에 두 번 정도 진행되고 있으며, 학술 활동은 한 달에 한 번 정도 진행되고 있습니다.'
    ]
  },
  {
    question: 'GOAT는 누구나 지원할 수 있나요?',
    answer: [
      'GOAT는 GDGoC INHA 부원이라면 누구나 지원할 수 있습니다. 프로젝트 경험이 많지 않아도 팀과 함께 완주할 수 있도록 스터디와 멘토링을 함께 제공합니다.'
    ]
  },
  {
    question: '참가비/비용이 있나요?',
    answer: [
      '동아리 회비는 20,000원입니다. 이는 동아리 행사 진행, 굿즈 제공 등에 사용되며, 대부분의 부원들이 회비 이상의 혜택을 누리고 있습니다.'
    ]
  },
  {
    question: '문의는 어디로 하면 되나요?',
    answer: [
      '문의는 공식메일(gdsc.inha@gmail.com) 또는 카카오톡 오픈채팅으로 해주시면 답변드리겠습니다.'
    ]
  }
]

export const GDGOC_EMAIL = 'gdsc.inha@gmail.com'
export const GDGOC_OPEN_CHAT_URL = 'https://open.kakao.com/o/s2OqrcIi'

/**
 * 서버 문서가 없을 때 쓰는 바닥값. 서버 응답과 같은 모양이라 그대로 바꿔 끼울 수 있다.
 *
 * `LANDING_ABOUT`·`LANDING_SEMESTER_LABEL` 은 여기 없다 — 관리자 화면에서 고치지 않는
 * 값이라 서버로 오갈 이유가 없다.
 */
export const LANDING_CONTENT_FALLBACK: LandingContentDocument = {
  hero: LANDING_HERO,
  photoStrip: LANDING_PHOTO_STRIP,
  activities: LANDING_ACTIVITIES,
  hackathonIntro: LANDING_HACKATHON_INTRO,
  hackathons: LANDING_HACKATHONS,
  faqs: LANDING_FAQS
}
