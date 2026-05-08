'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { NoticeAttachmentList } from '@/components/notice/NoticeAttachmentList'
import { NoticeContent } from '@/components/notice/NoticeContent'
import { NoticeDetailHeader } from '@/components/notice/NoticeDetailHeader'
import { NoticeNeighborNav } from '@/components/notice/NoticeNeighborNav'
import { NoticeSearchBar } from '@/components/notice/NoticeSearchBar'
import { useAuth } from '@/hooks/useAuth'
import type { NoticeSearchField } from '@/services/notice/noticeApi'
import { useNoticeDetail } from '@/services/notice/useNoticeDetail'
import { useNoticeMutations } from '@/services/notice/useNoticeMutations'
import { useNoticeNeighbors } from '@/services/notice/useNoticeNeighbors'

const CORE_PLUS_ROLES = new Set(['CORE', 'LEAD', 'ORGANIZER', 'ADMIN'])

export interface NoticeDetailViewProps {
  id: string
}

export const NoticeDetailView = ({ id }: NoticeDetailViewProps) => {
  const router = useRouter()
  const { user } = useAuth()
  const { data: notice, loading, error } = useNoticeDetail(id)
  const { data: neighbors } = useNoticeNeighbors(id)
  const { remove, pending: removing } = useNoticeMutations()

  // TEMP(관리자 플로우 확인용): 백엔드 .env 셋업 전 화면 확인을 위해 true 하드코딩.
  // PR/머지 전 반드시 아래 줄 복원할 것.
  // const isCorePlus = !!user?.userRole && CORE_PLUS_ROLES.has(user.userRole)
  const isCorePlus = true

  const handleSearchSubmit = (query: string, field: NoticeSearchField) => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (field !== 'title_content') params.set('field', field)
    const qs = params.toString()
    router.push(`/notice${qs ? `?${qs}` : ''}`)
  }

  const adminActions = isCorePlus
    ? {
        onEdit: () => router.push(`/notice/${id}/edit`),
        onDelete: async () => {
          if (removing) return
          if (!window.confirm('이 공지를 삭제하시겠습니까?')) return
          try {
            await remove(id)
            router.push('/notice')
          } catch (err) {
            window.alert(err instanceof Error ? err.message : '삭제 실패')
          }
        }
      }
    : undefined

  return (
    <main className="overflow-x-clip bg-black text-white">
      <div className="mx-auto w-full px-4 pt-8 pb-8 pc:w-[1280px] pc:px-[80px] pc:pt-14 pc:pb-[120px]">
        <h1 className="typo-pc-h4 text-white mobile:typo-m-h2">공지사항</h1>

        {loading && (
          <p className="mt-12 py-12 text-center typo-b3 text-gray-700">불러오는 중...</p>
        )}
        {error && (
          <p className="mt-12 py-12 text-center typo-b3 text-red">{error.message}</p>
        )}

        {notice && !loading && (
          <>
            <div className="mt-4 pc:mt-6">
              <NoticeDetailHeader
                notice={notice}
                onBack={() => router.back()}
                adminActions={adminActions}
              />
            </div>

            <div className="mt-6 flex flex-col gap-6 pc:mt-8 pc:gap-16">
              <NoticeContent notice={notice} />
              <NoticeAttachmentList attachments={notice.attachments} />

              {/* 하단: 목록 / 이전다음 / 검색바 — flat 구조, 검색바만 PC에서 self-center */}
              <div className="flex w-full flex-col items-end gap-4 pc:gap-6">
                <Link
                  href="/notice"
                  className="inline-flex items-center rounded-full bg-red px-4 py-1.5 typo-b3 text-white transition-opacity hover:opacity-90 pc:px-6 pc:py-2"
                >
                  목록
                </Link>
                <NoticeNeighborNav
                  prev={neighbors?.prev ?? null}
                  next={neighbors?.next ?? null}
                />
                <NoticeSearchBar
                  onSubmit={handleSearchSubmit}
                  className="pc:self-center"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
