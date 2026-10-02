/**
 * 소모임 화면용 임시 데이터. API 가 붙으면 화면별로 지운다.
 *
 * 디자인 확정본(소모임 화면 디자인 아티팩트)과 같은 값이다.
 */
import type {
  ClubCompletion,
  ClubDetail,
  ClubFeedItem,
  ClubMember,
  ClubSchedule,
  ClubSummary,
  ClubWarning
} from '@/types/club'

export const MOCK_CLUBS: ClubSummary[] = [
  {
    id: 1,
    name: '알고리즘 스터디',
    category: 'STUDY',
    summary: '백준 골드 이상을 목표로 매주 문제를 풀고 서로 풀이를 설명해요',
    imageUrl: null,
    leaderName: '한서준',
    memberCount: 6,
    capacity: 8,
    recruitStatus: 'RECRUITING'
  },
  {
    id: 2,
    name: '주말 러닝 크루',
    category: 'HOBBY',
    summary: '토요일 아침 인하대 후문에서 5km를 함께 달려요',
    imageUrl: null,
    leaderName: '이도윤',
    memberCount: 9,
    capacity: 12,
    recruitStatus: 'RECRUITING'
  },
  {
    id: 3,
    name: '프론트엔드 취준반',
    category: 'CAREER',
    summary: '포트폴리오 리뷰와 모의 면접을 번갈아 진행해요',
    imageUrl: null,
    leaderName: '박지아',
    memberCount: 5,
    capacity: 6,
    recruitStatus: 'RECRUITING'
  },
  {
    id: 4,
    name: 'AI 논문 읽기',
    category: 'STUDY',
    summary: '매주 논문 한 편을 정해 발제하고 토론해요',
    imageUrl: null,
    leaderName: '최민준',
    memberCount: 4,
    capacity: 8,
    recruitStatus: 'CLOSED'
  },
  {
    id: 5,
    name: '보드게임 모임',
    category: 'HOBBY',
    summary: '전략 보드게임을 중심으로 격주 금요일에 모여요',
    imageUrl: null,
    leaderName: '정하린',
    memberCount: 7,
    capacity: 10,
    recruitStatus: 'RECRUITING'
  },
  {
    id: 6,
    name: '사진 산책',
    category: 'ETC',
    summary: '캠퍼스 근처를 걸으며 사진을 찍고 서로 보정 팁을 나눠요',
    imageUrl: null,
    leaderName: '윤서아',
    memberCount: 4,
    capacity: 6,
    recruitStatus: 'CLOSED'
  }
]

export const MOCK_MY_CLUBS = [
  {
    club: MOCK_CLUBS[0],
    isLeader: true,
    next: '다음 모임 · 10월 7일 (화) 19:00 · 하이테크 314호',
    week: '이번 주 활동 완료'
  },
  {
    club: MOCK_CLUBS[1],
    isLeader: false,
    next: '다음 모임 · 10월 4일 (토) 08:00 · 후문',
    week: '이번 주 활동 전'
  }
]

export const MOCK_GLOBAL_FEED = [
  {
    clubId: 1,
    club: '알고리즘 스터디',
    date: '10월 2일',
    text: '그리디 문제 4개를 풀고 각자 풀이를 발표했어요. 다음 주는 DP!',
    attended: '5/6',
    likes: 8,
    comments: 2,
    photos: 4
  },
  {
    clubId: 2,
    club: '주말 러닝 크루',
    date: '9월 27일',
    text: '비가 그친 덕에 5km 완주. 다음에는 인천대공원 코스를 가봐요.',
    attended: '8/9',
    likes: 14,
    comments: 5,
    photos: 7
  },
  {
    clubId: 5,
    club: '보드게임 모임',
    date: '9월 26일',
    text: '테라포밍 마스 첫 판. 규칙 설명만 40분 걸렸지만 다들 재밌어했어요.',
    attended: '6/7',
    likes: 11,
    comments: 3,
    photos: 3
  },
  {
    clubId: 3,
    club: '프론트엔드 취준반',
    date: '9월 25일',
    text: '포트폴리오 리뷰 3명 진행. 피드백 정리는 팀 피드 자료 글에 있어요.',
    attended: '5/5',
    likes: 6,
    comments: 1,
    photos: 2
  }
]

export const MOCK_CLUB_DETAIL: ClubDetail = {
  ...MOCK_CLUBS[0],
  description:
    '알고리즘 실력을 꾸준히 올리고 싶은 사람들의 모임이에요. 혼자 하면 흐지부지되는 문제 풀이를 매주 같이 하면서, 서로의 풀이를 설명하는 연습까지 합니다.',
  activityMethod:
    '매주 화요일 저녁 오프라인 모임. 주제별 문제 4개를 미리 풀어 오고, 모임에서는 돌아가며 풀이를 발표해요.',
  startDate: '2026-09-01',
  endDate: '2026-11-09',
  kakaoLink: 'https://open.kakao.com/',
  myMembership: { status: 'ACTIVE', isLeader: true }
}

export const MOCK_MEMBERS: ClubMember[] = [
  { userId: 1, name: '한서준', isLeader: true, joinedAt: '개설' },
  { userId: 2, name: '이도윤', isLeader: false, joinedAt: '9월 1일 합류' },
  { userId: 3, name: '박지아', isLeader: false, joinedAt: '9월 1일 합류' },
  { userId: 4, name: '최민준', isLeader: false, joinedAt: '9월 2일 합류' },
  { userId: 5, name: '정하린', isLeader: false, joinedAt: '9월 3일 합류' },
  { userId: 6, name: '윤서아', isLeader: false, joinedAt: '9월 24일 합류' }
]

export const MOCK_FEED: ClubFeedItem[] = [
  {
    type: 'ACTIVITY',
    id: 11,
    activityDate: '10월 2일 (목)',
    status: 'APPROVED',
    photoUrls: [],
    attendedCount: 5,
    rosterCount: 6,
    requiredCount: 3,
    content:
      '그리디 문제 4개를 풀고 각자 풀이를 발표했어요. 회의실 예약은 다음 주도 314호로 잡아 뒀습니다.',
    attendeeNames: ['한서준', '이도윤', '박지아', '최민준', '정하린'],
    revisionReason: null,
    likeCount: 8,
    commentCount: 2
  },
  {
    type: 'POST',
    id: 21,
    category: 'RESOURCE',
    authorName: '박지아',
    createdAt: '10월 2일',
    likeCount: 4,
    commentCount: 0,
    content:
      '오늘 푼 그리디 4문제 풀이 정리했어요. 3번은 정렬 기준을 끝나는 시간으로 잡는 게 핵심입니다.'
  },
  {
    type: 'ACTIVITY',
    id: 12,
    activityDate: '9월 25일 (목)',
    status: 'PENDING',
    photoUrls: [],
    attendedCount: 4,
    rosterCount: 6,
    requiredCount: 3,
    content: 'DP 입문 — 계단 오르기, 1로 만들기를 같이 풀고 점화식 세우는 법을 정리했어요.',
    attendeeNames: ['한서준', '이도윤', '박지아', '최민준'],
    revisionReason: null,
    likeCount: 3,
    commentCount: 0
  }
]

export const MOCK_COMMENTS = [
  { author: '이도윤', content: '3번 풀이 코드 피드에 올려주실 수 있나요?' },
  { author: '박지아', content: '자료 탭에 올렸어요!' }
]

export const MOCK_SCHEDULES: ClubSchedule[] = [
  {
    id: 1,
    title: 'DP 기초 — 배낭 문제',
    startsAt: '10월 7일 (화) 19:00',
    location: '하이테크관 314호',
    onlineLink: null,
    attendCount: 4,
    absentCount: 1,
    noResponseCount: 1,
    myResponse: 'ATTEND'
  },
  {
    id: 2,
    title: '모의 코딩테스트',
    startsAt: '10월 11일 (토) 14:00',
    location: null,
    onlineLink: 'https://meet.google.com/',
    attendCount: 2,
    absentCount: 0,
    noResponseCount: 4,
    myResponse: null
  }
]

export const MOCK_MY_ATTENDANCE = [
  { date: '10월 2일 (목)', attended: true, locked: true },
  { date: '9월 25일 (목)', attended: false, locked: false },
  { date: '9월 16일 (화)', attended: true, locked: true },
  { date: '9월 9일 (화)', attended: true, locked: true }
]

export const MOCK_COMPLETION: ClubCompletion = {
  goal: '기수 안에 전원 백준 골드 4 달성',
  goalCriteria: '마지막 주 solved.ac 티어 캡처를 증빙으로 제출',
  goalResult: null,
  goalStatus: 'NOT_SUBMITTED',
  memberCount: 6,
  completionStatus: 'IN_PROGRESS',
  warnings: [],
  weeks: [
    { weekStart: '09.01', state: 'REST', countedActivities: 0 },
    { weekStart: '09.08', state: 'SATISFIED', countedActivities: 1 },
    { weekStart: '09.15', state: 'SATISFIED', countedActivities: 1 },
    { weekStart: '09.22', state: 'PENDING_REVIEW', countedActivities: 0 },
    { weekStart: '09.29', state: 'CURRENT', countedActivities: 1 },
    { weekStart: '10.06', state: 'UPCOMING', countedActivities: 0 },
    { weekStart: '10.13', state: 'UPCOMING', countedActivities: 0 },
    { weekStart: '10.20', state: 'UPCOMING', countedActivities: 0 },
    { weekStart: '10.27', state: 'UPCOMING', countedActivities: 0 },
    { weekStart: '11.03', state: 'UPCOMING', countedActivities: 0 }
  ]
}

export const MOCK_PENDING_APPLICANTS = [
  {
    id: 1,
    name: '김태윤',
    meta: '컴퓨터공학과 · 9월 30일 신청',
    message: '실버 2인데 골드 목표로 같이 하고 싶어요!'
  },
  {
    id: 2,
    name: '오지호',
    meta: '정보통신공학과 · 10월 1일 신청',
    message: '수요조사에 알고리즘 적었던 사람입니다.'
  }
]

export const MOCK_FIX_REQUESTS = [
  {
    id: 1,
    name: '윤서아',
    target: '9월 25일 모임 · 결석 → 출석',
    reason: '늦게 도착해서 체크가 빠진 것 같아요'
  }
]

export const MOCK_ROSTER = [
  { userId: 1, name: '한서준', attended: true, qr: true, isLeader: true },
  { userId: 2, name: '이도윤', attended: true, qr: true, isLeader: false },
  { userId: 3, name: '박지아', attended: true, qr: true, isLeader: false },
  { userId: 4, name: '최민준', attended: true, qr: false, isLeader: false },
  { userId: 5, name: '정하린', attended: true, qr: false, isLeader: false },
  { userId: 6, name: '윤서아', attended: false, qr: false, isLeader: false }
]

/* ---------- 운영진 ---------- */

export interface AdminClubRow {
  id: number
  name: string
  leader: string
  period: string
  members: string
  satisfiedWeeks: number
  targetWeeks: number
  restWeeks: number
  goal: string
  pendingReviews: number
  warnings: ClubWarning[]
  completion: string
}

export const MOCK_ADMIN_CLUBS: AdminClubRow[] = [
  {
    id: 1,
    name: '알고리즘 스터디',
    leader: '한서준',
    period: '09.01 – 11.09',
    members: '6 / 8',
    satisfiedWeeks: 4,
    targetWeeks: 4,
    restWeeks: 1,
    goal: '등록',
    pendingReviews: 1,
    warnings: [],
    completion: '진행 중'
  },
  {
    id: 2,
    name: '주말 러닝 크루',
    leader: '이도윤',
    period: '09.01 – 11.30',
    members: '9 / 12',
    satisfiedWeeks: 5,
    targetWeeks: 5,
    restWeeks: 0,
    goal: '등록',
    pendingReviews: 2,
    warnings: [],
    completion: '진행 중'
  },
  {
    id: 4,
    name: 'AI 논문 읽기',
    leader: '최민준',
    period: '09.08 – 11.23',
    members: '3 / 8',
    satisfiedWeeks: 2,
    targetWeeks: 4,
    restWeeks: 0,
    goal: '미등록',
    pendingReviews: 0,
    warnings: ['MEMBERS_UNDER_4', 'WEEK_MISSED', 'GOAL_NOT_SET'],
    completion: '진행 중'
  },
  {
    id: 3,
    name: '프론트엔드 취준반',
    leader: '박지아',
    period: '09.01 – 10.26',
    members: '5 / 6',
    satisfiedWeeks: 6,
    targetWeeks: 7,
    restWeeks: 1,
    goal: '등록',
    pendingReviews: 3,
    warnings: ['WEEK_MISSED'],
    completion: '진행 중'
  },
  {
    id: 6,
    name: '사진 산책',
    leader: '윤서아',
    period: '미설정',
    members: '4 / 6',
    satisfiedWeeks: 0,
    targetWeeks: 0,
    restWeeks: 0,
    goal: '미등록',
    pendingReviews: 1,
    warnings: ['PERIOD_NOT_SET', 'GOAL_NOT_SET'],
    completion: '진행 중'
  },
  {
    id: 5,
    name: '보드게임 모임',
    leader: '정하린',
    period: '09.05 – 12.12',
    members: '11 / 10',
    satisfiedWeeks: 4,
    targetWeeks: 4,
    restWeeks: 0,
    goal: '등록',
    pendingReviews: 0,
    warnings: ['OVER_CAPACITY'],
    completion: '진행 중'
  }
]

export const MOCK_REVIEW_QUEUE = [
  {
    id: 12,
    club: '알고리즘 스터디',
    date: '9월 25일 (목)',
    attended: 4,
    roster: 6,
    required: 3,
    resubmitted: false,
    text: 'DP 입문 — 계단 오르기, 1로 만들기를 같이 풀고 점화식 세우는 법을 정리했어요.',
    on: ['한서준', '이도윤', '박지아', '최민준'],
    off: ['정하린', '윤서아']
  },
  {
    id: 31,
    club: '주말 러닝 크루',
    date: '9월 27일 (토)',
    attended: 8,
    roster: 9,
    required: 5,
    resubmitted: false,
    text: '후문 출발 5km. 비가 그쳐서 전원 완주했어요.',
    on: ['이도윤', '김가람', '나다은', '류재원', '문소율', '배시우', '서하준', '안채원'],
    off: ['오태민']
  },
  {
    id: 41,
    club: '프론트엔드 취준반',
    date: '9월 24일 (수)',
    attended: 2,
    roster: 5,
    required: 3,
    resubmitted: true,
    text: '포트폴리오 리뷰 2명 진행. 나머지는 다음 주로 미뤘어요.',
    on: ['박지아', '장유나'],
    off: ['조은호', '차민서', '한유진']
  }
]

export const MOCK_TEAM_WEEKS = [
  { date: '09.01', acts: '1회', state: 'SATISFIED' as const },
  { date: '09.08', acts: '2회', state: 'SATISFIED' as const },
  { date: '09.15', acts: '—', state: 'REST' as const },
  { date: '09.22', acts: '0회 (기록 1건 · 참석 미달)', state: 'MISSED' as const },
  { date: '09.29', acts: '1회', state: 'SATISFIED' as const },
  { date: '10.06', acts: '1회', state: 'SATISFIED' as const },
  { date: '10.13', acts: '1회', state: 'PENDING_REVIEW' as const },
  { date: '10.20', acts: '2회', state: 'SATISFIED' as const }
]

export const MOCK_OPEN_REQUESTS = [
  {
    id: 1,
    name: '클라이밍 크루',
    category: '취미',
    who: '배시우',
    goal: '목표: 전원 V3 완등. 매주 토요일 인하대 근처 클라이밍장에서 모여요.'
  },
  {
    id: 2,
    name: '정보처리기사 대비반',
    category: '취업 준비',
    who: '조은호',
    goal: '목표: 필기 전원 합격. 주 2회 기출 풀이.'
  }
]

export const MOCK_LEADER_GRANTS = [
  { userId: 1, name: '한서준', clubs: '알고리즘 스터디' },
  { userId: 2, name: '이도윤', clubs: '주말 러닝 크루' },
  { userId: 3, name: '박지아', clubs: '프론트엔드 취준반' },
  { userId: 4, name: '최민준', clubs: 'AI 논문 읽기' },
  { userId: 5, name: '정하린', clubs: '보드게임 모임 · 사진 산책' }
]
