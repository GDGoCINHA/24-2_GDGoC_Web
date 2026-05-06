import {
  NOTICE_PAGE_SIZE,
  NOTICE_PIN_LIMIT,
  NOTICE_PIN_LIMIT_ERROR_NAME
} from '@/constant/notice'
import type {
  Notice,
  NoticeAttachment,
  NoticeAuthor,
  NoticeCategory,
  NoticeCreateInput,
  NoticeListParams,
  NoticeListResponse,
  NoticeNeighbors,
  NoticeSearchField,
  NoticeUpdateInput
} from '@/services/notice/noticeApi'

const SAMPLE_AUTHORS: Notice['author'][] = [
  { id: 'u-pr-1', name: '김디자인', team: 'PR_DESIGN' },
  { id: 'u-tech-1', name: '이코딩', team: 'TECH' },
  { id: 'u-hr-1', name: '박운영', team: 'HR' },
  { id: 'u-bd-1', name: '최기획', team: 'BD' },
  { id: 'u-hq-1', name: '정총무', team: 'HQ' }
]

const SAMPLE_TITLES: Record<NoticeCategory, string[]> = {
  OPERATION: [
    'GOAT(GDGoC Original Advanced Track) 운영 안내',
    '동아리 정기 회의 안내',
    '회비 납부 관련 공지',
    '운영진 인수인계 일정 공유',
    '동아리방 사용 규칙 업데이트'
  ],
  SCHEDULE: [
    '12월 정기 모임 일정 안내',
    '연말 송년회 일정 공지',
    '발표회 리허설 시간 변경',
    '주간 스터디 시간표',
    '신학기 OT 일정'
  ],
  RECRUITMENT: [
    '25-1학기 신입 부원 모집 시작',
    'GOAT 트랙 참가자 모집',
    '운영진 충원 모집 공고',
    '연합 해커톤 팀원 모집',
    '멘토 프로그램 멘토 모집'
  ],
  ETC: [
    '졸업생 송별회 후기',
    '연합 동아리 교류 안내',
    '동아리 굿즈 배포 안내',
    '인하대학교 학생증 갱신 알림',
    '기타 잡담 게시판 가이드'
  ]
}

const SAMPLE_CONTENT_TEMPLATE = (title: string, category: NoticeCategory) =>
  `## ${title}

GDGoC INHA에서는 2025-2학기 신입 부원을 모집합니다. 본 공지는 **${category}** 카테고리에 해당하며, 자세한 내용은 아래를 참고해 주세요.

- 모집 대상: 인하대학교 재학생 누구나
- 활동 방식: 매주 정기 모임 + 자율 스터디
- 신청 기한: 2026.01.20.까지

> 추가 문의는 운영진에게 DM 부탁드립니다.

---

자세한 내용은 [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSe9Wn4HVsTkqgIvWAMavnT8jXTYE3_RpjhJ5T7ldvkdKKwxx/viewform)을 참고해 주세요.
`

const baseDate = new Date('2026-01-15T09:00:00.000Z').getTime()

const buildAttachments = (idx: number): NoticeAttachment[] => {
  if (idx % 4 === 0) {
    return [
      { id: `att-${idx}-1`, kind: 'file', name: '운영안내.pdf', url: '#mock-pdf', sizeBytes: 245678 },
      { id: `att-${idx}-2`, kind: 'file', name: '활동사진.jpg', url: '#mock-jpg', sizeBytes: 1248560 },
      { id: `att-${idx}-3`, kind: 'link', name: 'https://gdgocinha.com', url: 'https://gdgocinha.com' }
    ]
  }
  if (idx % 3 === 0) {
    return [
      { id: `att-${idx}-1`, kind: 'file', name: '안내자료.pdf', url: '#mock-pdf', sizeBytes: 102400 }
    ]
  }
  return []
}

const buildNotice = (idx: number): Notice => {
  const category = (['OPERATION', 'SCHEDULE', 'RECRUITMENT', 'ETC'] as NoticeCategory[])[idx % 4]
  const titlePool = SAMPLE_TITLES[category]
  const title = `${titlePool[idx % titlePool.length]} (#${idx + 1})`
  const author = SAMPLE_AUTHORS[idx % SAMPLE_AUTHORS.length]
  const created = new Date(baseDate - idx * 24 * 60 * 60 * 1000).toISOString()
  const updated = new Date(baseDate - idx * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
  const isPinned = idx < 3
  return {
    id: `n-${String(idx + 1).padStart(4, '0')}`,
    category,
    title,
    content: SAMPLE_CONTENT_TEMPLATE(title, category),
    author,
    createdAt: created,
    updatedAt: updated,
    viewCount: 30 + ((idx * 7) % 250),
    isPinned,
    pinOrder: isPinned ? ((idx + 1) as 1 | 2 | 3) : undefined,
    visibility: idx % 11 === 0 ? 'PRIVATE' : 'PUBLIC',
    status: idx === 0 ? 'IN_PROGRESS' : idx === 1 ? 'CLOSED' : 'PUBLISHED',
    attachments: buildAttachments(idx)
  }
}

const SEED: Notice[] = Array.from({ length: 47 }, (_, idx) => buildNotice(idx))

const store = {
  notices: [...SEED]
}

const matchesQuery = (notice: Notice, query: string, field: NoticeSearchField): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  switch (field) {
    case 'title':
      return notice.title.toLowerCase().includes(q)
    case 'content':
      return notice.content.toLowerCase().includes(q)
    case 'author':
      return notice.author.name.toLowerCase().includes(q)
    case 'title_content':
    default:
      return (
        notice.title.toLowerCase().includes(q) || notice.content.toLowerCase().includes(q)
      )
  }
}

const sortNewestFirst = (a: Notice, b: Notice) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

const sortPinned = (a: Notice, b: Notice) => (a.pinOrder ?? 99) - (b.pinOrder ?? 99)

const delay = <T>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

// 깊은 복사로 store 참조 노출 차단 (호출자가 attachments 등을 mutate 해도 store 보호)
const cloneNotice = (n: Notice): Notice => ({
  ...n,
  author: { ...n.author },
  attachments: n.attachments.map((a) => ({ ...a }))
})

const countPinned = (): number => store.notices.filter((n) => n.isPinned).length

// 핀 한도 초과 에러 — name 으로 구분 (isNoticePinLimitError 와 매칭)
const throwPinLimitError = (): never => {
  const err = new Error(`상단 고정은 최대 ${NOTICE_PIN_LIMIT}개까지 가능합니다.`)
  err.name = NOTICE_PIN_LIMIT_ERROR_NAME
  throw err
}

export const mockList = (params: NoticeListParams): Promise<NoticeListResponse> => {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? NOTICE_PAGE_SIZE
  const filtered = store.notices.filter((notice) => {
    if (params.category && notice.category !== params.category) return false
    if (params.query && !matchesQuery(notice, params.query, params.searchField ?? 'title_content'))
      return false
    return true
  })

  const pinned = filtered.filter((n) => n.isPinned).sort(sortPinned)
  const regular = filtered.filter((n) => !n.isPinned).sort(sortNewestFirst)

  const start = (page - 1) * pageSize
  const items = regular.slice(start, start + pageSize)

  return delay({
    items: items.map(cloneNotice),
    pinned: pinned.map(cloneNotice),
    total: regular.length,
    page,
    pageSize
  })
}

export const mockDetail = async (id: string): Promise<Notice> => {
  const notice = store.notices.find((n) => n.id === id)
  if (!notice) {
    throw new Error(`공지사항을 찾을 수 없습니다: ${id}`)
  }
  notice.viewCount += 1
  return delay(cloneNotice(notice))
}

export const mockNeighbors = async (id: string): Promise<NoticeNeighbors> => {
  const sorted = [...store.notices].sort(sortNewestFirst)
  const idx = sorted.findIndex((n) => n.id === id)
  if (idx === -1) return delay({ prev: null, next: null })
  const pickFields = (n: Notice) => ({
    id: n.id,
    title: n.title,
    category: n.category,
    createdAt: n.createdAt,
    author: n.author,
    viewCount: n.viewCount
  })
  return delay({
    prev: idx + 1 < sorted.length ? pickFields(sorted[idx + 1]) : null,
    next: idx - 1 >= 0 ? pickFields(sorted[idx - 1]) : null
  })
}

const generateId = () => `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

const reorderPins = () => {
  const pinned = store.notices.filter((n) => n.isPinned).sort(sortNewestFirst)
  pinned.forEach((notice, idx) => {
    notice.pinOrder = (idx + 1) as 1 | 2 | 3
  })
  store.notices.forEach((n) => {
    if (!n.isPinned) n.pinOrder = undefined
  })
}

export const mockCreate = async (input: NoticeCreateInput, authorOverride?: NoticeAuthor) => {
  // 핀 한도 검증: 4개째 핀 시도 시 throw → UI 가 catch 해서 교체 모달 띄움
  if (input.isPinned && countPinned() >= NOTICE_PIN_LIMIT) {
    throwPinLimitError()
  }
  const now = new Date().toISOString()
  const notice: Notice = {
    id: generateId(),
    category: input.category,
    title: input.title,
    content: input.content,
    author: authorOverride ?? SAMPLE_AUTHORS[0],
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
    isPinned: input.isPinned,
    visibility: input.visibility,
    status: 'PUBLISHED',
    attachments: input.attachments.map((att, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      ...att
    }))
  }
  store.notices.unshift(notice)
  reorderPins()
  return delay(cloneNotice(notice))
}

export const mockUpdate = async (id: string, input: NoticeUpdateInput): Promise<Notice> => {
  const target = store.notices.find((n) => n.id === id)
  if (!target) throw new Error(`공지사항을 찾을 수 없습니다: ${id}`)
  // 핀 한도 검증: 핀 아니던 글을 핀으로 바꾸려는데 이미 한도라면 throw
  if (input.isPinned === true && !target.isPinned && countPinned() >= NOTICE_PIN_LIMIT) {
    throwPinLimitError()
  }
  if (input.category !== undefined) target.category = input.category
  if (input.title !== undefined) target.title = input.title
  if (input.content !== undefined) target.content = input.content
  if (input.visibility !== undefined) target.visibility = input.visibility
  if (input.isPinned !== undefined) target.isPinned = input.isPinned
  if (input.attachments !== undefined) {
    target.attachments = input.attachments.map((att, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      ...att
    }))
  }
  target.updatedAt = new Date().toISOString()
  reorderPins()
  return delay(cloneNotice(target))
}

export const mockRemove = async (id: string): Promise<{ id: string }> => {
  const idx = store.notices.findIndex((n) => n.id === id)
  if (idx === -1) throw new Error(`공지사항을 찾을 수 없습니다: ${id}`)
  store.notices.splice(idx, 1)
  reorderPins()
  return delay({ id })
}

export const mockListPinned = async (): Promise<Notice[]> =>
  delay(store.notices.filter((n) => n.isPinned).sort(sortPinned).map(cloneNotice))
