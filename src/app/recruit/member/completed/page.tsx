'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GdgLogo } from '@/components/ui/design-system'
import { cn } from '@/utils/cn'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[550px]">
      <h2 className="typo-s2 typo-m-s1 text-white pl-2">{title}</h2>
      <div className="flex flex-col gap-4 bg-gray-100 rounded-xl p-4 w-full">{children}</div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  content,
  subContent
}: {
  icon?: string
  label?: string
  content: React.ReactNode
  subContent?: string
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex gap-2 items-start text-white typo-b2 mobile:typo-b3">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex flex-col gap-1 w-full">
          {label && <span className="font-bold">{label}</span>}
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </div>
      {subContent && (
        <p className="text-gray-700 text-[11px] leading-[14px] text-right w-full">{subContent}</p>
      )}
    </div>
  )
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start text-white typo-b2 mobile:typo-b3">
      <span className="shrink-0">•</span>
      <div className="whitespace-pre-wrap">{children}</div>
    </div>
  )
}

export default function RecruitSubmit() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <div className="relative z-10 pt-18 pb-32 mobile:pt-12 mobile:pb-24 px-4 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-10">
        {/* Header */}
        <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
          <GdgLogo mode="auto" />
          <h1 className="typo-h3 text-white mobile:typo-m-h3">GDGoC Inha Univ. 모집 안내</h1>
        </div>

        {/* Content Sections */}
        <div className="col-span-4 flex flex-col gap-10 w-full">
          {/* 모집 일정 */}
          <Section title="모집 일정">
            <InfoRow
              icon="✅"
              content={
                <>
                  <span className="font-bold">이런 저런 기간 : </span>
                  2025. <span className="font-bold">12. 26.</span>(금) - 2026.{' '}
                  <span className="font-bold">01. 09.</span>(금) 23:59:59
                </>
              }
            />
            <InfoRow
              icon="✅"
              content={
                <>
                  <span className="font-bold">이런 저런 발표 : </span>~ 2026.{' '}
                  <span className="font-bold">01. 10.</span>(토)
                </>
              }
            />
            <InfoRow
              icon="✅"
              content={
                <>
                  <span className="font-bold">이런 저런 기간 : </span>
                  2026. <span className="font-bold">01. 12.</span>(월) - 2026.{' '}
                  <span className="font-bold">01. 16.</span>(금)
                </>
              }
              subContent="※ 이런 저런 안내문구 얄라리 얄라셩"
            />
            <InfoRow
              icon="✅"
              content={
                <>
                  <span className="font-bold">최종 결과 발표 : </span>~ 2026.{' '}
                  <span className="font-bold">01. 16.</span>(금)
                </>
              }
            />
          </Section>

          {/* 입금 안내 */}
          <Section title="입금 안내">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <BulletPoint>
                  회비 납부 확인 후,{' '}
                  <span className="font-bold">
                    GDG on Campus 멤버로서 모든 활동들에 대한 참가 권한
                  </span>
                  을 얻게 됩니다.
                </BulletPoint>
                <BulletPoint>
                  프로젝트, 스터디 등 일부 활동은 운영 소요에 따라{' '}
                  <span className="font-bold">추가금이 산정</span>될 수 있습니다.
                </BulletPoint>
                <BulletPoint>
                  모든 회비는 커뮤니티 운영비로{' '}
                  <span className="font-bold">투명하게 사용, 처리</span>됩니다.
                </BulletPoint>
              </div>

              <div className="flex flex-col gap-1">
                <p className="typo-s2 text-white mobile:typo-m-s2 mb-1">👛 입금 계좌</p>
                <BulletPoint>토스뱅크 1001-9049-2082 | 예금주명 GDGoC INHA</BulletPoint>
              </div>

              <div className="flex flex-col gap-1">
                <p className="typo-s2 text-white mobile:typo-m-s2 mb-1">💵 25-2 회비</p>
                <BulletPoint>20,000 원</BulletPoint>
              </div>

              <div className="flex flex-col gap-1">
                <p className="typo-s2 text-white mobile:typo-m-s2 mb-1">📌 주의사항</p>
                <BulletPoint>
                  회비 납부 시 입금자명을 반드시 [<span className="font-bold">2자리 학번+이름</span>
                  ] 으로 변경해주세요!
                </BulletPoint>
                <BulletPoint>
                  → ex) <span className="font-bold">24김인하</span>
                </BulletPoint>
              </div>

              <div className="flex flex-col gap-1 pt-2">
                <p className="typo-b3 text-white">
                  <span className="font-bold">문의사항</span>: 박우찬 | 010-2087-1816
                </p>
              </div>
            </div>
          </Section>

          {/* 동아리 톡방 초대 일정 안내 */}
          <Section title="동아리 톡방 초대 일정 안내">
            <div className="flex flex-col gap-1 w-full">
              <BulletPoint>어쩌구 저쩌구</BulletPoint>
              <p className="text-gray-700 text-[11px] leading-[14px] text-right w-full">
                ※ 이런 저런 안내문구 얄라리 얄라셩
              </p>
            </div>
          </Section>
        </div>
      </div>

      {/* Core Member Promotion Section */}
      <div className="relative w-full h-[560px] mobile:h-[417px] flex flex-col items-center justify-center gap-6 overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[rgba(0,0,0,0.4)] to-[#1a1a1a] z-10" />
          {/* Replace with actual image when available */}
          <div className="w-full h-full bg-gray-800 opacity-50 relative">
            <Image
              src="/images/bgimg.png"
              alt="Core Member Promotion Background"
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center gap-6 text-center px-4">
          <div className="text-white">
            <p className="typo-h4 mobile:typo-m-h3 font-extrabold mb-1">근데 혹시...</p>
            <p className="typo-h4 mobile:typo-m-h3 font-extrabold">
              운영진(CORE)엔 관심 없으시술...?
            </p>
          </div>

          <div className="text-white typo-b2 mobile:typo-m-b3">
            <p>운영진 하면 뭐가 좋고 이래 좋고 저래 좋고</p>
            <p>암튼 사기문구 줄줄줄</p>
          </div>

          <Link
            href="/recruit/core"
            className="inline-flex items-center justify-center rounded-full bg-red px-12 py-3.5 text-white font-bold text-[14px] leading-[20px] hover:bg-red-400 transition-colors shadow-[0px_2px_50px_rgba(0,0,0,0.35)]"
          >
            운영진(CORE) 지원하러 가기
          </Link>
        </div>
      </div>
    </main>
  )
}
