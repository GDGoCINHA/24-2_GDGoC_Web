/**
 * 소모임 화면용 임시 데이터. API 가 붙으면 화면별로 지운다.
 *
 * 디자인 확정본(소모임 화면 디자인 아티팩트)과 같은 값이다.
 */
import type { ClubFeedItem, ClubSchedule } from '@/types/club'

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
