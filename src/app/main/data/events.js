import inhalogo from '@public/src/images/logo/inha.png';

// 메인 캐러셀 슬라이드 데이터
export const mainSlides = [
  {
    background: '/src/images/songdo_conf.jpg',
    poster: '/src/images/study/study1.jpg',
    tag1: '모집',
    tag2: '외부행사',
    title: 'GDG 인천 HELLO WORLD 행사 운영 스태프 모집 안내',
    description: 'AI와 개발의 만남! 다양한 개발자 세션과 함께하는 GDG Incheon Build with AI: Hello World가 여러분을 찾아갑니다',
    link: 'https://gdg.community.dev/gdg-incheon-build-with-ai-hello-world/'
  },
];

export const ongoingStudies = [
  {
    logo: inhalogo,
    title: '25-1 백엔드 스터디',
    statusLabel: '마감',
    statusColor: '#FBBC04',
    eventType: '내부행사',
    eventTypeColor: '#34A853',
    description: 'Django로 간단한 백엔드 제작부터 리눅스 기초까지 함께 배워봐요!',
    isHidden: false,
    details: {
      purpose: 'Django를 이용한 간단한 벡엔드 구성 및 배포',
      schedule: '매주 월요일 19:00~21:00 / 오프라인',
      target: '웹개발이 처음이신 분\nPython에 대한 기초 지식이 있으신 분\n백엔드 개발을 어디서부터 시작해야할지 모르겠는분'
    }
  },
  {
    logo: inhalogo,
    title: '프론트엔드 스터디',
    statusLabel: '모집중',
    statusColor: '#34A853',
    eventType: '내부행사', 
    eventTypeColor: '#34A853',
    description: 'React와 Next.js를 활용한 모던 웹 개발을 함께 공부해요!',
    isHidden: false,
    details: {
      purpose: 'React 기반 프론트엔드 개발 실력 향상',
      schedule: '매주 수요일 18:00~20:00 / 오프라인',
      target: '웹 프론트엔드에 관심있는 분\nHTML/CSS/JS 기초 지식 보유자\n리액트를 처음 시작하시는 분'
    }
  },
  {
    logo: inhalogo,
    title: 'AI/ML 기초 스터디',
    statusLabel: '모집중',
    statusColor: '#34A853',
    eventType: '내부행사',
    eventTypeColor: '#34A853',
    description: '파이썬으로 시작하는 인공지능과 머신러닝의 기초',
    isHidden: false,
    details: {
      purpose: '머신러닝 기초 개념 학습 및 실습',
      schedule: '매주 금요일 17:00~19:00 / 하이브리드',
      target: '인공지능에 관심이 있는 분\n파이썬 기초 문법을 아시는 분\n데이터 분석을 시작하고 싶은 분'
    }
  },
  {
    logo: inhalogo,
    title: '클라우드 기술 세미나',
    statusLabel: '준비중',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: 'AWS와 GCP를 활용한 클라우드 서비스 구축 및 운영 노하우',
    isHidden: false,
    details: {
      purpose: '클라우드 서비스 실무 역량 강화',
      schedule: '5/15 14:00~18:00 / 오프라인',
      target: '클라우드 서비스에 관심있는 분\n서버 인프라를 공부하고 싶은 분\nDevOps에 관심이 있는 분'
    }
  },
  {
    logo: inhalogo,
    title: '오픈소스 컨트리뷰션',
    statusLabel: '모집예정',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '실제 오픈소스 프로젝트에 기여하면서 성장하는 프로그램',
    isHidden: false,
    details: {
      purpose: '오픈소스 프로젝트 기여 경험 쌓기',
      schedule: '6/1~7/31 / 온라인',
      target: 'Git/Github 사용 경험이 있는 분\n기본적인 코딩 능력을 갖춘 분\n오픈소스 생태계에 관심있는 분'
    }
  },
  {
    logo: inhalogo,
    title: '클라우드 기술 세미나',
    statusLabel: '준비중',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: 'AWS와 GCP를 활용한 클라우드 서비스 구축 및 운영 노하우',
    isHidden: false,
    details: {
      purpose: '클라우드 서비스 실무 역량 강화',
      schedule: '5/15 14:00~18:00 / 오프라인',
      target: '클라우드 서비스에 관심있는 분\n서버 인프라를 공부하고 싶은 분\nDevOps에 관심이 있는 분'
    }
  },
  {
    logo: inhalogo,
    title: '오픈소스 컨트리뷰션',
    statusLabel: '모집예정',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '실제 오픈소스 프로젝트에 기여하면서 성장하는 프로그램',
    isHidden: false,
    details: {
      purpose: '오픈소스 프로젝트 기여 경험 쌓기',
      schedule: '6/1~7/31 / 온라인',
      target: 'Git/Github 사용 경험이 있는 분\n기본적인 코딩 능력을 갖춘 분\n오픈소스 생태계에 관심있는 분'
    }
  }

];

export const ongoingEvents = [
  {
    logo: inhalogo,
    title: '인공지능 세미나',
    statusLabel: '모집중',
    statusColor: '#34A853',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '최신 AI 기술 트렌드와 실제 적용 사례를 공유하는 세미나',
    isHidden: true,
    details: {
      purpose: 'AI 기술의 실무 적용 사례 학습',
      schedule: '5/25 13:00~17:00 / 오프라인',
      target: 'AI/ML에 관심있는 개발자\n데이터 사이언스 분야 종사자\n최신 기술 트렌드에 관심있는 분'
    }
  },
  {
    logo: inhalogo,
    title: '블록체인 해커톤',
    statusLabel: '모집예정',
    statusColor: '#FBBC04',
    eventType: '외부행사', 
    eventTypeColor: '#4089E2',
    description: '블록체인 기술을 활용한 혁신적인 서비스 개발 대회',
    isHidden: true,
    details: {
      purpose: '블록체인 기반 서비스 개발 및 네트워킹',
      schedule: '6/10~6/11 / 오프라인',
      target: '블록체인 개발에 관심있는 분\n스마트 컨트랙트 개발 경험자\n웹3.0 생태계에 관심있는 분'
    }
  },
  {
    logo: inhalogo,
    title: '코딩 대회',
    statusLabel: '진행중',
    statusColor: '#34A853',
    eventType: '외부행사',
    eventTypeColor: '#4089E2', 
    description: '알고리즘 문제 해결 능력을 겨루는 프로그래밍 대회',
    isHidden: true,
    details: {
      purpose: '알고리즘 실력 향상 및 문제해결 능력 개발',
      schedule: '5/1~5/31 / 온라인',
      target: '알고리즘에 관심있는 학생\n코딩 테스트 준비생\n프로그래밍 실력 향상을 원하는 분'
    }
  },
  {
    logo: inhalogo,
    title: 'UX/UI 디자인 워크샵',
    statusLabel: '모집중',
    statusColor: '#34A853',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '사용자 중심의 디자인 프로세스를 배우는 실무 워크샵',
    isHidden: true,
    details: {
      purpose: 'UX/UI 디자인 실무 역량 강화',
      schedule: '5/20 10:00~18:00 / 오프라인',
      target: '디자인에 관심있는 개발자\nUX/UI 디자이너\n제품 기획자'
    }
  },
  {
    logo: inhalogo,
    title: '모바일 앱 개발 컨퍼런스',
    statusLabel: '준비중',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '모바일 앱 개발의 최신 트렌드와 기술을 공유하는 컨퍼런스',
    isHidden: true,
    details: {
      purpose: '모바일 앱 개발 역량 강화 및 네트워킹',
      schedule: '6/15 09:00~18:00 / 오프라인',
      target: '앱 개발자\n모바일 서비스 기획자\n크로스플랫폼 개발에 관심있는 분'
    }
  }
]; 