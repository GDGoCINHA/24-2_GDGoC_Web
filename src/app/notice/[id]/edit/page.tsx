import { NoticeFormView } from '@/components/notice/NoticeFormView'

// mock 시드는 47개지만, 사용자가 dev에서 새로 작성하는 글도 수정 가능하도록 여유분 포함.
// mock generateId가 n-0048, n-0049... 순차 발급하므로 200까지 미리 등록.
// 백엔드 연동 후엔 실제 ID 목록 페치 방식으로 교체 필요.
const STATIC_PARAM_COUNT = 200

export function generateStaticParams() {
  return Array.from({ length: STATIC_PARAM_COUNT }, (_, i) => ({
    id: `n-${String(i + 1).padStart(4, '0')}`
  }))
}

export default async function NoticeEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <NoticeFormView mode="edit" id={id} />
}
