import { NoticeDetailView } from '@/components/notice/NoticeDetailView'

// mock 시드 47개와 일치 — 백엔드 연동 후엔 실제 ID 목록 페치 방식으로 교체 필요
const MOCK_NOTICE_COUNT = 47

export function generateStaticParams() {
  return Array.from({ length: MOCK_NOTICE_COUNT }, (_, i) => ({
    id: `n-${String(i + 1).padStart(4, '0')}`
  }))
}

export default async function NoticeDetailAdminPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <NoticeDetailView id={id} adminMode />
}
