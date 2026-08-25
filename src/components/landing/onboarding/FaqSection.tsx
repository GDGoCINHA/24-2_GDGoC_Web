'use client'

import { Fragment, useState } from 'react'

import { useLandingContent } from '@/components/landing/LandingContentProvider'
import { GDGOC_EMAIL, GDGOC_OPEN_CHAT_URL } from '@/constant/landingContent'
import { CORE_SCHEDULE, formatKoreanPeriodShort, MEMBER_SCHEDULE } from '@/constant/recruitSchedule'

/**
 * 답변 안의 연락처를 링크로 만든다. 캡처 그룹이 있는 split 은 구분자도 남기므로
 * 조각을 그대로 훑으면 된다.
 */
const CONTACT_PATTERN = new RegExp(`(${GDGOC_EMAIL.split('.').join('[.]')}|카카오톡 오픈채팅)`)

function renderAnswer(text: string) {
  return text.split(CONTACT_PATTERN).map((part, index) => {
    if (part === GDGOC_EMAIL) {
      return (
        <a key={index} href={`mailto:${part}`} className="text-ember hover:underline">
          {part}
        </a>
      )
    }
    if (part === '카카오톡 오픈채팅') {
      return (
        <a
          key={index}
          href={GDGOC_OPEN_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          className="text-ember hover:underline"
        >
          {part}
        </a>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

/**
 * 모집 일정 문구는 `recruitSchedule.ts` 에서만 가져온다. 여기 날짜를 적어 두면
 * 서버 설정과 갈라져 안내가 틀어진다.
 *
 * 운영진 값은 서버 응답을 못 받았을 때 쓰는 대체값이지만, 랜딩은 안내만 하고
 * 실제 지원 게이팅은 지원 페이지가 서버에 물어보므로 여기서는 대체값을 쓴다.
 */
function getScheduleCards() {
  return [
    {
      label: '부원 모집',
      value: '상시 모집',
      note: `집중 모집 ${formatKoreanPeriodShort(MEMBER_SCHEDULE.intensiveOpenAt, MEMBER_SCHEDULE.intensiveCloseAt)}`
    },
    {
      label: '운영진 서류',
      value: formatKoreanPeriodShort(CORE_SCHEDULE.fallbackOpenAt, CORE_SCHEDULE.fallbackCloseAt),
      note: `결과 ${CORE_SCHEDULE.documentResult}`
    },
    {
      label: '운영진 면접',
      value: formatKoreanPeriodShort(CORE_SCHEDULE.interviewOpenAt, CORE_SCHEDULE.interviewCloseAt),
      note: `최종 발표 ${CORE_SCHEDULE.finalResult}`
    }
  ]
}

export default function FaqSection() {
  const { faqs } = useLandingContent()
  const [openIndex, setOpenIndex] = useState(-1)
  const scheduleCards = getScheduleCards()

  return (
    <section id="faq" className="scroll-mt-[68px] border-t border-t-dusk-line-soft">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,5vw,44px)] py-[118px]">
        <h2
          data-reveal
          className="break-keep text-[clamp(26px,3.4vw,46px)] font-semibold leading-[1.32] tracking-[-0.03em]"
        >
          자주 묻는 질문
        </h2>

        <div className="mt-14 max-w-[860px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                data-reveal
                className="border-t border-t-dusk-line last:border-b last:border-b-dusk-line"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 px-1 py-[26px] text-left"
                >
                  <span className="break-keep text-[clamp(16px,1.7vw,20px)] font-medium tracking-[-0.02em] text-dusk-ink-100">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden
                    className={`shrink-0 text-xl font-light text-ember transition-transform duration-[350ms] ease-out ${isOpen ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(.22,.61,.36,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-[7px] break-keep px-1 pb-7 text-[15px] leading-[1.8] text-dusk-ink-600">
                      {faq.answer.map((paragraph) => (
                        <p key={paragraph}>{renderAnswer(paragraph)}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          data-reveal
          className="mt-[110px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-px bg-dusk-line"
        >
          {scheduleCards.map((card) => (
            <div key={card.label} className="bg-dusk-base px-[22px] pb-6 pt-5">
              <p className="text-[13px] text-dusk-ink-700">{card.label}</p>
              <p className="mt-2.5 text-[17px] text-dusk-ink-100">{card.value}</p>
              <p className="mt-1.5 text-sm text-dusk-ink-600">{card.note}</p>
            </div>
          ))}
        </div>
        <p data-reveal className="mt-4 text-[13px] text-dusk-ink-800">
          {CORE_SCHEDULE.interviewNote}
        </p>

        <div data-reveal className="mt-16 flex flex-wrap items-baseline justify-between gap-7">
          <p className="max-w-[22ch] break-keep text-[clamp(22px,2.6vw,34px)] font-semibold leading-[1.4] tracking-[-0.028em]">
            남은 질문은 지원서에서 이어서 이야기해요.
          </p>
          <a
            href="/recruit/"
            className="whitespace-nowrap rounded-full bg-ember px-11 py-[18px] text-base font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base"
          >
            지원하기
          </a>
        </div>
      </div>
    </section>
  )
}
