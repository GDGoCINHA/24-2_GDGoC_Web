'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GdgLogo } from '@/components/ui/design-system'
import { cn } from '@/utils/cn'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 w-full max-w-[720px]">
      <h2 className="typo-pc-s2 mobile:typo-m-s1 text-white pl-1">{title}</h2>
      <div className="flex flex-col gap-2.5 w-full">{children}</div>
    </section>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gray-100 text-white px-4 py-2.5 min-h-11 mobile:min-h-10 flex items-center',
        className
      )}
    >
      {children}
    </div>
  )
}

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

function CoreMemberPromoSection() {
  return (
    <section className="relative left-1/2 w-[100dvw] -translate-x-1/2 overflow-hidden min-h-[640px] mobile:min-h-[572px]">
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-no-repeat bg-[length:100%_auto] mobile:hidden"
        style={{ backgroundImage: "url('/images/recruit/core_pic.jpeg')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden mobile:block bg-center bg-no-repeat bg-[length:100%_auto]"
        style={{ backgroundImage: "url('/images/recruit/core_pic_m.jpg')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,30,30,0)_0%,rgba(30,30,30,0.55)_56%,rgba(30,30,30,0.95)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#1e1e1e_0%,rgba(30,30,30,0.7)_50%,#1e1e1e_100%)]"
      />

      <div className="relative z-10 mx-auto h-full w-full max-w-[720px] flex flex-col items-center justify-center gap-10 mobile:gap-8 px-6 py-16 mobile:px-5 mobile:py-10 text-center text-white">
        <div className="flex flex-col items-center gap-6 mobile:gap-4">
          <h3 className="typo-pc-h4 mobile:typo-m-h3 whitespace-pre-line">
            {'잠깐!\n혹시 코어 멤버에 대해 들어보셨나요?'}
          </h3>

          <div className="typo-pc-b2 mobile:typo-m-b3 text-gray-900 whitespace-pre-line">
            {`코어 멤버는 GDGoC INHA 활동의 꽃,
동아리를 직접 기획하고 운영하는 핵심 운영진입니다.

행사를 만들고, 팀을 이끌고,
동아리의 방향을 함께 고민합니다.

단순한 참여를 넘어 직접 만들어보고 싶다면,

.
.
.`}
          </div>
        </div>

        <Link
          href="/recruit/core"
          className="inline-flex h-13 mobile:h-11 items-center justify-center rounded-full bg-red px-12 mobile:px-10 text-white typo-pc-s3 mobile:typo-m-s2"
        >
          코어 멤버 모집 바로가기
        </Link>
      </div>
    </section>
  )
}

export default function RecruitSubmit() {
  const searchParams = useSearchParams()
  const isFromRecruit = searchParams.get('from') === 'recruit'

  return (
    <main className="min-h-screen bg-black">
      <div className="pt-18 pb-28 mobile:pt-12 mobile:pb-20 layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8">
        <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
          <GdgLogo mode="auto" />
          <h1 className="typo-pc-h3 text-white mobile:typo-m-h2">
            {isFromRecruit ? 'GDGoC INHA 지원 완료' : 'GDGoC INHA 일정 안내'}
          </h1>
        </div>

        <div className="col-span-4 flex flex-col gap-8 w-full">
          {isFromRecruit && (
            <section className="w-full max-w-[720px]">
              <h2 className="typo-pc-h4 mobile:typo-m-h3 text-white">지원해주셔서 감사합니다.</h2>
              <p className="typo-pc-b2 mobile:typo-m-b1 text-gray-800 mt-2">
                아래 안내 사항을 확인해 주세요.
              </p>
            </section>
          )}

          <Section title="모집 안내">
            <Card className="flex-col items-start gap-2">
              <Bullet>
                <span className="font-bold mr-2">집중 모집 기간</span>
                <span>2/12 ~ 3/15</span>
              </Bullet>
            </Card>

            <p className="typo-pc-c1 mobile:typo-m-c2 text-gray-500 pl-4">
              이후 상시 모집으로 전환됩니다.
            </p>
          </Section>

          <Section title="회비 안내">
            <Card className="flex-col items-start gap-2">
              <Bullet>
                <span className="font-bold mr-2">회비</span>
                <span>20,000원</span>
              </Bullet>
              <Bullet>
                <span className="font-bold mr-2">입금 계좌</span>
                <span>신한 110-333-968130 (예금주: 백승엽)</span>
              </Bullet>
              <Bullet>
                회비 납부 시 반드시 입금자명을 {"\'"}학번 + 이름{"\'"} 형식(예: 24김인하) 으로
                변경한 후 송금해주시기 바랍니다.
              </Bullet>
              <Bullet>
                회비 납부 확인 후, GDGoC INHA의 멤버로서 모든 활동들에 대한 참가 권한을 얻게 됩니다.
              </Bullet>
              <Bullet>
                프로젝트와 스터디 등 일부 활동은 운영 소요에 따라 추가금이 산정될 수 있습니다.
              </Bullet>
              <Bullet>모든 회비는 커뮤니티 운영비로 투명하게 사용, 처리됩니다.</Bullet>
            </Card>
            <p className="typo-pc-c1 mobile:typo-m-c2 text-gray-500 pl-4">
              회비 입금이 완료되어야 최종 등록이 확정됩니다.
            </p>
          </Section>

          <Section title="동아리 톡방 초대 안내">
            <Card className="flex-col items-start gap-2">
              <Bullet>동아리 단체 채팅방은 회비 입금 완료자에 한해 매주 금요일 초대됩니다.</Bullet>
              <Bullet>동아리 박람회 기간에는 당일 18시 이전 입금자까지 당일 초대됩니다.</Bullet>
            </Card>
          </Section>

          <Section title="문의 방법">
            <Card className="flex-col items-start gap-2.5">
              <Bullet>
                <span className="font-bold mr-2">카카오톡 오픈채팅</span>
                <br />
                <Link
                  href="https://open.kakao.com/o/s3fxV67h"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="typo-pc-b3 mobile:typo-m-c1 text-[#9EC0FF] underline break-all"
                >
                  https://open.kakao.com/o/s3fxV67h
                </Link>
              </Bullet>
              <Bullet>
                <span className="font-bold mr-2">인스타그램 DM</span>
                <br />
                <span>@gdgoc.inha</span>
              </Bullet>
            </Card>
          </Section>

          <CoreMemberPromoSection />
        </div>
      </div>
    </main>
  )
}
