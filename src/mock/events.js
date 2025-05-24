import inhalogo from '@public/icons/logo/inha.png';
import django from '@public/icons/logo/django.png';
import figma from '@public/icons/logo/figma.png';
import chatgpt from '@public/icons/logo/chatgpt.png';
import python from '@public/icons/logo/python.png';


import songdo_conf from '@public/images/activity/songdo_conf.jpg';
import study1 from '@public/images/study/study1.jpg';
import buildwithai from '@public/images/activity/buildwithai.png';
import seminar_bg from '@public/images/activity/seminar_bg.png';



// 메인 캐러셀 슬라이드 데이터
export const mainSlides = [
  {
    background: songdo_conf,
    poster: buildwithai,
    tag1: '마감',
    tag2: '외부행사',
    title: 'GDG 인천 HELLO WORLD 행사 운영 스태프 모집 안내',
    description: 'AI와 개발의 만남! 다양한 개발자 세션과 함께하는 GDG Incheon Build with AI: Hello World가 여러분을 찾아갑니다',
    link: 'https://gdg.community.dev/events/details/google-gdg-incheon-presents-hello-world-amp-build-with-ai-in-incheon/cohost-gdg-on-campus-inha-university-incheon-south-korea'
  },
  {
    background: seminar_bg,
    poster: 'none',
    tag1: '모집중',
    tag2: '내부행사',
    title: 'GDGoC INHA 3회 정기총회 및 특강 진행안내',
    description: '25-1 마지막 정기 총회 및 특강을 진행합니다. GDG Organizer 고영민님께서 AI와 관련한 이야기로 특강을 진행합니다.',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSfMr2yWRVrYf6xdA5i_HaC4UHfBAySOUsp5nvNW0RwVdmbAug/viewform'
  },
];

export const ongoingStudies = [
  {
    logo: django,
    title: '백엔드 스터디',
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
    logo: figma,
    title: 'UX/UI 스터디',
    statusLabel: '모집중',
    statusColor: '#34A853',
    eventType: '내부행사', 
    eventTypeColor: '#34A853',
    description: 'UX/UI 기본개념부터 Figma실습까지! 디자인 감각을 키워봐요!',
    isHidden: false,
    details: {
      purpose: 'UX 실습: 사용자 경험 분석, UI 실습: 프로토타입 제작',
      schedule: '매주 화요일 20~21시 / 온라인',
      target: 'UX/UI 디자인 입문자\n프로젝트 경험이 필요한 학생\n1인, 프론트 엔드(FE) 개발자'
    }
  },
  {
    logo: chatgpt,
    title: '인공지능 스터디',
    statusLabel: '모집중',
    statusColor: '#34A853',
    eventType: '내부행사',
    eventTypeColor: '#34A853',
    description: '인공지능 처음이어도 괜찮아요! 비전공자와 1학년도 함께하는 AI 스터디!',
    isHidden: false,
    details: {
      purpose: '수식 없이 예제를 통해 AI 접해보기',
      schedule: '매주 수요일 17~18시 / 오프라인',
      target: '비전공자\n인공지능에 관심은 있으나 초보자이신 분'
    }
  },
  {
    logo: python,
    title: '파이썬 기초 스터디',
    statusLabel: '준비중',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '파이썬 왕초보를 위한, 처음부터 시작하는 파이썬 기초 스터디!',
    isHidden: false,
    details: {
      purpose: '프로그래밍 지식이 없는 왕초보들을 위한 기초 스터디',
      schedule: '매주 금요일 17~20시 / 오프라인',
      target: '비전공자\n파이썬에 대한 지식이 전혀 없으신 분'
    }
  },
  {
    logo: python,
    title: '파이썬 데이터 분석',
    statusLabel: '준비중',
    statusColor: '#FBBC04',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: '파이썬으로 데이터 분석기초부터, 실습까지! 함께 시작해봐요!',
    isHidden: false,
    details: {
      purpose: '데이터 분석을 해보고 ML으로 솔루션을 개발',
      schedule: '매주 화요일 20시~21시 / 온라인  ',
      target: '데이터 사이언티스트\n엔지니어링에 관심이 있는 분\n데이터 분석 프로젝트 프로세스를 배워보고 싶은 분'
    }
  },

];

export const ongoingEvents = [
  {
    logo: inhalogo,
    title: 'Build With AI / Hello World',
    statusLabel: '모집마감',
    statusColor: '#34A853',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: 'AI와 개발의 만남! 다양한 개발자가 세션을 진행하는 행사',
    isHidden: true,
    details: {
      purpose: '다양한 인사이트 공유 및 개발 세미나 진행',
      schedule: '4/5 13:00~17:00 / 60주년기념관',
      target: 'AI/ML에 관심있는 개발자\nGoogle 세션에 관심있는 누구나\n최신 기술 트렌드에 관심있는 분'
    }
  },
  {
    logo: inhalogo,
    title: 'Pre Sollution Challenge',
    statusLabel: '모집 마감',
    statusColor: '#FBBC04',
    eventType: '내부행사', 
    eventTypeColor: '#4089E2',
    description: 'APAC Sollution Challenge pre 행사',
    isHidden: true,
    details: {
      purpose: '본선진출을 위한, 인하 챕터 내부 pre 행사',
      schedule: '4/20 ~ 5/16',
      target: 'SDGs 문제에 관심있는 학생\n해커톤에 나가보고 싶은 누구나'
    }
  },
  {
    logo: inhalogo,
    title: '스타트업 비즈니스 솔루션 콘테스트',
    statusLabel: '진행중',
    statusColor: '#FBBC04',
    eventType: '연합행사',
    eventTypeColor: '#4089E2', 
    description: '스타트업에 적합한 새로운 아이디어를 가지고 경쟁하는 행사',
    isHidden: true,
    details: {
      purpose: '스타트업들의 다양한 문제를 해결하는 솔루션 개발',
      schedule: '5/1~5/31 / 오프라인',
      target: '비즈니스 솔루션 개발에 관심있는 학생\n솔루션 개발 경험이 있는 학생\n창업에 관심이 있는 학생'
    }
  },
  {
    logo: inhalogo,
    title: 'Google I/O Extended',
    statusLabel: '준비중',
    statusColor: '#4089E2',
    eventType: '외부행사',
    eventTypeColor: '#4089E2',
    description: 'Google I/O Extended 행사',
    isHidden: true,
    details: {
      purpose: 'Google I/O Extended 행사',
      schedule: '7/25 10:00~18:00 / 오프라인',
      target: 'Google I/O에 관심있는 누구나'
    }
  },
]; 