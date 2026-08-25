import Image from 'next/image'
import Link from 'next/link'

import gdgocPcLogo from '@public/icons/gdgocIcon/pc.svg'

/**
 * 로고 + 2줄 워드마크.
 *
 * `GdgLogo variant="long"` 과 모양은 같지만 "Inha University" 가 파란색이 아니다.
 * 어두운 바탕에서 파란 글씨만 튀어 보여서 회색으로 낮췄다. 기존 로고는 밝은 배경
 * 화면들이 계속 쓰므로 그쪽은 건드리지 않는다.
 */
export default function DuskBrand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
      <Image
        src={gdgocPcLogo}
        alt="GDGoC INHA"
        width={53}
        height={30}
        className="block h-[30px] w-auto"
      />
      <span className="flex flex-col gap-0.5 leading-[1.15] mobile:hidden">
        <span className="text-[15px] tracking-[-0.01em] text-dusk-ink-100">
          Google Developer Group
        </span>
        <span className="text-[11px] tracking-[-0.01em] text-dusk-ink-600">Inha University</span>
      </span>
    </Link>
  )
}
