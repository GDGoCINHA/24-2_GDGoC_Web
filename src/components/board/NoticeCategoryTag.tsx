import { GdgColorTag, type GdgTagColor } from '@/components/ui/design-system'
import { NOTICE_CATEGORY_LABEL, type NoticeCategory } from '@/types/notice'

const CATEGORY_COLOR: Record<NoticeCategory, GdgTagColor> = {
  OPERATION: 'blue',
  SCHEDULE: 'green',
  RECRUIT: 'red',
  ETC: 'white'
}

export interface NoticeCategoryTagProps {
  category: NoticeCategory
  size?: 'pc' | 'mobile' | 'mini'
}

export function NoticeCategoryTag({ category, size = 'mini' }: NoticeCategoryTagProps) {
  return (
    <GdgColorTag size={size} color={CATEGORY_COLOR[category]} fill="half">
      {NOTICE_CATEGORY_LABEL[category]}
    </GdgColorTag>
  )
}
