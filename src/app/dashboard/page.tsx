import Link from 'next/link'

const DASHBOARD_LINKS = [
  {
    href: '/dashboard/users',
    title: 'Users',
    description: '유저 권한, 팀, 계정 상태를 확인하고 수정합니다.'
  },
  {
    href: '/dashboard/members',
    title: 'Members',
    description: '신입 멤버 지원서와 회비 납부 상태를 확인합니다.'
  },
  {
    href: '/dashboard/core-applications',
    title: 'Core 지원서',
    description: '코어 지원서를 열람하고 합격/불합격을 처리합니다.'
  },
  {
    href: '/dashboard/mbti',
    title: 'MBTI',
    description: 'MBTI 결과 조회와 팀 매칭을 진행합니다.'
  },
  {
    href: '/dashboard/memo',
    title: 'Memo 발송',
    description: '신입생 알림 신청 대상에게 안내 메시지를 발송합니다.'
  }
] as const

export default function DashboardIndexPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white pc:px-10">
      <div className="mx-auto w-full max-w-[1280px] space-y-8">
        <div className="space-y-2">
          <p className="typo-pc-c2 text-gray-700">Admin Dashboard</p>
          <h1 className="typo-h3 mobile:typo-m-h2">관리 페이지 바로가기</h1>
          <p className="typo-pc-b3 text-gray-700">
            자주 쓰는 대시보드 하위 페이지를 한 곳에서 바로 이동할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-4 pc:grid-cols-2">
          {DASHBOARD_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-white/10 bg-gray-100/30 p-5 transition hover:border-white/40 hover:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="typo-pc-h4 text-white">{item.title}</h2>
                  <p className="typo-pc-b3 text-gray-700">{item.description}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 typo-pc-c2 text-gray-700 transition group-hover:border-white/30 group-hover:text-white">
                  열기
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
