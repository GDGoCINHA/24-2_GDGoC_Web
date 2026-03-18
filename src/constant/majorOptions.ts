export type MajorOptionItem = {
  code: string
  label: string
}

export type MajorOptionGroup = {
  title: string
  items: MajorOptionItem[]
}

export const majorOptions: MajorOptionGroup[] = [
  {
    title: '소프트웨어융합대학',
    items: [
      { code: 'AIE', label: '인공지능공학과' },
      { code: 'DSE', label: '데이터사이언스학과' },
      { code: 'SME', label: '스마트모빌리티공학과' },
      { code: 'DTE', label: '디자인테크놀로지학과' },
      { code: 'CSE', label: '컴퓨터공학과' }
    ]
  },
  {
    title: '공과대학',
    items: [
      { code: 'ME', label: '기계공학과' },
      { code: 'AAE', label: '항공우주공학과' },
      { code: 'NAE', label: '조선해양공학과' },
      { code: 'IME', label: '산업경영공학과' },
      { code: 'CHE', label: '화학공학과' },
      { code: 'PSE', label: '고분자공학과' },
      { code: 'MSE', label: '신소재공학과' },
      { code: 'CIE', label: '사회인프라공학과' },
      { code: 'ENVE', label: '환경공학과' },
      { code: 'GIE', label: '공간정보공학과' },
      { code: 'ACE', label: '건축학부(건축공학)' },
      { code: 'ARCH', label: '건축학부(건축학)' },
      { code: 'ERE', label: '에너지자원공학과' },
      { code: 'MOT', label: '융합기술경영학부' },
      { code: 'EEE', label: '전기전자공학부' },
      { code: 'SSE', label: '반도체시스템공학과' },
      { code: 'BCE', label: '이차전지융합학과' }
    ]
  },
  {
    title: '자연과학대학',
    items: [
      { code: 'MATH', label: '수학과' },
      { code: 'STAT', label: '통계학과' },
      { code: 'PHYS', label: '물리학과' },
      { code: 'CHEM', label: '화학과' },
      { code: 'OCS', label: '해양과학과' },
      { code: 'FNS', label: '식품영양학과' }
    ]
  },
  {
    title: '경영대학',
    items: [
      { code: 'BUS', label: '경영학부(경영학과)' },
      { code: 'FIN', label: '경영학부(파이낸스경영학과)' },
      { code: 'APL', label: '아태물류학부' },
      { code: 'ITC', label: '국제통상학과' }
    ]
  },
  {
    title: '예술체육대학',
    items: [
      { code: 'FINEART', label: '조형예술학과' },
      { code: 'ID', label: '디자인융합학과' },
      { code: 'SPORTS', label: '스포츠과학과' },
      { code: 'TFA', label: '연극영화학과' },
      { code: 'FD', label: '의류디자인학과' }
    ]
  },
  {
    title: '사회과학대학',
    items: [
      { code: 'PAD', label: '행정학과' },
      { code: 'POL', label: '정치외교학과' },
      { code: 'MCS', label: '미디어커뮤니케이션학과' },
      { code: 'ECON', label: '경제학과' },
      { code: 'CONS', label: '소비자학과' },
      { code: 'CPSY', label: '아동심리학과' },
      { code: 'SW', label: '사회복지학과' }
    ]
  },
  {
    title: '프런티어창의대학',
    items: [
      { code: 'ULS', label: '자유전공융합학부' },
      { code: 'ECS', label: '공학융합학부' },
      { code: 'NCS', label: '자연과학융합학부' },
      { code: 'BCONV', label: '경영융합학부' },
      { code: 'SCS', label: '사회과학융합학부' },
      { code: 'HCS', label: '인문융합학부' }
    ]
  },
  {
    title: '문과대학',
    items: [
      { code: 'KLL', label: '한국어문학과' },
      { code: 'HIST', label: '사학과' },
      { code: 'PHIL', label: '철학과' },
      { code: 'CHIN', label: '중국학과' },
      { code: 'JLC', label: '일본언어문화학과' },
      { code: 'ELH', label: '영미유럽인문융합학부' },
      { code: 'CCM', label: '문화콘텐츠문화경영학과' }
    ]
  },
  {
    title: '미래융합대학',
    items: [
      { code: 'MTE', label: '메카트로닉스공학과' },
      { code: 'SWE', label: '소프트웨어융합공학과' },
      { code: 'IMGT', label: '산업경영학과' },
      { code: 'FI', label: '금융투자학과' }
    ]
  },
  {
    title: '바이오시스템융합학부',
    items: [
      { code: 'BIOE', label: '생명공학과' },
      { code: 'BPE', label: '바이오제약공학과' },
      { code: 'BIOS', label: '생명과학과' },
      { code: 'ABM', label: '첨단바이오의약학과' },
      { code: 'BFE', label: '바이오식품공학과' }
    ]
  },
  {
    title: '국제학부',
    items: [
      { code: 'IBT', label: 'IBT학과' },
      { code: 'ISE', label: 'ISE학과' },
      { code: 'KLC', label: 'KLC학과' }
    ]
  },
  {
    title: '의과대학',
    items: [
      { code: 'PREMED', label: '의예과' },
      { code: 'MED', label: '의학과' }
    ]
  },
  {
    title: '간호대학',
    items: [{ code: 'NURS', label: '간호학과' }]
  },
  {
    title: '사범대학',
    items: [
      { code: 'KOR_EDU', label: '국어교육과' },
      { code: 'ENG_EDU', label: '영어교육과' },
      { code: 'SOC_EDU', label: '사회교육과' },
      { code: 'EDU', label: '교육학과' },
      { code: 'PE_EDU', label: '체육교육과' },
      { code: 'MATH_EDU', label: '수학교육과' }
    ]
  }
]

const allMajorItems = majorOptions.flatMap((group) => group.items)

export const majorLabelByCode = Object.freeze(
  allMajorItems.reduce<Record<string, string>>((acc, item) => {
    acc[item.code] = item.label
    return acc
  }, {})
)

const majorCodeByLabel = allMajorItems.reduce<Record<string, string>>((acc, item) => {
  acc[item.label] = item.code
  return acc
}, {})

const majorAliasToCode: Record<string, string> = {
  ...majorCodeByLabel,
  스마트모빌리티놀학과: 'SME',
  건축공학전공: 'ACE',
  '건축학전공(5년제)': 'ARCH',
  경영학과: 'BUS',
  파이낸스경영학과: 'FIN',
  '파이낸스경영학부(경영학과)': 'FIN',
  '문화콘텐츠문화경영학부(경영학과)': 'CCM',
  문화컨텐츠경영학과: 'CCM'
}

export const normalizeMajorCode = (value?: string | null): string => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (majorLabelByCode[trimmed]) return trimmed
  return majorAliasToCode[trimmed] ?? trimmed
}

export const formatMajorLabel = (value?: string | null): string => {
  if (!value) return '-'
  const normalized = normalizeMajorCode(value)
  return majorLabelByCode[normalized] ?? value
}
