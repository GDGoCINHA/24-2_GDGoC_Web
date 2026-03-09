'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'
import { SiNotion } from 'react-icons/si'

import { GdgCheckbox, GdgLogo } from '@/components/ui/design-system'
import mbtiTypeMetaRaw from './mbtiTypeMeta.json'

type Axis = 'LC' | 'PS' | 'TU' | 'IF'
type Choice = 'A' | 'B'
type Stage = 'main' | 'quiz' | 'result' | 'allResults' | 'allResultDetail'

type Question = {
  id: number
  axis: Axis
  prompt: string
  options: {
    A: string
    B: string
  }
}

type ProjectInfo = {
  name: string
  schedule: string
  description: string
}

type ResultType = {
  code: string
  subtitle: string
  quote: string
  overview: string[]
  collaboration: string[]
  teammates: string[]
  projects: ProjectInfo[]
  image: string
}

type MbtiStatsPayload = {
  totalCount: number
  typeCounts: Array<{
    mbtiType: string
    count: number
  }>
}

type MbtiTypeMeta = {
  subtitle: string
  iconKind: string
  iconColor: string
  teammateGridSubtitle: string
  shortResult: {
    subtitle: string
    points: string[]
    recommendation: string
  }
}

const POLICY_COPY =
  'GDGoC INHA는 개발자 MBTI 테스트의 개인 결과 제공, 유형별 통계 집계, 행사 운영 관리를 위해 개인정보를 수집합니다. 수집 항목은 이름, 학번, MBTI 테스트 결과이며, 해당 정보는 행사 운영 기간 동안만 보유하고 행사 종료 후 5일 이내 파기합니다. 여러분은 언제든지 개인정보의 열람, 수정, 삭제를 요청할 수 있습니다. 다만 개인정보 수집·이용 동의를 거부할 수 있으나, 이 경우 테스트 참여 및 결과 확인이 어려울 수 있습니다.'

const QUESTIONS: Question[] = [
  {
    id: 1,
    axis: 'LC',
    prompt: '에러가 발생했을 때 더 가까운 행동은?',
    options: { A: '원인 단계별 추적', B: '다양한 시도 기반 해결' }
  },
  {
    id: 2,
    axis: 'PS',
    prompt: '프로젝트 시작할 때 나는?',
    options: { A: '구조·설계 선행', B: '구현 후 수정' }
  },
  {
    id: 3,
    axis: 'TU',
    prompt: '더 뿌듯한 순간은?',
    options: { A: '로직 완성의 성취감', B: '화면/결과 완성의 성취감' }
  },
  {
    id: 4,
    axis: 'IF',
    prompt: '개발할 때 더 편한 환경은?',
    options: { A: '단독 집중 환경', B: '대화 기반 협업 환경' }
  },
  {
    id: 5,
    axis: 'LC',
    prompt: '새로운 기술을 접하면?',
    options: { A: '공식 문서 우선 학습', B: '영상·예제 우선 학습' }
  },
  {
    id: 6,
    axis: 'PS',
    prompt: '마감이 다가오면?',
    options: { A: '사전 완료 중심 진행', B: '마감 임박 집중 스퍼트' }
  },
  {
    id: 7,
    axis: 'TU',
    prompt: '더 신경 쓰는 부분은?',
    options: { A: '성능·구조·안정성 중심', B: '사용성·직관성 중심' }
  },
  {
    id: 8,
    axis: 'IF',
    prompt: '팀 프로젝트에서 나는?',
    options: { A: '담당 파트 책임 수행', B: '전체 흐름 기반 조율' }
  },
  {
    id: 9,
    axis: 'LC',
    prompt: '작업물(코드/문서/디자인) 스타일은?',
    options: { A: '정리·규칙·일관성 중심', B: '유연·속도 중심' }
  },
  {
    id: 10,
    axis: 'PS',
    prompt: '개발(작업)을 하며 더 중요한 것은?',
    options: { A: '계획 기반 완성', B: '상황 기반 조정' }
  },
  {
    id: 11,
    axis: 'TU',
    prompt: '기능을 추가할 때 더 먼저 고려하는 것은?',
    options: { A: '내부 구조의 깔끔한 유지', B: '사용자 관점의 직관적 이해' }
  },
  {
    id: 12,
    axis: 'IF',
    prompt: '문제 해결 방식은?',
    options: { A: '충분한 개인 고민 후 공유', B: '과정 중 지속적 의견 교환' }
  }
]

const PROFILE_IMAGES: Record<string, string> = {
  LPTI: '/images/MBTI/01_LPTI.jpg',
  LPTF: '/images/MBTI/02_LPTF.jpg',
  LSTI: '/images/MBTI/03_LSTI.jpg',
  LSTF: '/images/MBTI/04_LSTF.jpg',
  CPTI: '/images/MBTI/05_CPTI.jpg',
  CPTF: '/images/MBTI/06_CPTF.jpg',
  CSTI: '/images/MBTI/07_CSTI.jpg',
  CSTF: '/images/MBTI/08_CSTF.jpg',
  LPUI: '/images/MBTI/09_LPUI.jpg',
  LPUF: '/images/MBTI/10_LPUF.jpg',
  LSUI: '/images/MBTI/11_LSUI.jpg',
  LSUF: '/images/MBTI/12_LSUF.jpg',
  CPUI: '/images/MBTI/13_CPUI.jpg',
  CPUF: '/images/MBTI/14_CPUF.jpg',
  CSUI: '/images/MBTI/15_CSUI.jpg',
  CSUF: '/images/MBTI/16_CSUF.jpg'
}

const ICON_DOWNLOAD_LOCAL = '/icons/ui/mbti-download.svg'
const ICON_ENTER_LOCAL = '/icons/ui/mbti-enter-outline.svg'
const ICON_CALENDAR_LOCAL = '/icons/ui/mbti-calendar.svg'
const ICON_STATS = '/icons/ui/mbti-stats.svg'
const ICON_RETRY = '/icons/ui/mbti-retry.svg'
const getShortPreviewImageSrc = (type: string) => `/images/MBTI/mbti-${type}.png`
const TYPE_ICON_BY_KIND: Record<string, { sm: string; lg: string }> = {
  cap: { sm: '/icons/ui/mbti-types/cap-16.svg', lg: '/icons/ui/mbti-types/cap.svg' },
  rocket: { sm: '/icons/ui/mbti-types/rocket-16.svg', lg: '/icons/ui/mbti-types/rocket.svg' },
  palette: { sm: '/icons/ui/mbti-types/palette-16.svg', lg: '/icons/ui/mbti-types/palette.svg' },
  flame: { sm: '/icons/ui/mbti-types/flame-16.svg', lg: '/icons/ui/mbti-types/flame.svg' },
  hammer: { sm: '/icons/ui/mbti-types/hammer-16.svg', lg: '/icons/ui/mbti-types/hammer.svg' },
  leaf: { sm: '/icons/ui/mbti-types/leaf-16.svg', lg: '/icons/ui/mbti-types/leaf.svg' },
  note: { sm: '/icons/ui/mbti-types/note-16.svg', lg: '/icons/ui/mbti-types/note.svg' },
  sparkle: { sm: '/icons/ui/mbti-types/sparkle-16.svg', lg: '/icons/ui/mbti-types/sparkle.svg' }
}

const TYPE_META = mbtiTypeMetaRaw as Record<string, MbtiTypeMeta>

const RESULTS: Record<string, ResultType> = {
  LPTI: {
    code: 'LPTI',
    subtitle: '전략형 설계자',
    quote: '겉보다 속이 중요하다. 구조가 무너지면 다 무너진다.',
    overview: [
      '보이지 않는 시스템과 구조를 설계하는 타입입니다.',
      '안정성과 논리, 기술 완성도를 중요하게 생각합니다.',
      '탄탄한 기반이 있어야 서비스가 오래 간다고 믿습니다.'
    ],
    collaboration: [
      '프로젝트 초반 구조를 정리하고 기준을 세웁니다.',
      '역할과 책임을 명확히 나누는 것을 선호합니다.',
      '감정보다 데이터와 논리로 설득합니다.'
    ],
    teammates: ['CPTF', 'CPUI', 'LSTF'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description:
          '장기 프로젝트에서 서비스의 핵심 구조·API·DB 설계를 책임지기에 가장 적합합니다.'
      },
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: 'AI 기능을 시스템 구조 관점에서 이해하고 설계하는 데 강점을 발휘합니다.'
      }
    ],
    image: PROFILE_IMAGES.LPTI
  },
  LPTF: {
    code: 'LPTF',
    subtitle: '팀 중심 설계자',
    quote: '설계는 혼자가 아니라, 팀이 이해할 때 완성된다.',
    overview: [
      '기술과 협업을 동시에 고려합니다.',
      '구조를 만들되 팀의 흐름도 함께 봅니다.',
      '조율과 정리에 강합니다.'
    ],
    collaboration: [
      '팀 의견을 구조로 정리합니다.',
      '방향성을 설정합니다.',
      '기술과 소통의 균형을 맞춥니다.'
    ],
    teammates: ['LSTF', 'CPTF', 'LPUI'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '팀의 역할 분담과 구조를 설계하며 협업을 조율하기에 적합합니다.'
      },
      {
        name: 'AX 창업 프로그램 X SINSA',
        schedule: '3월 ~ 7월 예정',
        description: '기술 구조를 사업 모델 구조로 확장하는 사고를 실전에서 경험할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.LPTF
  },
  LSTI: {
    code: 'LSTI',
    subtitle: '실전형 개인 플레이어',
    quote: '일단 만든다. 그리고 고친다.',
    overview: ['빠른 실행력이 강점입니다.', '집중력이 높습니다.', '결과로 증명합니다.'],
    collaboration: ['속도 중심으로 움직입니다.', '완성을 우선합니다.', '실행 후 개선합니다.'],
    teammates: ['LPTF', 'CPUF', 'LPUF'],
    projects: [
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '짧은 시간 안에 MVP를 빠르게 구현하는 환경이 가장 잘 맞습니다.'
      },
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '개인 실행력을 팀 프로젝트 속에서 체계적으로 확장할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.LSTI
  },
  LSTF: {
    code: 'LSTF',
    subtitle: '실전형 팀 플레이어',
    quote: '속도는 팀 안에서 더 빨라진다.',
    overview: ['실행력과 소통을 동시에 갖췄습니다.', '유연합니다.', '팀 분위기 속에서 성장합니다.'],
    collaboration: [
      '피드백 반영이 빠릅니다.',
      '소통이 적극적입니다.',
      '속도와 완성도를 균형 있게 봅니다.'
    ],
    teammates: ['LPTI', 'CPTF', 'LPUF'],
    projects: [
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '팀 단위 몰입형 환경에서 실행력과 소통 능력이 빛납니다.'
      },
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '장기 협업 속에서 팀 플레이어로서의 강점을 지속적으로 발휘할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.LSTF
  },
  CPTI: {
    code: 'CPTI',
    subtitle: '기획 감각형 설계자',
    quote: '좋은 아이디어는 코드로 증명된다.',
    overview: [
      '아이디어를 구조화합니다.',
      '서비스 흐름을 이해합니다.',
      '기획과 개발을 연결합니다.'
    ],
    collaboration: [
      '기능 단위로 정리합니다.',
      '방향을 명확히 합니다.',
      '논리와 감각을 동시에 봅니다.'
    ],
    teammates: ['LSTF', 'LPTI', 'LPUI'],
    projects: [
      {
        name: 'AX 창업 프로그램 X SINSA',
        schedule: '3월 ~ 7월 예정',
        description: '아이디어를 기술과 사업으로 연결하는 융합 역량을 실전에서 검증할 수 있습니다.'
      },
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: 'AI 기술을 서비스 기획 관점에서 해석하고 적용하기에 적합합니다.'
      }
    ],
    image: PROFILE_IMAGES.CPTI
  },
  CPTF: {
    code: 'CPTF',
    subtitle: '아이디어 메이커',
    quote: '아이디어는 팀 안에서 더 강해진다.',
    overview: ['창의적입니다.', '사용자 관점이 강합니다.', '방향을 제시합니다.'],
    collaboration: [
      '브레인스토밍을 주도합니다.',
      '의견을 연결합니다.',
      '팀 분위기를 부드럽게 만듭니다.'
    ],
    teammates: ['LPTI', 'LSTF', 'LSUI'],
    projects: [
      {
        name: 'AX 창업 프로그램 X SINSA',
        schedule: '3월 ~ 7월 예정',
        description: '브레인스토밍을 실제 서비스와 사업 모델로 발전시키기에 최적입니다.'
      },
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '떠오른 아이디어를 빠르게 실험하고 구현해볼 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.CPTF
  },
  CSTI: {
    code: 'CSTI',
    subtitle: '자유로운 실험가',
    quote: '해보면 안다.',
    overview: ['도전을 즐깁니다.', '새 기술에 열려 있습니다.', '프로토타입 제작에 강합니다.'],
    collaboration: ['아이디어를 바로 실행합니다.', '실험을 반복합니다.', '빠르게 수정합니다.'],
    teammates: ['CPUI', 'LPTF', 'LPUI'],
    projects: [
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: '새로운 AI 기술을 가장 빠르게 체험하고 실험해볼 수 있는 환경입니다.'
      },
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '실험적 아이디어를 MVP로 구현하며 도전하기에 적합합니다.'
      }
    ],
    image: PROFILE_IMAGES.CSTI
  },
  CSTF: {
    code: 'CSTF',
    subtitle: '에너지 넘치는 크리에이터',
    quote: '분위기를 만들고 실행으로 연결한다.',
    overview: ['활기가 넘칩니다.', '즉흥적 실행력이 강점입니다.', '팀 사기를 끌어올립니다.'],
    collaboration: [
      '아이디어를 빠르게 시도합니다.',
      '분위기를 긍정적으로 이끕니다.',
      '실행으로 팀에 에너지를 공급합니다.'
    ],
    teammates: ['LSTF', 'CPTF', 'CPUF'],
    projects: [
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '팀 몰입 환경에서 실행력과 분위기 메이킹 역량이 강하게 드러납니다.'
      },
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: '새로운 기술을 팀과 함께 빠르게 실험하며 결과로 연결하기 좋습니다.'
      }
    ],
    image: PROFILE_IMAGES.CSTF
  },
  LPUI: {
    code: 'LPUI',
    subtitle: '기술 몰입형 장인',
    quote: '디테일이 완성도를 만든다.',
    overview: ['기술 깊이에 몰입합니다.', '최적화를 중시합니다.', '완성도를 중요하게 생각합니다.'],
    collaboration: ['묵묵히 구현합니다.', '기술 안정성을 책임집니다.', '코드 품질을 관리합니다.'],
    teammates: ['CPTF', 'LSTF', 'CSUI'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '코드 품질과 구조 완성도를 장기 프로젝트 속에서 깊이 있게 다듬을 수 있습니다.'
      },
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: '기술 자체에 몰입하며 AI 구현을 심층적으로 탐구하기에 적합합니다.'
      }
    ],
    image: PROFILE_IMAGES.LPUI
  },
  LPUF: {
    code: 'LPUF',
    subtitle: '안정형 팀 엔지니어',
    quote: '팀의 안정성을 만드는 엔지니어.',
    overview: [
      '기술과 협업 균형이 좋습니다.',
      '장기 유지보수 관점이 강합니다.',
      '팀의 신뢰를 얻는 타입입니다.'
    ],
    collaboration: [
      '구현 안정성에 집중합니다.',
      '팀 피드백을 차분히 반영합니다.',
      '결과물을 꾸준히 개선합니다.'
    ],
    teammates: ['LSTI', 'LSTF', 'CPUF'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '장기 프로젝트에서 안정성과 유지보수 관점을 강하게 발휘할 수 있습니다.'
      },
      {
        name: 'AX 창업 프로그램 X SINSA',
        schedule: '3월 ~ 7월 예정',
        description: '서비스 운영을 고려한 기술 완성도를 실전에서 쌓기 좋습니다.'
      }
    ],
    image: PROFILE_IMAGES.LPUF
  },
  LSUI: {
    code: 'LSUI',
    subtitle: '성장형 개발러',
    quote: '성장은 가장 강력한 무기다.',
    overview: ['배움에 열려 있습니다.', '흡수력이 빠릅니다.', '경험을 통해 성장합니다.'],
    collaboration: ['피드백을 잘 수용합니다.', '질문을 많이 합니다.', '빠르게 적응합니다.'],
    teammates: ['LPTF', 'CPTI', 'LPUI'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '스터디부터 팀 프로젝트까지 단계적 성장 구조를 경험할 수 있습니다.'
      },
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: '새로운 기술을 배우며 성장 속도를 가속화할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.LSUI
  },
  LSUF: {
    code: 'LSUF',
    subtitle: '팀에서 크는 새싹',
    quote: '함께할 때 성장 속도가 빨라진다.',
    overview: [
      '소통으로 배우는 타입입니다.',
      '협업 맥락 이해가 빠릅니다.',
      '질문을 통해 문제를 풀어갑니다.'
    ],
    collaboration: [
      '팀 내 피드백 루프를 잘 탑니다.',
      '작은 역할부터 책임집니다.',
      '과정을 공유하며 성장합니다.'
    ],
    teammates: ['LPTF', 'CPTF', 'CPUF'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '장기 협업을 통해 성장 기반을 만들기 좋은 환경입니다.'
      },
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '실전 팀 경험 속에서 빠르게 배우고 성장할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.LSUF
  },
  CPUI: {
    code: 'CPUI',
    subtitle: '사용자 중심 설계자',
    quote: '사용자가 이해하지 못하면 의미 없다.',
    overview: [
      'UX와 흐름에 강합니다.',
      '서비스 전체를 봅니다.',
      '문제 정의를 중요하게 생각합니다.'
    ],
    collaboration: [
      '기획과 개발을 연결합니다.',
      '사용자 관점으로 기능을 해석합니다.',
      '명확한 방향 설정을 선호합니다.'
    ],
    teammates: ['LPTI', 'LSTI', 'CSTI'],
    projects: [
      {
        name: 'AX 창업 프로그램 X SINSA',
        schedule: '3월 ~ 7월 예정',
        description: '사용자 문제 정의부터 사업화까지 UX 관점을 확장할 수 있습니다.'
      },
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '사용자 흐름을 실제 개발 과정에서 검증하고 개선할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.CPUI
  },
  CPUF: {
    code: 'CPUF',
    subtitle: '공감형 기획자',
    quote: '사용자와 팀 사이를 연결한다.',
    overview: [
      '공감 능력이 뛰어납니다.',
      '문제 맥락을 넓게 봅니다.',
      '팀 커뮤니케이션을 강화합니다.'
    ],
    collaboration: [
      '의견을 정리해 전달합니다.',
      '팀의 합의점을 빠르게 찾습니다.',
      '사용자 관점을 팀 언어로 번역합니다.'
    ],
    teammates: ['LSTI', 'LPUF', 'CPTF'],
    projects: [
      {
        name: 'AX 창업 프로그램 X SINSA',
        schedule: '3월 ~ 7월 예정',
        description: '기획과 사용자 관점을 사업 모델로 연결하는 경험을 쌓을 수 있습니다.'
      },
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '짧은 기간 안에 팀 방향을 잡고 실행으로 이어가기 좋습니다.'
      }
    ],
    image: PROFILE_IMAGES.CPUF
  },
  CSUI: {
    code: 'CSUI',
    subtitle: '감각적 크리에이터',
    quote: '디테일이 분위기를 만든다.',
    overview: ['감성과 몰입이 강점입니다.', '시각적 완성도를 중시합니다.', '깊게 파고듭니다.'],
    collaboration: ['완성도를 높입니다.', '디자인 디테일을 책임집니다.', '집중력이 높습니다.'],
    teammates: ['LPUI', 'LSTF', 'CPTF'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: 'UX/UI 감각을 실전 서비스 완성도로 연결할 수 있습니다.'
      },
      {
        name: 'Build with AI',
        schedule: '2026년 3월 28일',
        description: '기술과 감성을 결합한 결과물을 직접 만들어볼 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES.CSUI
  },
  CSUF: {
    code: 'CSUF',
    subtitle: '분위기 메이커',
    quote: '감각과 소통으로 팀 색깔을 만든다.',
    overview: ['팀 분위기 조성이 강점입니다.', '콘텐츠 감각이 좋습니다.', '소통에 적극적입니다.'],
    collaboration: [
      '의견 공유를 활발히 만듭니다.',
      '발표와 전달에서 강점을 보입니다.',
      '팀 색깔을 형성합니다.'
    ],
    teammates: ['CPTF', 'LSTF', 'CPUF'],
    projects: [
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '팀 에너지와 커뮤니케이션이 중요한 환경에서 강점을 보입니다.'
      },
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '장기 프로젝트에서도 팀 분위기와 몰입을 유지하는 역할에 적합합니다.'
      }
    ],
    image: PROFILE_IMAGES.CSUF
  }
}

const DEFAULT_TYPE_META: MbtiTypeMeta = {
  subtitle: '개발자 유형',
  iconKind: 'cap',
  iconColor: '#4285F4',
  teammateGridSubtitle: '개발자\n유형',
  shortResult: {
    subtitle: '개발자 유형',
    points: ['유형별 강점이 분명합니다.', '실행과 협업의 균형을 갖췄습니다.'],
    recommendation: '프로젝트 참여'
  }
}

const MBTI_BY_TAG: Record<string, { meta: MbtiTypeMeta; profile: ResultType }> = Object.entries(
  RESULTS
).reduce(
  (acc, [code, profile]) => {
    acc[code] = {
      meta: TYPE_META[code] ?? DEFAULT_TYPE_META,
      profile
    }
    return acc
  },
  {} as Record<string, { meta: MbtiTypeMeta; profile: ResultType }>
)

const ALL_RESULT_RANK_ORDER = [
  'LPTI',
  'LPTF',
  'LSTI',
  'LSTF',
  'CPTI',
  'CPTF',
  'CSTI',
  'CSTF',
  'LPUI',
  'LPUF',
  'LSUI',
  'LSUF',
  'CPUI',
  'CPUF',
  'CSUI',
  'CSUF'
]

function getRankBadgeColor(rank: number) {
  if (rank === 1) return '#EA4335'
  if (rank === 2) return '#4285F4'
  if (rank === 3) return '#34A853'
  if (rank === 4) return '#F9AB00'
  return '#979797'
}

const AXIS_LABELS: Record<Axis, [string, string]> = {
  LC: ['L', 'C'],
  PS: ['P', 'S'],
  TU: ['T', 'U'],
  IF: ['I', 'F']
}

function HeaderWithBack({
  onBack,
  backgroundClassName = 'bg-white',
  showBack = true
}: {
  onBack: () => void
  backgroundClassName?: string
  showBack?: boolean
}) {
  return (
    <header
      className={`sticky top-0 z-20 h-14 w-full ${backgroundClassName} shadow-[0_0_4px_rgba(30,30,30,0.25)]`}
    >
      <div className="mx-auto relative flex h-full w-full max-w-[375px] items-center justify-center px-4">
        {showBack ? (
          <button
            type="button"
            aria-label="이전으로"
            onClick={onBack}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 text-[#1e1e1e]"
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <div className="flex items-center justify-center gap-2">
          <GdgLogo mode="mobile" variant="icon" />
          <div className="font-google-sans-flex leading-none">
            <p className="text-[14px] tracking-[-0.14px] text-black">Google Developer Group</p>
            <p className="mt-0.5 text-[10px] tracking-[-0.1px] text-blue">Inha University</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function AboutGdgocSection() {
  return (
    <section className="mt-8 text-center">
      <p className="text-[14px] font-medium leading-5 text-[#1e1e1e]">About GDGoC INHA</p>
      <div className="mt-2 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://www.instagram.com/gdgoc.inha/"
            target="_blank"
            rel="noreferrer"
            className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-[0_0_4px_rgba(30,30,30,0.25)]"
            aria-label="GDGoC 인스타그램"
          >
            <FaInstagram size={24} />
          </a>
          <p className="text-[11px] font-medium leading-[14px] text-[#1e1e1e]">인스타그램</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://info.gdgocinha.com/"
            target="_blank"
            rel="noreferrer"
            className="grid size-12 place-items-center rounded-full bg-[#fafafa] text-black shadow-[0_0_4px_rgba(30,30,30,0.25)]"
            aria-label="GDGoC 상세보기"
          >
            <SiNotion size={20} />
          </a>
          <p className="text-[11px] font-medium leading-[14px] text-[#1e1e1e]">상세보기</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://gdgocinha.com/recruit/member"
            target="_blank"
            rel="noreferrer"
            className="flex size-12 items-center justify-center rounded-full bg-[#fafafa] py-[10px] pl-[6px] pr-[10px] text-black shadow-[0_0_4px_rgba(30,30,30,0.25)]"
            aria-label="GDGoC 가입하기"
          >
            <img src={ICON_ENTER_LOCAL} alt="" className="size-6" />
          </a>
          <p className="text-[11px] font-medium leading-[14px] text-[#1e1e1e]">가입하기</p>
        </div>
      </div>
    </section>
  )
}

function TypeSymbolIcon({ code, size = 24 }: { code: string; size?: number }) {
  const meta = MBTI_BY_TAG[code]?.meta ?? DEFAULT_TYPE_META
  const iconSet = TYPE_ICON_BY_KIND[meta.iconKind] ?? TYPE_ICON_BY_KIND.cap
  const iconSrc = size <= 16 ? iconSet.sm : iconSet.lg
  return <img src={iconSrc} alt="" width={size} height={size} className="shrink-0" />
}

function ShortResultPreviewHtml({ type, profile }: { type: string; profile: ResultType }) {
  const short = MBTI_BY_TAG[type]?.meta.shortResult
  const subtitle = short?.subtitle ?? profile.subtitle
  const pointA = short?.points?.[0] ?? '유형별 강점이 분명합니다.'
  const pointB = short?.points?.[1] ?? '실행과 협업의 균형을 갖췄습니다.'
  const recommendation = short?.recommendation ?? profile.projects[0]?.name ?? '프로젝트 참여'
  const illustrationSrc = profile.image || PROFILE_IMAGES[type] || PROFILE_IMAGES.LPTI

  return (
    <section className="mx-auto h-[666px] w-[375px] max-w-full bg-[#f0f0f0] p-4 pt-[74px]">
      <div className="flex h-full flex-col items-center justify-between pb-[75px]">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <p className="typo-m-b3 rounded-[400px] bg-[#fafafa] px-8 py-1 text-[#666]">나의 개발 유형은...</p>
            <img
              src={illustrationSrc}
              alt={`${type} 이미지`}
              width={180}
              height={180}
              className="rounded-lg"
              loading="eager"
              decoding="sync"
              crossOrigin="anonymous"
              onError={(event) => {
                const fallback = PROFILE_IMAGES[type] || PROFILE_IMAGES.LPTI
                if (event.currentTarget.src.endsWith(fallback)) {
                  return
                }
                event.currentTarget.src = fallback
              }}
            />
            <div className="flex w-[220px] flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <TypeSymbolIcon code={type} size={24} />
                <p className="font-dunggeunmo text-[32px] leading-[34px] text-[#1e1e1e]">{type}</p>
              </div>
              <p className="font-dunggeunmo whitespace-nowrap text-center text-sm leading-[14px] text-[#1e1e1e]">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <div className="flex h-20 flex-col justify-center gap-2 rounded-lg border border-[#b2b2b2] bg-[#fafafa] p-4">
              <p className="typo-m-b3 text-[#1e1e1e]">• {pointA}</p>
              <p className="typo-m-b3 text-[#1e1e1e]">• {pointB}</p>
            </div>
            <div className="flex h-[52px] items-center rounded-lg border border-[#b2b2b2] bg-[#fafafa] p-4">
              <p className="typo-m-b3 text-[#1e1e1e]">
                👉 추천: <span className="font-bold">{recommendation}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-[42px]">
            <GdgLogo mode="mobile" variant="icon" />
          </div>
          <div className="font-google-sans-flex leading-none">
            <p className="text-[14px] tracking-[-0.14px] text-[#1e1e1e]">Google Developer Group</p>
            <p className="mt-0.5 text-[10px] tracking-[-0.1px] text-[#4285f4]">Inha University</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function getFallbackProfile(code: string): ResultType {
  const typeMeta = MBTI_BY_TAG[code]?.meta ?? TYPE_META[code]
  return {
    code,
    subtitle: typeMeta?.subtitle ?? '개발자 유형',
    quote: '당신만의 방식으로 팀에 기여합니다.',
    overview: [
      '유형별 강점이 분명합니다.',
      '실행과 협업의 균형을 갖췄습니다.',
      '팀 안에서 성장할 가능성이 큽니다.'
    ],
    collaboration: [
      '명확한 역할 분담을 선호합니다.',
      '피드백을 빠르게 반영합니다.',
      '결과 중심으로 개선합니다.'
    ],
    teammates: ['LPTF', 'CPTF', 'LSTF'],
    projects: [
      {
        name: 'GOAT 2.0',
        schedule: '3월 ~ 6월 예정',
        description: '장기 프로젝트에서 유형 강점을 꾸준히 발휘할 수 있습니다.'
      },
      {
        name: 'GDGoC INHA 연합 해커톤',
        schedule: '5월 예정',
        description: '실행 중심 환경에서 역량을 빠르게 검증할 수 있습니다.'
      }
    ],
    image: PROFILE_IMAGES[code] ?? PROFILE_IMAGES.LPTI
  }
}

export default function MbtiEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>('main')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isPolicyAgreed, setIsPolicyAgreed] = useState(false)
  const [answers, setAnswers] = useState<Record<number, Choice>>({})
  const [allResultDetailType, setAllResultDetailType] = useState<string | null>(null)
  const [allResultsEntryStage, setAllResultsEntryStage] = useState<'main' | 'result'>('main')
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [typeParticipantCounts, setTypeParticipantCounts] = useState<Record<string, number>>({})
  const [isShortPreviewOpen, setIsShortPreviewOpen] = useState(false)
  const questionRefs = useRef<(HTMLElement | null)[]>([])
  const submittedResultKeyRef = useRef<string | null>(null)
  const sharedTypeRef = useRef<string | null>(null)
  const didInitFromQueryRef = useRef(false)

  const answeredCount = Object.keys(answers).length
  const isComplete = answeredCount === QUESTIONS.length
  const canStart = name.trim().length > 0 && studentId.trim().length > 0 && isPolicyAgreed

  const result = useMemo(() => {
    const sharedType = sharedTypeRef.current
    if (sharedType && MBTI_BY_TAG[sharedType]) {
      return {
        type: sharedType,
        profile: MBTI_BY_TAG[sharedType].profile
      }
    }

    if (!isComplete) {
      return null
    }

    const counts = { L: 0, C: 0, P: 0, S: 0, T: 0, U: 0, I: 0, F: 0 }

    QUESTIONS.forEach((question) => {
      const choice = answers[question.id]
      if (!choice) {
        return
      }

      const [first, second] = AXIS_LABELS[question.axis]
      counts[choice === 'A' ? first : second] += 1
    })

    const type = `${counts.L >= counts.C ? 'L' : 'C'}${counts.P >= counts.S ? 'P' : 'S'}${counts.T >= counts.U ? 'T' : 'U'}${counts.I >= counts.F ? 'I' : 'F'}`

    return {
      type,
      profile: MBTI_BY_TAG[type]?.profile ?? getFallbackProfile(type)
    }
  }, [answers, isComplete])

  const allResultDetail = useMemo(() => {
    const type = allResultDetailType ?? result?.type ?? ALL_RESULT_RANK_ORDER[0]
    return {
      type,
      profile: MBTI_BY_TAG[type]?.profile ?? getFallbackProfile(type)
    }
  }, [allResultDetailType, result])

  const rankedTypes = useMemo(() => {
    const orderMap = new Map(ALL_RESULT_RANK_ORDER.map((type, index) => [type, index]))
    return [...ALL_RESULT_RANK_ORDER].sort((a, b) => {
      const countA = typeParticipantCounts[a] ?? 0
      const countB = typeParticipantCounts[b] ?? 0
      if (countA !== countB) {
        return countB - countA
      }
      return (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999)
    })
  }, [typeParticipantCounts])

  useEffect(() => {
    if (didInitFromQueryRef.current) {
      return
    }

    const typeParam = (searchParams.get('type') || '').trim().toUpperCase()
    if (!typeParam || !MBTI_BY_TAG[typeParam]) {
      didInitFromQueryRef.current = true
      return
    }

    sharedTypeRef.current = typeParam
    setAnswers({})
    setStage('result')
    didInitFromQueryRef.current = true
  }, [searchParams])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [stage])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)
    if (stage === 'result' && result) {
      url.searchParams.set('type', result.type)
      window.history.replaceState({}, '', url.toString())
      return
    }

    if (url.searchParams.has('type')) {
      url.search = ''
      window.history.replaceState({}, '', url.toString())
    }
  }, [stage, result])

  useEffect(() => {
    if (stage !== 'result' || !result) {
      return
    }

    const trimmedName = name.trim()
    const trimmedStudentId = studentId.trim()
    const apiBase = process.env.NEXT_PUBLIC_BASE_API_URL

    if (!trimmedName || !trimmedStudentId || !apiBase) {
      return
    }

    const requestKey = `${trimmedName}|${trimmedStudentId}|${result.type}`
    if (submittedResultKeyRef.current === requestKey) {
      return
    }

    submittedResultKeyRef.current = requestKey

    void fetch(`${apiBase}/game/mbti/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: trimmedName,
        studentId: trimmedStudentId,
        mbtiType: result.type
      })
    }).catch(() => {
      submittedResultKeyRef.current = null
    })
  }, [stage, result, name, studentId])

  useEffect(() => {
    if (stage !== 'allResults' && stage !== 'allResultDetail') {
      return
    }

    const apiBase = process.env.NEXT_PUBLIC_BASE_API_URL
    if (!apiBase) {
      return
    }

    void fetch(`${apiBase}/game/mbti/result/stats`)
      .then(async (response) => {
        if (!response.ok) {
          return null
        }
        const json = (await response.json()) as { data?: MbtiStatsPayload }
        return json.data ?? null
      })
      .then((data) => {
        if (!data) {
          return
        }
        setTotalParticipants(data.totalCount ?? 0)
        const nextCounts = (data.typeCounts ?? []).reduce<Record<string, number>>((acc, item) => {
          acc[item.mbtiType] = item.count
          return acc
        }, {})
        setTypeParticipantCounts(nextCounts)
      })
      .catch(() => undefined)
  }, [stage])

  const handleDownloadShortResultPng = useCallback(() => {
    if (!result) {
      return
    }
    const link = document.createElement('a')
    link.download = `mbti-${result.type}.png`
    link.href = getShortPreviewImageSrc(result.type)
    link.click()
  }, [result])

  const handleBack = useCallback(() => {
    if (isPolicyModalOpen) {
      setIsPolicyModalOpen(false)
      return
    }
    if (isShortPreviewOpen) {
      setIsShortPreviewOpen(false)
      return
    }

    if (stage === 'allResultDetail') {
      setStage('allResults')
      return
    }

    if (stage === 'allResults') {
      setStage(allResultsEntryStage)
      return
    }

    if (stage === 'result') {
      if (Object.keys(answers).length > 0) {
        setStage('quiz')
      } else {
        setStage('main')
      }
      return
    }

    if (stage === 'quiz') {
      setStage('main')
      return
    }

    router.back()
  }, [
    isPolicyModalOpen,
    isShortPreviewOpen,
    stage,
    allResultsEntryStage,
    answers,
    router
  ])

  return (
    <main className="min-h-screen bg-white text-black">
      <HeaderWithBack
        onBack={handleBack}
        backgroundClassName={stage === 'allResults' || stage === 'allResultDetail' ? 'bg-[#f0f0f0]' : 'bg-white'}
        showBack={stage !== 'main'}
      />

      <section className="mx-auto min-h-[calc(100vh-56px)] w-full max-w-[375px] bg-white">

        {stage === 'main' ? (
          <>
            <div className="px-4 pb-8 pt-10">
              <div className="flex flex-col items-center">
                <Image
                  src="/images/MBTI/MBTI_logo.png"
                  alt="MBTI 테스트 로고"
                  width={223}
                  height={143}
                  className="h-auto w-[223px]"
                  priority
                />

                <p className="typo-m-b3 mt-2 rounded-full bg-[#fafafa] px-8 py-1 text-center text-gray-400 shadow-[0_0_2px_rgba(30,30,30,0.25)]">
                  나는 어떤 개발자일까?
                </p>
              </div>

              <div className="mt-10 space-y-6">
                <label className="block">
                  <p className="font-stardust text-base leading-6 text-black">▼ 이름</p>
                  <input
                    className="typo-m-b3 mt-2 h-12 w-full rounded-lg border border-gray-700 bg-[#fafafa] px-4 text-black outline-none"
                    placeholder="이름을 입력하세요."
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>

                <div>
                  <label className="block">
                    <p className="font-stardust text-base leading-6 text-black">▼ 학번</p>
                    <input
                      className="typo-m-b3 mt-2 h-12 w-full rounded-lg border border-gray-700 bg-[#fafafa] px-4 text-black outline-none"
                      placeholder="학번을 입력하세요."
                      value={studentId}
                      inputMode="numeric"
                      onChange={(event) =>
                        setStudentId(event.target.value.replace(/[^0-9]/g, '').slice(0, 8))
                      }
                    />
                  </label>

                  <div className="mt-4 flex items-center justify-end gap-1">
                    <span className="text-base font-bold leading-6 text-red">*</span>
                    <button
                      type="button"
                      className="typo-m-b3 underline"
                      onClick={() => setIsPolicyModalOpen(true)}
                    >
                      개인정보 수집 및 활용
                    </button>
                    <p className="typo-m-b3">에 동의합니다.</p>
                    <GdgCheckbox
                      aria-label="개인정보 수집 및 활용 동의"
                      size="pc"
                      checked={isPolicyAgreed}
                      className={`ml-1 ${isPolicyAgreed ? '' : 'border-black'}`}
                      onCheckedChange={setIsPolicyAgreed}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pb-8">
              <button
                type="button"
                disabled={!canStart}
                className={`font-dunggeunmo h-12 w-full rounded-lg text-base leading-5 text-white shadow-[0_0_4px_rgba(30,30,30,0.25)] ${
                  canStart ? 'bg-red' : 'cursor-not-allowed bg-gray-500'
                }`}
                onClick={() => canStart && setStage('quiz')}
              >
                시작하기
              </button>
            </div>
          </>
        ) : null}

        {stage === 'quiz' ? (
          <div className="relative px-4 pb-8 pt-10">
            <div className="pointer-events-none absolute left-1/2 top-[190px] -translate-x-1/2 opacity-10">
              <GdgLogo mode="mobile" variant="icon" className="h-auto w-[281px]" />
            </div>

            <div className="relative z-10 flex flex-col gap-8">
              {QUESTIONS.map((question, index) => (
                <article
                  key={question.id}
                  ref={(element) => {
                    questionRefs.current[index] = element
                  }}
                  className="scroll-mt-20 rounded-lg bg-white/70 p-4 shadow-[0_0_4px_rgba(30,30,30,0.25)]"
                >
                  <p className="font-stardust text-black">
                    <span className="text-xs leading-6">Q{question.id}.</span>
                    <span className="ml-1 text-base leading-6">{question.prompt}</span>
                  </p>

                  <div className="mt-4 flex flex-col gap-3">
                    {(['A', 'B'] as const).map((choice) => {
                      const isSelected = answers[question.id] === choice
                      return (
                        <button
                          key={choice}
                          type="button"
                          className={`typo-m-b3 flex h-12 w-full items-center rounded-lg px-4 text-left shadow-[0_0_2px_rgba(30,30,30,0.25)] ${
                            isSelected ? 'bg-gray-900 text-black' : 'bg-[#fafafa] text-black'
                          }`}
                          onClick={() => {
                            setAnswers((prev) => ({ ...prev, [question.id]: choice }))

                            const nextQuestion = questionRefs.current[index + 1]
                            if (nextQuestion) {
                              nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }}
                        >
                          {choice}. {question.options[choice]}
                        </button>
                      )
                    })}
                  </div>
                </article>
              ))}

              <button
                type="button"
                disabled={!isComplete}
                className={`font-dunggeunmo h-12 w-full rounded-lg text-base leading-5 text-white shadow-[0_0_4px_rgba(30,30,30,0.25)] ${
                  isComplete ? 'bg-red' : 'cursor-not-allowed bg-gray-500'
                }`}
                onClick={() => isComplete && setStage('result')}
              >
                {isComplete ? '결과 보기' : `${answeredCount}/12 선택 완료`}
              </button>
            </div>
          </div>
        ) : null}

        {stage === 'allResults' ? (
          <div className="px-4 pb-10 pt-7">
            <div className="flex justify-center">
              <p className="typo-m-b3 rounded-full bg-[#fafafa] px-8 py-1 text-center text-black shadow-[0_0_2px_rgba(30,30,30,0.25)]">
                실시간 개발 유형 순위
              </p>
            </div>
            <p className="mt-2 text-center text-xs font-medium leading-[18px] text-[#666]">
              총 {totalParticipants}명 참여
            </p>

            <div className="mt-6 space-y-4">
              {rankedTypes.map((type, index) => {
                const rank = index + 1
                const profile = MBTI_BY_TAG[type]?.profile ?? getFallbackProfile(type)
                const short = MBTI_BY_TAG[type]?.meta.shortResult
                return (
                  <button
                    key={type}
                    type="button"
                    className="relative w-full rounded-lg bg-[#fafafa] p-4 text-left shadow-[0_0_2px_rgba(30,30,30,0.25)]"
                    onClick={() => {
                      setAllResultDetailType(type)
                      setStage('allResultDetail')
                    }}
                  >
                    <span
                      className="font-dunggeunmo absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-2xl text-xs text-white"
                      style={{ backgroundColor: getRankBadgeColor(rank) }}
                    >
                      {rank}
                    </span>
                    <p className="absolute right-3 top-3 text-[11px] font-medium leading-[14px] text-[#666]">
                      {typeParticipantCounts[type] ?? 0}명
                    </p>
                    <div className="flex gap-4">
                      <Image
                        src={profile.image}
                        alt={`${type} 유형 이미지`}
                        width={90}
                        height={90}
                        className="rounded-lg"
                      />
                      <div className="flex h-[90px] flex-col justify-between">
                        <div className="space-y-2">
                          <p className="font-dunggeunmo flex items-center gap-2 text-2xl leading-6 text-[#1e1e1e]">
                            <TypeSymbolIcon code={type} size={20} />
                            {type}
                          </p>
                          <p className="font-dunggeunmo text-sm leading-[14px] text-[#1e1e1e]">
                            {short?.subtitle ?? profile.subtitle}
                          </p>
                        </div>
                        <p className="text-xs font-medium leading-[18px] text-[#1e1e1e]">
                          👉 추천: {short?.recommendation ?? profile.projects[0]?.name ?? '프로젝트 참여'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {stage === 'allResultDetail' ? (
          <div className="px-4 pb-10 pt-6">
            <section className="mx-auto w-full max-w-[343px]">
              <div className="flex flex-col items-center gap-4">
                <p className="typo-m-b3 rounded-full bg-[#fafafa] px-8 py-1 text-center text-gray-400 shadow-[0_0_2px_rgba(30,30,30,0.25)]">
                  나의 개발 유형은...
                </p>
                <Image
                  src={allResultDetail.profile.image}
                  alt={`${allResultDetail.type} 결과 이미지`}
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TypeSymbolIcon code={allResultDetail.profile.code} size={24} />
                    <p className="font-dunggeunmo text-[32px] leading-[34px] text-black">
                      {allResultDetail.profile.code}
                    </p>
                  </div>
                  <p className="font-dunggeunmo mt-1 text-sm text-black">
                    {MBTI_BY_TAG[allResultDetail.type]?.meta.shortResult.subtitle ??
                      allResultDetail.profile.subtitle}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-10 space-y-6">
              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">당신은 이런 유형입니다</p>
                <div className="rounded-lg border border-gray-700 bg-[#fafafa] p-4">
                  <div className="space-y-2">
                    {allResultDetail.profile.overview.map((line) => (
                      <p key={line} className="typo-m-b3 text-black">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">협업 스타일</p>
                <div className="rounded-lg border border-gray-700 bg-[#fafafa] p-4">
                  <div className="space-y-2">
                    {allResultDetail.profile.collaboration.map((line) => (
                      <p key={line} className="typo-m-b3 text-black">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">이런 팀원과 잘 어울려요</p>
                <div className="grid grid-cols-3 gap-2">
                  {allResultDetail.profile.teammates.map((code) => {
                    const typeMeta = MBTI_BY_TAG[code]?.meta ?? TYPE_META[code]
                    return (
                      <div
                        key={code}
                        className="rounded-lg bg-[#fafafa] p-3 text-center shadow-[0_0_2px_rgba(30,30,30,0.25)]"
                      >
                        <Image
                          src={PROFILE_IMAGES[code]}
                          alt={`${code} 대표 이미지`}
                          width={77}
                          height={77}
                          className="mx-auto rounded-[6px]"
                        />
                        <p className="font-dunggeunmo mt-2 text-xl leading-5 text-black">
                          <span className="inline-flex items-center gap-1">
                            <TypeSymbolIcon code={code} size={16} />
                            {code}
                          </span>
                        </p>
                        <p className="font-dunggeunmo mt-1 whitespace-pre-line text-[10px] leading-3 text-black">
                          {typeMeta?.teammateGridSubtitle ?? typeMeta?.subtitle ?? '개발자 유형'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">추천 프로젝트</p>
                <div className="space-y-2">
                  {allResultDetail.profile.projects.map((project) => (
                    <div
                      key={project.name}
                      className="rounded-lg border border-gray-700 bg-[#fafafa] p-4"
                    >
                      <p className="typo-m-b3 font-bold text-black">• {project.name}</p>
                      <p className="typo-m-b3 mt-2 flex items-center gap-2 text-black">
                        <img src={ICON_CALENDAR_LOCAL} alt="" className="size-4" />
                        {project.schedule}
                      </p>
                      <p className="typo-m-b3 mt-2 text-black">→ {project.description}</p>
                    </div>
                  ))}
                  <p className="pl-2 text-xs font-medium leading-[18px] text-black">
                    ※ 정확한 일정은 GDGoC INHA 인스타그램을 확인해주세요.
                  </p>
                </div>
              </section>
            </div>

            <AboutGdgocSection />
          </div>
        ) : null}

        {stage === 'result' && result ? (
          <div className="px-4 pb-10 pt-6">
            <section className="mx-auto w-full max-w-[343px]">
              <div className="flex flex-col items-center gap-4">
                <p className="typo-m-b3 rounded-full bg-[#fafafa] px-8 py-1 text-center text-gray-400 shadow-[0_0_2px_rgba(30,30,30,0.25)]">
                  나의 개발 유형은...
                </p>
                <Image
                  src={result.profile.image}
                  alt={`${result.type} 결과 이미지`}
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TypeSymbolIcon code={result.profile.code} size={24} />
                    <p className="font-dunggeunmo text-[32px] leading-[34px] text-black">
                      {result.profile.code}
                    </p>
                  </div>
                  <p className="font-dunggeunmo mt-1 text-sm text-black">
                    {result.profile.subtitle}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-10 space-y-6">
              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">
                  당신은 이런 유형입니다
                </p>
                <div className="rounded-lg border border-gray-700 bg-[#fafafa] p-4">
                  <p className="typo-m-b3 mb-2 text-black">{`"${result.profile.quote}"`}</p>
                  <div className="space-y-2">
                    {result.profile.overview.map((line) => (
                      <p key={line} className="typo-m-b3 text-black">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">협업 스타일</p>
                <div className="rounded-lg border border-gray-700 bg-[#fafafa] p-4">
                  <div className="space-y-2">
                    {result.profile.collaboration.map((line) => (
                      <p key={line} className="typo-m-b3 text-black">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">
                  이런 팀원과 잘 어울려요
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {result.profile.teammates.map((code) => {
                    const typeMeta = MBTI_BY_TAG[code]?.meta ?? TYPE_META[code]
                    return (
                      <div
                        key={code}
                        className="rounded-lg bg-[#fafafa] p-3 text-center shadow-[0_0_2px_rgba(30,30,30,0.25)]"
                      >
                        <Image
                          src={PROFILE_IMAGES[code]}
                          alt={`${code} 대표 이미지`}
                          width={77}
                          height={77}
                          className="mx-auto rounded-[6px]"
                        />
                        <p className="font-dunggeunmo mt-2 text-xl leading-5 text-black">
                          <span className="inline-flex items-center gap-1">
                            <TypeSymbolIcon code={code} size={16} />
                            {code}
                          </span>
                        </p>
                        <p className="font-dunggeunmo mt-1 whitespace-pre-line text-[10px] leading-3 text-black">
                          {typeMeta?.teammateGridSubtitle ?? typeMeta?.subtitle ?? '개발자 유형'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section>
                <p className="mb-2 pl-2 text-base font-bold leading-6 text-black">추천 프로젝트</p>
                <div className="space-y-2">
                  {result.profile.projects.map((project) => (
                    <div
                      key={project.name}
                      className="rounded-lg border border-gray-700 bg-[#fafafa] p-4"
                    >
                      <p className="typo-m-b3 font-bold text-black">• {project.name}</p>
                      <p className="typo-m-b3 mt-2 flex items-center gap-2 text-black">
                        <img src={ICON_CALENDAR_LOCAL} alt="" className="size-4" />
                        {project.schedule}
                      </p>
                      <p className="typo-m-b3 mt-2 text-black">→ {project.description}</p>
                    </div>
                  ))}
                  <p className="pl-2 text-xs font-medium leading-[18px] text-black">
                    ※ 정확한 일정은 GDGoC INHA 인스타그램을 확인해주세요.
                  </p>
                </div>
              </section>
            </div>

            <section className="mt-10 flex flex-col items-center gap-4 text-center">
              <p className="typo-m-b3 text-black">내 결과 공유하기</p>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  className="grid size-12 place-items-center rounded-full bg-[#fafafa] p-[10px] text-black shadow-[0_0_4px_rgba(30,30,30,0.25)]"
                  onClick={() => setIsShortPreviewOpen(true)}
                >
                  <img src={ICON_DOWNLOAD_LOCAL} alt="결과 다운로드" className="size-5" />
                </button>
                <p className="text-center text-xs font-medium leading-[18px] text-[#979797]">
                  이미지 다운로드 후 인스타 스토리에 공유하고
                  <br />
                  @gdgoc.inha를 태그해 주세요.
                </p>
              </div>
            </section>

            <section className="mt-8 space-y-4">
              <button
                type="button"
                className="font-dunggeunmo flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red text-sm text-white shadow-[0_0_4px_rgba(30,30,30,0.25)]"
                onClick={() => {
                  setAllResultsEntryStage('result')
                  setAllResultDetailType(result.type)
                  setStage('allResults')
                }}
              >
                전체 결과 보러가기
                <img src={ICON_STATS} alt="" className="size-5" />
              </button>
              <button
                type="button"
                className="font-dunggeunmo flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red text-sm text-white shadow-[0_0_4px_rgba(30,30,30,0.25)]"
                onClick={() => {
                  setStage('main')
                  setAnswers({})
                  setName('')
                  setStudentId('')
                  setIsShortPreviewOpen(false)
                  submittedResultKeyRef.current = null
                }}
              >
                테스트 다시하기
                <img src={ICON_RETRY} alt="" className="size-5" />
              </button>
            </section>
            <AboutGdgocSection />
          </div>
        ) : null}

        {stage === 'result' && result && isShortPreviewOpen ? (
          <div className="fixed inset-0 z-50 bg-black/25 px-4 py-8">
            <div className="mx-auto flex w-full max-w-[375px] flex-col gap-4">
              <div className="relative">
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-white text-xl leading-none text-black shadow-[0_0_8px_rgba(30,30,30,0.25)]"
                  onClick={() => setIsShortPreviewOpen(false)}
                  aria-label="짧은 결과 닫기"
                >
                  ×
                </button>
                <img
                  src={getShortPreviewImageSrc(result.type)}
                  alt={`${result.type} 짧은 결과 이미지`}
                  className="h-auto w-full rounded-lg"
                />
              </div>

              <button
                type="button"
                className="font-dunggeunmo h-12 w-full rounded-lg bg-red text-sm text-white shadow-[0_0_4px_rgba(30,30,30,0.25)]"
                onClick={handleDownloadShortResultPng}
              >
                PNG 저장하기
              </button>
            </div>
          </div>
        ) : null}

        {isPolicyModalOpen ? (
          <div className="fixed inset-0 z-40 bg-black/20">
            <div className="mx-auto mt-[182px] w-full max-w-[375px] px-4">
              <section className="rounded-lg bg-white p-4 shadow-[0_0_4px_rgba(30,30,30,0.25)]">
                <div className="flex items-center justify-between">
                  <p className="font-stardust text-base leading-6 text-black">개인정보처리방침</p>
                  <button
                    type="button"
                    aria-label="모달 닫기"
                    className="text-[32px] leading-none text-black"
                    onClick={() => setIsPolicyModalOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 rounded-lg bg-[#fafafa] p-4 shadow-[0_0_2px_rgba(30,30,30,0.25)]">
                  <p className="typo-m-b3 leading-7 text-black">{POLICY_COPY}</p>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1">
                  <span className="text-base font-bold leading-6 text-red">*</span>
                  <p className="typo-m-b3">개인정보 수집 및 활용에 동의합니다.</p>
                  <GdgCheckbox
                    aria-label="모달 동의 체크"
                    size="pc"
                    checked={isPolicyAgreed}
                    className={`ml-1 ${isPolicyAgreed ? '' : 'border-black'}`}
                    onCheckedChange={(checked) => {
                      setIsPolicyAgreed(checked)
                      if (checked) {
                        setIsPolicyModalOpen(false)
                      }
                    }}
                  />
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
