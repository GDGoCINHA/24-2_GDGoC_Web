'use client'

import Link from 'next/link'

type Screen = {
  label: string
  href: string
}

/**
 * 하위 화면 사이의 이동 줄. 자기가 속한 카테고리의 형제 화면만 노출한다 —
 * 아홉 개를 전부 늘어놓으면 그게 곧 허브가 되어 버린다.
 */
export default function AdminCategoryNav({
  category,
  current,
  siblings
}: {
  category: string
  current: string
  siblings: Screen[]
}) {
  return (
    <div data-admin-reveal className="mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 whitespace-nowrap text-[13px] text-admin-ink-dim">{category}</span>
      <span className="whitespace-nowrap rounded-full border border-admin-line-current px-3.5 py-1.5 text-[13px] text-admin-ink">
        {current}
      </span>
      {siblings.map((screen) => (
        <Link
          key={screen.href}
          href={screen.href}
          className="whitespace-nowrap rounded-full border border-admin-line px-3.5 py-1.5 text-[13px] text-admin-ink-muted transition-colors duration-[250ms] hover:border-admin-accent hover:text-admin-ink"
        >
          {screen.label}
        </Link>
      ))}
    </div>
  )
}
