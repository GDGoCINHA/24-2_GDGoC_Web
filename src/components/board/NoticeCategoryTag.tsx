import { NOTICE_CATEGORY_LABEL, type NoticeCategory } from '@/types/notice'

/**
 * 색은 Tailwind 클래스 리터럴로 적어야 스캐너가 찾는다. 값을 조립하면 빌드에서 빠진다.
 * 배경 투명도가 카테고리마다 다른 것은 원색의 밝기 차이를 맞추려는 것이다.
 */
const CATEGORY_CLASS: Record<NoticeCategory, string> = {
  RECRUIT: 'bg-[rgba(208,129,85,0.18)] text-ember',
  OPERATION: 'bg-[rgba(126,150,200,0.20)] text-tag-info',
  SCHEDULE: 'bg-[rgba(134,192,143,0.20)] text-signal-ok',
  ETC: 'bg-[rgba(240,234,228,0.10)] text-dusk-ink-500'
}

export interface NoticeCategoryTagProps {
  category: NoticeCategory
}

export function NoticeCategoryTag({ category }: NoticeCategoryTagProps) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-[3px] text-xs ${CATEGORY_CLASS[category]}`}
    >
      {NOTICE_CATEGORY_LABEL[category]}
    </span>
  )
}
