'use client'

import Link from 'next/link'
import { GdgLogo, GdgButton } from '@/components/ui/design-system'

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start w-full">
      <span className="w-5 shrink-0 text-center text-[18px] mobile:text-[16px] leading-none font-bold mt-[1px]">
        •
      </span>
      <div className="typo-pc-b2 mobile:typo-m-b3 flex-1">{children}</div>
    </div>
  )
}

export default function RecruitCoreCompleted() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <div className="relative z-10 pt-18 pb-32 mobile:pt-12 mobile:pb-24 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-10">
        {/* Header */}
        <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
          <GdgLogo mode="auto" />
          <h1 className="typo-pc-h3 text-white mobile:typo-m-h2">Core Member 지원 완료</h1>
        </div>

        {/* Content Sections - Step 2 UI 이관 */}
        <div className="col-span-4 flex flex-col gap-10 w-full">
          <div className="space-y-2">
            <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">모집 일정</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white">
              <div className="space-y-4 typo-pc-b2 mobile:space-y-3 mobile:typo-m-b3">
                <div className="space-y-1">
                  <Bullet>서류 지원 기간</Bullet>
                  <p>2026. 2. 12.(목) - 2026. 3. 14.(토) 23:59</p>
                </div>
                <div className="space-y-1">
                  <Bullet>서류 결과 발표</Bullet>
                  <p>~ 2026. 3. 15.(일)</p>
                </div>
                <div className="space-y-1">
                  <Bullet>면접 진행 기간</Bullet>
                  <p>2026. 3. 16.(월) - 2026. 3. 20.(금)</p>
                  <p className="typo-pc-c2 mobile:typo-m-c2 text-gray-700">
                    ※ 지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.
                  </p>
                </div>
                <div className="space-y-1">
                  <Bullet>최종 결과 발표</Bullet>
                  <p>~ 2026. 3. 21.(토)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">면접 안내</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
              <Bullet>원칙적으로 대면 면접을 진행하며, 부득이한 경우 비대면으로 조정될 수 있습니다.</Bullet>
              <div className="mt-2">
                <Bullet>면접은 인하대학교 내부 장소에서 진행됩니다.</Bullet>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="pl-2 typo-pc-s2 mobile:typo-m-s1 text-white">활동 안내</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-pc-b2 mobile:typo-m-b3">
              <Bullet>운영진으로 활동 시, 매주 1회 정기 운영진 회의에 필수 참석해야 합니다.</Bullet>
              <p className="mt-1 typo-pc-c2 mobile:typo-m-c2 text-gray-700">※ 일정은 3월 내로 공지 드립니다.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Link href="/">
              <GdgButton variant="active" size="small">
                홈으로 이동
              </GdgButton>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
