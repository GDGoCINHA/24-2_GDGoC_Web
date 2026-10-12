'use client'

import Image from 'next/image'

import { useAuth } from '@/hooks/useAuth'
import { canOpenDashboard, hasAtLeast } from '@/utils/auth/role'

import gdgocPcLogo from '@public/icons/gdgocIcon/pc.svg'

/**
 * 앵커 넷과 바깥으로 나가는 링크 둘.
 *
 * 게시판은 셋 중 행사로 보낸다 — 랜딩은 비로그인 방문자가 보는 화면인데
 * 공지·자유는 로그인을 요구해서 여기서 링크하면 바로 로그인으로 튕긴다.
 */
const ANCHORS = [
  { label: '소개', id: 'about' },
  { label: '활동', id: 'activities' },
  { label: '해커톤', id: 'hackathons' },
  { label: 'FAQ', id: 'faq' }
]

const LINK_CLASS =
  'whitespace-nowrap text-[15px] text-dusk-ink-500 transition-colors hover:text-dusk-ink-100'

/**
 * 운영진만 보는 진입 버튼. 지원하기(ember)와 겹치지 않게 테두리만 준다 —
 * 방문자에게 가장 중요한 버튼이 두 개로 보이면 안 된다.
 */
const ADMIN_LINK_CLASS =
  'whitespace-nowrap rounded-full border border-[rgba(240,234,228,0.22)] px-3.5 py-1.5 text-[13px] text-dusk-ink-400 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:text-dusk-ink-100'

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function LandingHeader() {
  const { user } = useAuth()
  const isLoggedIn = Boolean(user)
  // 콘텐츠 관리 화면과 같은 기준이다 (dashboard/landing/layout.tsx).
  const canEditContent = hasAtLeast(user?.userRole, 'LEAD')
  const canOpenAdmin = canOpenDashboard(user?.userRole)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between gap-3 border-b border-b-[rgba(240,234,228,0.07)] bg-[rgba(27,22,34,0.62)] px-[clamp(20px,4vw,44px)] backdrop-blur-[18px] pc:gap-6">
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
      >
        <Image
          src={gdgocPcLogo}
          alt="GDGoC INHA"
          width={53}
          height={30}
          className="block h-[30px] w-auto"
          priority
        />
        <span className="flex flex-col gap-0.5 leading-[1.15] mobile:hidden">
          <span className="text-[15px] tracking-[-0.01em] text-dusk-ink-100">
            Google Developer Group
          </span>
          <span className="text-[11px] tracking-[-0.01em] text-dusk-ink-600">Inha University</span>
        </span>
      </a>

      {/*
        모바일 여백은 운영진 기준으로 맞췄다. CORE 이상은 「운영」까지 다섯 개라 360px 에서
        PC 와 같은 간격이면 지원하기가 25px 잘린다.
      */}
      <nav className="flex items-center gap-[clamp(10px,2.4vw,34px)]">
        {/*
          좁은 화면에서는 숨긴다. 넣으면 nav 가 헤더보다 길어져 지원하기가 잘린다(360px 기준 62px 초과).
          운영진은 대시보드 허브의 온보딩 관리로 같은 화면에 갈 수 있다.
        */}
        {canEditContent && (
          <a href="/dashboard/landing/" className={`${ADMIN_LINK_CLASS} mobile:hidden`}>
            콘텐츠 관리
          </a>
        )}
        {/* 홈 화면 앱을 열면 여기가 첫 화면이라 운영진 입구가 있어야 한다. 짧아서 모바일에도 들어간다. */}
        {canOpenAdmin && (
          <a href="/dashboard/" className={ADMIN_LINK_CLASS}>
            운영
          </a>
        )}
        {ANCHORS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault()
              scrollToSection(item.id)
            }}
            className={`${LINK_CLASS} mobile:hidden`}
          >
            {item.label}
          </a>
        ))}
        {/*
          앵커와 달리 좁은 화면에서도 남긴다. 앵커는 링크가 없어도 스크롤로 닿지만
          게시판은 이 화면에서 나가는 유일한 통로다 — 숨기면 모바일에서 갈 방법이 없다.
        */}
        <a href="/board/events/" className={LINK_CLASS}>
          게시판
        </a>
        {/* 로그인 상태에서 /login?next=... 로 보내면 로그인 화면을 한 번 거쳐 되돌아온다. */}
        <a href={isLoggedIn ? '/profile/' : '/login?next=%2Fprofile%2F'} className={LINK_CLASS}>
          내 정보
        </a>
        <a
          href="/recruit/"
          className="whitespace-nowrap rounded-full bg-ember px-4 py-2.5 pc:px-5 text-[15px] font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base"
        >
          지원하기
        </a>
      </nav>
    </header>
  )
}
