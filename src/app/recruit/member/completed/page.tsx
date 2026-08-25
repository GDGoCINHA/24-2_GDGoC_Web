'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GdgLogo } from '@/components/ui/design-system'
import { formatKoreanPeriod } from '@/constant/recruitSchedule'
import { useMemberSchedule } from '@/hooks/useRecruitSchedule'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="text-[15px] font-medium text-dusk-ink-200">{title}</h2>
      <div className="flex w-full flex-col gap-2.5">{children}</div>
    </section>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px]">
      {children}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-start gap-2.5">
      <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-dusk-ink-700" />
      <div className="flex-1 text-[15px] leading-[1.75] text-dusk-ink-300">{children}</div>
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

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-center gap-10 px-6 py-16 text-center text-dusk-ink-100 mobile:gap-8 mobile:px-5 mobile:py-10">
        <div className="flex flex-col items-center gap-6 mobile:gap-4">
          <h3 className="whitespace-pre-line text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.4] tracking-[-0.02em]">
            {'잠깐!\n혹시 코어 멤버에 대해 들어보셨나요?'}
          </h3>

          <div className="whitespace-pre-line text-[15px] leading-[1.8] text-dusk-ink-400">
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
          className="inline-flex items-center justify-center rounded-full bg-ember px-12 py-4 text-[15px] font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base mobile:px-10 mobile:py-3.5"
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
  const memberSchedule = useMemberSchedule()

  return (
    <main className="mx-auto w-full max-w-[760px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
      <div className="flex items-center gap-3">
        <GdgLogo mode="auto" />
        <h1 className="text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.26] tracking-[-0.03em]">
          {isFromRecruit ? 'GDGoC INHA 지원 완료' : 'GDGoC INHA 일정 안내'}
        </h1>
      </div>

      <div className="mt-8 flex w-full flex-col gap-8">
        {isFromRecruit && (
          <section className="w-full">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">지원해주셔서 감사합니다.</h2>
            <p className="mt-2 text-[15px] text-dusk-ink-600">아래 안내 사항을 확인해 주세요.</p>
          </section>
        )}

        <Section title="모집 안내">
          <Card>
            <Bullet>
              <span className="mr-2 font-medium text-dusk-ink-100">집중 모집 기간</span>
              <span>
                {formatKoreanPeriod(
                  memberSchedule.intensiveOpenAt,
                  memberSchedule.intensiveCloseAt
                )}
              </span>
            </Bullet>
          </Card>
          <p className="text-[13px] text-dusk-ink-800">이후 상시 모집으로 전환됩니다.</p>
        </Section>

        <Section title="회비 안내">
          <Card>
            <Bullet>
              <span className="mr-2 font-medium text-dusk-ink-100">회비</span>
              <span>20,000원</span>
            </Bullet>
            <Bullet>
              <span className="mr-2 font-medium text-dusk-ink-100">입금 계좌</span>
              <span>하나 74891001642704 (예금주: 지디지오씨 인하)</span>
            </Bullet>
            <Bullet>
              회비 납부 시 반드시 입금자명을 &lsquo;학번 + 이름&rsquo; 형식(예: 24김인하) 으로
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
          <p className="text-[13px] text-dusk-ink-800">
            회비 입금이 완료되어야 최종 등록이 확정됩니다.
          </p>
        </Section>

        <Section title="동아리 톡방 초대 안내">
          <Card>
            <Bullet>동아리 단체 채팅방은 회비 입금 완료자에 한해 매주 금요일 초대됩니다.</Bullet>
            <Bullet>동아리 박람회 기간에는 당일 18시 이전 입금자까지 당일 초대됩니다.</Bullet>
          </Card>
        </Section>

        <Section title="문의 방법">
          <Card>
            <Bullet>
              <span className="mr-2 font-medium text-dusk-ink-100">카카오톡 오픈채팅</span>
              <br />
              <Link
                href="https://open.kakao.com/o/s2OqrcIi"
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm text-tag-info underline"
              >
                https://open.kakao.com/o/s2OqrcIi
              </Link>
            </Bullet>
            <Bullet>
              <span className="mr-2 font-medium text-dusk-ink-100">인스타그램 DM</span>
              <br />
              <span>@gdgoc.inha</span>
            </Bullet>
          </Card>
        </Section>

        <CoreMemberPromoSection />
      </div>
    </main>
  )
}
