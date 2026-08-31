import Image from 'next/image'

import gdgocPcLogo from '@public/icons/gdgocIcon/pc.svg'

/**
 * 페이지 전환 사이에 잠깐 뜨는 화면.
 *
 * 실제로 보이는 시간이 0.5초 남짓이라 **완주하지 않는 연출은 넣지 않는다.** 예전 구현은
 * 3초 주기로 문구를 갈아끼우고 무한 진행바를 돌렸는데, 그 주기가 한 바퀴 돌기 전에 화면이
 * 사라져 "무언가 버벅이다 만" 인상만 남았다. 지금은 선을 지나가는 막대 하나만 움직인다.
 *
 * 전역 `overflow: hidden` 을 주입하던 것도 걷어냈다. 이 화면은 스크롤이 필요 없고,
 * 전역 스타일을 건드리면 다음 페이지까지 영향이 남는다.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="페이지 로딩 중"
      className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-dusk-base px-[clamp(20px,4vw,44px)] pb-[34px] pt-[30px] text-dusk-ink-100 break-keep"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 86% at 50% 118%, rgba(208,129,85,0.16) 0%, rgba(208,129,85,0) 60%), radial-gradient(90% 70% at 12% 6%, rgba(110,74,134,0.16) 0%, rgba(110,74,134,0) 62%)'
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[6] opacity-[0.28] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.5'/></svg>\")"
        }}
      />

      <div className="relative flex items-center gap-[11px]">
        <Image src={gdgocPcLogo} alt="" priority className="block h-[22px] w-auto opacity-85" />
        <span className="text-[13px] text-dusk-ink-800">GDGoC INHA</span>
      </div>

      <div className="relative mx-auto flex w-full max-w-[34ch] flex-col items-start gap-[22px]">
        <p className="text-[clamp(30px,4.6vw,58px)] font-semibold leading-[1.1] tracking-[-0.04em]">
          불러오는 중
        </p>
        <div className="h-px w-full max-w-[320px] overflow-hidden bg-[rgba(240,234,228,0.14)]">
          <span className="animate-gdg-sweep block h-full w-1/4 bg-ember" />
        </div>
        <p className="text-sm leading-[1.7] text-dusk-ink-800">잠시만 기다려 주세요.</p>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#7C7280]">
        <span>모두가 함께하는 성장을 꿈꿉니다.</span>
        <span>Inha University</span>
      </div>
    </div>
  )
}
