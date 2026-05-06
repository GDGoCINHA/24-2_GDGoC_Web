import { NOTICE_PIN_LIMIT_ERROR_NAME } from '@/constant/notice'

// ===== Domain Types =====

export const NOTICE_CATEGORIES = ['OPERATION', 'SCHEDULE', 'RECRUITMENT', 'ETC'] as const
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number]

export const NOTICE_STATUSES = ['PUBLISHED', 'IN_PROGRESS', 'CLOSED', 'DRAFT'] as const
export type NoticeStatus = (typeof NOTICE_STATUSES)[number]

export const NOTICE_VISIBILITIES = ['PUBLIC', 'PRIVATE'] as const
export type NoticeVisibility = (typeof NOTICE_VISIBILITIES)[number]

export const NOTICE_SEARCH_FIELDS = ['title_content', 'title', 'content', 'author'] as const
export type NoticeSearchField = (typeof NOTICE_SEARCH_FIELDS)[number]

export interface NoticeAuthor {
  id: string
  name: string
  team?: string
}

export interface NoticeAttachment {
  id: string
  kind: 'file' | 'link'
  name: string
  url: string
  sizeBytes?: number
}

export interface Notice {
  id: string
  category: NoticeCategory
  title: string
  content: string
  author: NoticeAuthor
  createdAt: string
  updatedAt: string
  viewCount: number
  isPinned: boolean
  pinOrder?: 1 | 2 | 3
  visibility: NoticeVisibility
  status: NoticeStatus
  attachments: NoticeAttachment[]
}

export interface NoticeListParams {
  category?: NoticeCategory
  query?: string
  searchField?: NoticeSearchField
  page?: number
  pageSize?: number
}

export interface NoticeListResponse {
  items: Notice[]
  pinned: Notice[]
  total: number
  page: number
  pageSize: number
}

export type NoticeNeighborItem = Pick<
  Notice,
  'id' | 'title' | 'category' | 'createdAt' | 'author' | 'viewCount'
>

export interface NoticeNeighbors {
  prev: NoticeNeighborItem | null
  next: NoticeNeighborItem | null
}

export type NoticeAttachmentInput =
  | { kind: 'file'; name: string; url: string; sizeBytes: number }
  | { kind: 'link'; name: string; url: string }

export interface NoticeCreateInput {
  category: NoticeCategory
  title: string
  content: string
  visibility: NoticeVisibility
  isPinned: boolean
  attachments: NoticeAttachmentInput[]
}

export type NoticeUpdateInput = Partial<NoticeCreateInput>

export interface NoticeDraft extends NoticeCreateInput {
  draftId: string
  savedAt: string
}

// ===== Error Helpers =====

// 핀 한도 초과 에러는 mock과 실 API가 같은 name 으로 throw → UI 단일 분기
export const isNoticePinLimitError = (e: unknown): boolean =>
  e instanceof Error && e.name === NOTICE_PIN_LIMIT_ERROR_NAME

// ===== Mock-first Toggle =====
//
// 우선순위:
//  1. NEXT_PUBLIC_NOTICE_USE_MOCK 가 명시되면 그 값을 따름
//  2. 미명시 시 NEXT_PUBLIC_APP_ENV !== 'production' 일 때만 mock 사용
//
// 이렇게 두면 master 배포(NEXT_PUBLIC_APP_ENV=production)에서는 자동으로
// mock=off → realApiNotImplemented가 throw → 백엔드 미연동 상태로 prod 배포되는
// 사고를 막아준다. develop/dev 배포·로컬에선 명시 없어도 mock=on.
const USE_MOCK: boolean = (() => {
  const explicit = process.env.NEXT_PUBLIC_NOTICE_USE_MOCK
  if (explicit === 'true') return true
  if (explicit === 'false') return false
  return process.env.NEXT_PUBLIC_APP_ENV !== 'production'
})()

const realApiNotImplemented = (op: string): never => {
  throw new Error(
    `[noticeApi] ${op} 실 API 미구현. 백엔드 연동 PR이 머지되어야 동작합니다.`
  )
}

// dynamic import 로 mock 모듈을 lazy 로딩 → USE_MOCK=false 일 때
// production 번들에서 mock 코드(시드 47건 포함) 완전 제거됨.
const loadMock = () => import('@/mock/noticeMock')

export const noticeApi = {
  list: async (params: NoticeListParams): Promise<NoticeListResponse> => {
    if (USE_MOCK) {
      const { mockList } = await loadMock()
      return mockList(params)
    }
    return realApiNotImplemented('list')
  },

  listPinned: async (): Promise<Notice[]> => {
    if (USE_MOCK) {
      const { mockListPinned } = await loadMock()
      return mockListPinned()
    }
    return realApiNotImplemented('listPinned')
  },

  detail: async (id: string): Promise<Notice> => {
    if (USE_MOCK) {
      const { mockDetail } = await loadMock()
      return mockDetail(id)
    }
    return realApiNotImplemented('detail')
  },

  neighbors: async (id: string): Promise<NoticeNeighbors> => {
    if (USE_MOCK) {
      const { mockNeighbors } = await loadMock()
      return mockNeighbors(id)
    }
    return realApiNotImplemented('neighbors')
  },

  create: async (
    input: NoticeCreateInput,
    authorOverride?: NoticeAuthor
  ): Promise<Notice> => {
    if (USE_MOCK) {
      const { mockCreate } = await loadMock()
      return mockCreate(input, authorOverride)
    }
    return realApiNotImplemented('create')
  },

  update: async (id: string, input: NoticeUpdateInput): Promise<Notice> => {
    if (USE_MOCK) {
      const { mockUpdate } = await loadMock()
      return mockUpdate(id, input)
    }
    return realApiNotImplemented('update')
  },

  remove: async (id: string): Promise<{ id: string }> => {
    if (USE_MOCK) {
      const { mockRemove } = await loadMock()
      return mockRemove(id)
    }
    return realApiNotImplemented('remove')
  }
}
