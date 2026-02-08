'use client';

import buildwithai from '@public/images/activity/buildwithai.png';
import seminar from '@public/images/activity/seminar.jpg';
import conf from '@public/images/activity/conf.jpg';

// 카테고리: notice | event | project
// 상태: ongoing | closed
export const notices = [
  {
    id: 'n-1',
    title: 'GDGoC INHA에서 진행중인 프로젝트 둘러보기',
    summary: '현재 진행 중인 웹/앱 프로젝트를 한눈에 확인하고 팀에 합류하세요.',
    category: 'notice',
    status: 'ongoing',
    image: buildwithai,
    tags: ['공지'],
    details: {
      period: '상시',
      recruitment: '-',
      schedule: '-',
      location: '-',
      link: '-'
    }
  },
  {
    id: 'n-2',
    title: 'GDGoC 25-2 신입 멤버 모집: 배우고, 만들고, 함께 성장해요! 🚀',
    summary: '인하대학교 유일의 Google 공식 IT 커뮤니티에서 새로운 멤버를 모집합니다.',
    category: 'notice',
    status: 'ongoing',
    image: buildwithai,
    tags: ['공지'],
    md: `인하대학교 유일의 Google 공식 IT 커뮤니티, **GDGoC INHA**에서 새로운 멤버를 모집합니다!\n\n개발 공부만으로는 뭔가 부족하다고 느끼셨나요?\nGDGoC에서는 **스터디로 배우고 → 프로젝트로 직접 만들고 → 해커톤과 연합 활동으로 성장**하는 경험까지, 한 학기 동안 차곡차곡 쌓아갈 수 있습니다.\n\n---\n\n## 🏷️ 우리가 함께하는 활동들\n\n### 1. 기초부터 차근차근, 정규 스터디 📚\n처음이라도 괜찮습니다. Python, 데이터 분석, AI, UX/UI 등 다양한 주제를 다루며, 팀원들과 같이 배우고 토론합니다.\n- 학기 중 두 차례 진행\n- 인프런 강의 지원 + 협력 학습\n\n### 2. 배운 걸 직접 활용하는 포트폴리오 프로젝트 💻\n한 학기 동안 팀을 이루어 **아이디어 기획 → 개발 → 배포 → 발표**까지!\n실제 서비스 개발 과정을 경험하며, **내 손으로 만든 결과물**을 남길 수 있습니다.\n\n### 3. 도전으로 성장하는 해커톤 🚀\n다양한 분야의 사람들과 짧은 시간에 함께 몰입해 아이디어를 구현하며 성장합니다.\n- DevSprint: 구글 스프린트 방식을 적용한 집중 개발 프로젝트\n- 글로벌/연합 해커톤: Solution Challenge, GreenTech Globalthon 등\n- 스타트업 비즈니스 솔루션 콘테스트: 개발자뿐 아니라 **창업·비즈니스·데이터**에 관심 있는 사람들이 함께 참여해, 문제 해결과 **사업화 아이디어**를 함께 만들어가는 특별한 기회\n\n---\n\n## 🏷️ GDGoC INHA만의 강점\n\n- ✅ **다양한 연합 네트워킹** – 인천내 대학 연합 ‘뭉(Moong)’, 타 GDGoC 지부, AIESEC·아이바스 등과의 협업으로 더 넓은 무대에서 사람들과 연결!\n- ✅ **내부 성장 프로그램** – 정규 스터디, 포트폴리오 프로젝트, 해커톤으로 실력+협업+커뮤니티 활동까지 한 번에!\n- ✅ **든든한 커뮤니티** – MT, e스포츠 대회, 한강 나들이, 크리스마스파티 등 다양한 친목 활동으로 언제든 함께할 동료!\n\n---\n\n## 🏷️ 우리는 이런 분을 기다립니다!\n\n- 개발자 혹은 개발에 관심 있는 분\n- 서비스 기획, UX/UI 디자인, 마케팅 등 다양한 분야에서 함께할 분 *(전공 무관, 이미 40여개 학과가 활동 중)*\n- 앞으로의 프로젝트에서 함께할 든든한 팀원을 찾고 싶은 분\n- 혼자보다는 함께 성장하고 싶은 분\n- 다양한 사람들과 네트워킹하며 시너지를 내고 싶은 분\n\n> ⭐ **Core Member(운영진) 모집**도 곧 시작됩니다. 관심 있는 분들은 눈여겨봐주세요!\n\n---\n\n## 📍 모집 정보\n- **집중 모집 기간**: 2025.08.29(금) ~ 2025.09.15(월)\n- **모집 링크**: https://gdgocinha.com/recruit\n- **개강 총회**: 2025.09.16(화) ✨필참✨\n- **동아리 방**: 5동 021\n\n### 문의\n- 회장: 박우찬 010-2087-1816\n- 부회장: 김정훈 010-4540-1432\n- 부회장: 최준빈 010-4252-8910\n\n- 인스타그램: @gdgoc.inha\n- 오픈채팅방 문의: https://open.kakao.com/o/sJCx9HNh\n- 더 알아보기: https://info.gdgocinha.com\n`,
    details: {
      period: '2025.08.29 ~ 2025.09.15',
      recruitment: '학부 재학생 누구나',
      schedule: '개강 총회 2025.09.16(화)',
      location: '인하대학교 5동 021',
      link: 'https://gdgocinha.com/recruit'
    }
  },
  {
    id: 'e-1',
    title: '정기 세미나 안내',
    summary: 'AI/웹 개발 주제로 진행하는 내부 세미나에 참여하세요.',
    category: 'event',
    status: 'ongoing',
    image: seminar,
    tags: ['행사'],
    details: {
      period: '2025.09.20',
      recruitment: '선착순 50명',
      schedule: '토 14:00~17:00',
      location: '인하대학교',
      link: 'https://forms.gle/'
    }
  },
  {
    id: 'p-1',
    title: '하우미 프로젝트',
    summary: '1인 가구를 위한 AI 인테리어 스타일링 서비스',
    category: 'project',
    status: 'closed',
    image: conf,
    tags: ['프로젝트'],
    details: {
      period: '2025.06 ~ 진행중',
      recruitment: '디자이너 1, FE 1',
      schedule: '주 1회',
      location: '인하대학교',
      link: '-'
    }
  }
];

export const NOTICE_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'notice', label: '공지' },
  { key: 'event', label: '행사' },
  { key: 'project', label: '프로젝트' },
];

export const NOTICE_STATUSES = [
  { key: 'all', label: '전체' },
  { key: 'ongoing', label: '진행중' },
  { key: 'closed', label: '종료' },
];


