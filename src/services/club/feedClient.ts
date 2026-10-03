import type { AxiosInstance } from 'axios'

import type { ClubFeedItem, ClubPostCategory } from '@/types/club'
import type { PageMeta, PagedResult } from '@/utils/api/unwrapPaged'

/**
 * 소모임 B 담당 API — 팀 게시글·팀 피드·전체 활동 피드. 서버 `ClubFeedController`·`ClubPostController`.
 *
 * 목록은 data 가 배열이고 페이지 정보는 meta 에 있다(소모임 목록과 같은 형태) — unwrapPaged 를 쓰지 않는다.
 */
const unwrapOnce = <T>(payload: unknown): T => (payload as { data: T }).data

const unwrapList = <T>(payload: unknown): PagedResult<T> => {
  const body = payload as { data: T[]; meta: PageMeta }
  return { items: body.data, meta: body.meta }
}

/** 게시글 사진용 S3 키. 서버 `S3KeyType.clubPost`. */
export const POST_IMAGE_S3_KEY = 'clubPost'

export const FEED_PAGE_SIZE = 20

export interface ClubPostPayload {
  category: ClubPostCategory
  content: string
  imageUrls: string[]
}

/** 한 소모임의 타임라인 — 게시글과 활동 기록을 올라온 시각 최신순으로 섞는다. */
export const fetchTeamFeed = async (
  apiClient: AxiosInstance,
  clubId: number,
  page: number
): Promise<PagedResult<ClubFeedItem>> =>
  unwrapList<ClubFeedItem>(
    (await apiClient.get(`/clubs/${clubId}/feed`, { params: { page, size: FEED_PAGE_SIZE } })).data
  )

/** 모든 소모임의 활동 기록. 숨김 소모임은 빠진다. */
export const fetchGlobalFeed = async (
  apiClient: AxiosInstance,
  page: number
): Promise<PagedResult<ClubFeedItem>> =>
  unwrapList<ClubFeedItem>(
    (await apiClient.get('/club-feed', { params: { page, size: FEED_PAGE_SIZE } })).data
  )

export const createPost = async (
  apiClient: AxiosInstance,
  clubId: number,
  payload: ClubPostPayload
): Promise<number> =>
  unwrapOnce<number>((await apiClient.post(`/clubs/${clubId}/posts`, payload)).data)

export const updatePost = async (
  apiClient: AxiosInstance,
  clubId: number,
  postId: number,
  payload: ClubPostPayload
): Promise<void> => {
  await apiClient.patch(`/clubs/${clubId}/posts/${postId}`, payload)
}

export const deletePost = async (
  apiClient: AxiosInstance,
  clubId: number,
  postId: number
): Promise<void> => {
  await apiClient.delete(`/clubs/${clubId}/posts/${postId}`)
}
