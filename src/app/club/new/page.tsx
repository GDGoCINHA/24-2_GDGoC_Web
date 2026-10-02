'use client'

import { useState } from 'react'

import { ClubBackLink } from '@/components/club/ClubUi'
import { ClubSiteHeader } from '@/components/club/ClubSiteHeader'
import {
  DUSK_CANCEL_BUTTON,
  DUSK_CHIP,
  DUSK_CHIP_ACTIVE,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON,
  DUSK_TEXTAREA,
  DuskField
} from '@/components/ui/dusk/DuskForm'
import { CLUB_CATEGORY_LABEL, type ClubCategory } from '@/types/club'
import { cn } from '@/utils/cn'

const CATEGORIES: ClubCategory[] = ['STUDY', 'HOBBY', 'CAREER', 'ETC']

/**
 * 소모임 개설 (A 담당). `?id=` 가 있으면 수정 화면으로 쓴다.
 *
 * 이끔이 권한이 없으면 개설 신청서로 보내야 한다 — GET /api/v1/clubs/leader-grant/me.
 */
export default function ClubNewPage() {
  const [category, setCategory] = useState<ClubCategory>('STUDY')

  return (
    <main className="min-h-screen">
      <ClubSiteHeader />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-[clamp(20px,5vw,44px)] pb-[100px] pt-11 mobile:pt-6">
        <div>
          <ClubBackLink href="/club/" label="목록으로" />
          <h1 className="mt-6 text-[clamp(25px,3vw,36px)] font-semibold leading-[1.3] tracking-[-0.03em]">
            소모임 개설
          </h1>
          <p className="mt-2.5 text-sm text-dusk-ink-700">
            개설하면 바로 게시판에 올라가고 참여 신청을 받을 수 있어요
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
          <DuskField label="소모임 이름" required>
            <input type="text" className={DUSK_INPUT} />
          </DuskField>

          <DuskField label="분야" required group>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={cn(
                    category === value ? DUSK_CHIP_ACTIVE : DUSK_CHIP,
                    'px-[18px] py-2.5 text-sm'
                  )}
                >
                  {CLUB_CATEGORY_LABEL[value]}
                </button>
              ))}
            </div>
          </DuskField>

          <DuskField label="한 줄 소개" required>
            <input type="text" maxLength={200} className={DUSK_INPUT} />
          </DuskField>

          <DuskField label="소개">
            <textarea
              rows={4}
              placeholder="어떤 모임인지 자세히 적어 주세요"
              className={DUSK_TEXTAREA}
            />
          </DuskField>

          <DuskField label="활동 방식">
            <textarea
              rows={3}
              placeholder="예: 매주 화요일 저녁 오프라인, 주제별 문제 4개 풀이 발표"
              className={DUSK_TEXTAREA}
            />
          </DuskField>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-3 mobile:grid-cols-1">
              <DuskField label="활동 시작일">
                <input type="date" className={cn(DUSK_INPUT, '[color-scheme:dark]')} />
              </DuskField>
              <DuskField label="활동 종료일">
                <input type="date" className={cn(DUSK_INPUT, '[color-scheme:dark]')} />
              </DuskField>
              <DuskField label="정원 (이끔이 포함)">
                <input type="number" min={1} className={DUSK_INPUT} />
              </DuskField>
            </div>
            <p className="text-[13px] text-dusk-ink-800">
              활동 기간은 나중에 바꿀 수 있어요. 완주하려면 기간 동안 매주 1회 이상 모이고, 팀원이
              4명 이상이어야 해요.
            </p>
          </div>

          <DuskField label="단톡방 링크" hint="승인된 멤버에게만 보여요">
            <input type="url" placeholder="https://open.kakao.com/..." className={DUSK_INPUT} />
          </DuskField>

          <DuskField label="대표 이미지" group>
            <button
              type="button"
              className="h-40 rounded-[14px] border border-dashed border-dusk-line-dashed text-sm text-dusk-ink-700 mobile:h-32"
            >
              눌러서 이미지 올리기
            </button>
          </DuskField>

          <div className="sticky bottom-0 flex gap-2.5 bg-dusk-base pb-3 pt-2">
            <a href="/club/" className={DUSK_CANCEL_BUTTON}>
              취소
            </a>
            <button type="submit" className={DUSK_SUBMIT_BUTTON}>
              개설하기
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
