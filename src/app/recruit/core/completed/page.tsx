'use client'

import Link from 'next/link'
import { GdgLogo, GdgButton } from '@/components/ui/design-system'

export default function RecruitCoreCompleted() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <div className="relative z-10 pt-18 pb-32 mobile:pt-12 mobile:pb-24 px-4 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-10">
        {/* Header */}
        <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
          <GdgLogo mode="auto" />
          <h1 className="typo-h3 text-white mobile:typo-m-h3">Core Member 지원 완료</h1>
        </div>

        {/* Content Sections - Step 2 UI 이관 */}
        <div className="col-span-4 flex flex-col gap-10 w-full">
          <div className="space-y-2">
            <p className="pl-2 typo-s2 mobile:typo-m-s1 text-white">모집 일정</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white">
              <div className="space-y-4 typo-b2 mobile:space-y-3 mobile:typo-b3">
                <div className="space-y-1">
                  <p>✅ 서류 지원 기간</p>
                  <p>2025. 12. 26.(금) - 2026. 01. 09.(금) 23:59:59</p>
                </div>
                <div className="space-y-1">
                  <p>✅ 서류 결과 발표</p>
                  <p>~ 2026. 01. 10.(토)</p>
                </div>
                <div className="space-y-1">
                  <p>✅ 면접 진행 기간</p>
                  <p>2026. 01. 12.(월) - 2026. 01. 16.(금)</p>
                  <p className="typo-c2 text-gray-700">
                    ※ 지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.
                  </p>
                </div>
                <div className="space-y-1">
                  <p>✅ 최종 결과 발표</p>
                  <p>~ 2026. 01. 16.(금)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="pl-2 typo-s2 mobile:typo-m-s1 text-white">면접 안내</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-b2 mobile:typo-b3">
              <p>• 원칙적으로 대면 면접을 진행하며, 부득이한 경우 비대면으로 조정될 수 있습니다.</p>
              <p className="mt-2">• 면접은 인하대학교 내부 장소에서 진행됩니다.</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="pl-2 typo-s2 mobile:typo-m-s1 text-white">활동 안내</p>
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-white typo-b2 mobile:typo-b3">
              <p>• 운영진으로 활동 시, 매주 1회 정기 운영진 회의에 필수 참석해야 합니다.</p>
              <p className="mt-1 typo-c2 text-gray-700">※ 일정은 1월 내로 공지 드립니다.</p>
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
