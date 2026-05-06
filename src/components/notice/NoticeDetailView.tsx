'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { NoticeAttachmentList } from '@/components/notice/NoticeAttachmentList'
import { NoticeContent } from '@/components/notice/NoticeContent'
import { NoticeDetailHeader } from '@/components/notice/NoticeDetailHeader'
import { NoticeNeighborNav } from '@/components/notice/NoticeNeighborNav'
import { NoticeSearchBar } from '@/components/notice/NoticeSearchBar'
import type { NoticeSearchField } from '@/services/notice/noticeApi'
import { useNoticeDetail } from '@/services/notice/useNoticeDetail'
import { useNoticeMutations } from '@/services/notice/useNoticeMutations'
import { useNoticeNeighbors } from '@/services/notice/useNoticeNeighbors'

export interface NoticeDetailViewProps {
  id: string
  /** 관리자 모드: 제목 바에 더보기 메뉴(수정/삭제) 노출 */
  adminMode?: boolean
}

export const NoticeDetailView = ({ id, adminMode = false }: NoticeDetailViewProps) => {
  const router = useRouter()
  const { data: notice, loading, error } = useNoticeDetail(id)
  const { data: neighbors } = useNoticeNeighbors(id)
  const { remove, pending: removing } = useNoticeMutations()

  const handleSearchSubmit = (query: string, field: NoticeSearchField) => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (field !== 'title_content') params.set('field', field)
    const qs = params.toString()
    router.push(`/notice${qs ? `?${qs}` : ''}`)
  }

  const adminActions = adminMode
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
    <main className="bg-black text-white">
      <div className="mx-auto w-[1280px] px-[80px] pt-14 pb-[120px]">
        <h1 className="typo-h4 text-white">공지사항</h1>

        {loading && (
          <p className="mt-12 py-12 text-center typo-b3 text-gray-700">불러오는 중...</p>
        )}
        {error && (
          <p className="mt-12 py-12 text-center typo-b3 text-red">{error.message}</p>
        )}

        {notice && !loading && (
          <>
            <div className="mt-6">
              <NoticeDetailHeader
                notice={notice}
                onBack={() => router.push('/notice')}
                adminActions={adminActions}
              />
            </div>

            <div className="mt-8 flex flex-col gap-16">
              <NoticeContent notice={notice} />
              <NoticeAttachmentList attachments={notice.attachments} />

              <div className="flex w-full flex-col items-end gap-6">
                <Link
                  href="/notice"
                  className="inline-flex items-center rounded-full bg-red px-6 py-2 typo-b3 text-white transition-opacity hover:opacity-90"
                >
                  목록
                </Link>
                <div className="flex w-full flex-col items-center gap-6">
                  <NoticeNeighborNav
                    prev={neighbors?.prev ?? null}
                    next={neighbors?.next ?? null}
                  />
                  <NoticeSearchBar onSubmit={handleSearchSubmit} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
