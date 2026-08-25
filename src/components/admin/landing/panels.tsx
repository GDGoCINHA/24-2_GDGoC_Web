'use client'

import type { AxiosInstance } from 'axios'

import { ListRow, moveItem } from '@/components/admin/landing/ListRow'
import { PhotoField } from '@/components/admin/landing/PhotoField'
import {
  DuskField,
  DUSK_INPUT,
  DUSK_OPTION,
  DUSK_SELECT,
  DUSK_TEXTAREA
} from '@/components/ui/dusk/DuskForm'
import {
  LANDING_BADGE_TONE_LABEL,
  type LandingActivity,
  type LandingBadgeTone,
  type LandingContentDocument,
  type LandingFaq,
  type LandingHackathon,
  type LandingPhoto
} from '@/types/landing'

export interface PanelProps {
  document: LandingContentDocument
  onChange: (next: LandingContentDocument) => void
  apiClient: AxiosInstance
}

/** 새 항목을 만들 때 쓰는 빈 사진. 서버 검증이 `/images/` 또는 `https://` 만 받는다. */
const BLANK_PHOTO: LandingPhoto = {
  src: '/images/landing/opening-web.jpg',
  alt: '사진 설명을 입력해 주세요.',
  caption: '',
  focusY: 50
}

function PanelHeading({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="mt-2.5 text-[15px] leading-[1.7] text-dusk-ink-600">{body}</p>
    </div>
  )
}

const ADD_BUTTON =
  'w-full rounded-xl border border-dashed border-[rgba(240,234,228,0.24)] px-6 py-4 text-sm text-dusk-ink-400 transition-colors hover:border-[rgba(208,129,85,0.6)] hover:text-dusk-ink-100'

export function HeroPanel({ document, onChange, apiClient }: PanelProps) {
  const { hero } = document
  const patch = (next: Partial<typeof hero>) =>
    onChange({ ...document, hero: { ...hero, ...next } })

  return (
    <div className="flex flex-col gap-7">
      <PanelHeading
        title="히어로"
        body="첫 화면 전면에 깔리는 사진과 문구입니다. 사진은 가로가 긴 단체 사진이 잘 맞습니다."
      />

      <PhotoField
        photo={hero.photo}
        onChange={(photo) => patch({ photo })}
        apiClient={apiClient}
        previewClassName="h-[clamp(200px,26vw,320px)]"
      />

      {/* 제목은 두 조각으로 나눠 뒷부분만 강조 자간을 쓴다. 화면에서는 이어져 보인다. */}
      <DuskField label="제목 앞부분">
        <textarea
          rows={2}
          value={hero.titleLead}
          onChange={(event) => patch({ titleLead: event.target.value })}
          className={DUSK_TEXTAREA}
        />
      </DuskField>

      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <DuskField label="강조할 이름" hint="굵게 붙어 보이는 부분">
          <input
            type="text"
            value={hero.titleAccent}
            onChange={(event) => patch({ titleAccent: event.target.value })}
            className={DUSK_INPUT}
          />
        </DuskField>
        <DuskField label="제목 끝맺음" hint="예: 에서">
          <input
            type="text"
            value={hero.titleTail}
            onChange={(event) => patch({ titleTail: event.target.value })}
            className={DUSK_INPUT}
          />
        </DuskField>
      </div>

      <DuskField label="설명">
        <input
          type="text"
          value={hero.description}
          onChange={(event) => patch({ description: event.target.value })}
          className={DUSK_INPUT}
        />
      </DuskField>

      <DuskField label="모집 안내 문구" hint="모집 기간 배지 옆에 붙는다.">
        <input
          type="text"
          value={hero.ctaNote}
          onChange={(event) => patch({ ctaNote: event.target.value })}
          className={DUSK_INPUT}
        />
      </DuskField>
    </div>
  )
}

export function PhotoStripPanel({ document, onChange, apiClient }: PanelProps) {
  const { photoStrip } = document
  const set = (next: LandingPhoto[]) => onChange({ ...document, photoStrip: next })

  return (
    <div className="flex flex-col gap-7">
      <PanelHeading
        title="사진 띠"
        body="소개와 활동 사이에 들어가는 사진입니다. 최근 행사 사진으로 바꾸면 페이지가 가장 최신처럼 보입니다."
      />

      <div className="flex flex-col gap-4">
        {photoStrip.map((photo, index) => (
          <ListRow
            key={index}
            index={index}
            total={photoStrip.length}
            onMove={(from, to) => set(moveItem(photoStrip, from, to))}
            onRemove={(at) => set(photoStrip.filter((_, i) => i !== at))}
          >
            <PhotoField
              photo={photo}
              onChange={(next) => set(photoStrip.map((item, i) => (i === index ? next : item)))}
              apiClient={apiClient}
              previewClassName="h-[180px]"
            />
          </ListRow>
        ))}
      </div>

      {/* 서버가 6장까지만 받는다. 넘기면 저장에서 400 이라 버튼을 미리 잠근다. */}
      <button
        type="button"
        disabled={photoStrip.length >= 6}
        onClick={() => set([...photoStrip, { ...BLANK_PHOTO }])}
        className={`${ADD_BUTTON} disabled:opacity-40`}
      >
        + 사진 추가 ({photoStrip.length}/6)
      </button>
    </div>
  )
}

export function ActivitiesPanel({ document, onChange }: PanelProps) {
  const { activities } = document
  const set = (next: LandingActivity[]) => onChange({ ...document, activities: next })
  const patch = (index: number, next: Partial<LandingActivity>) =>
    set(activities.map((item, i) => (i === index ? { ...item, ...next } : item)))

  return (
    <div className="flex flex-col gap-7">
      <PanelHeading
        title="활동"
        body="각 활동의 이름과 설명을 관리합니다. 순서를 바꾸면 페이지에도 그대로 반영됩니다."
      />

      <div className="flex flex-col gap-4">
        {activities.map((activity, index) => (
          <ListRow
            key={index}
            index={index}
            total={activities.length}
            showNumber
            onMove={(from, to) => set(moveItem(activities, from, to))}
            onRemove={(at) => set(activities.filter((_, i) => i !== at))}
          >
            <DuskField label="이름">
              <input
                type="text"
                value={activity.title}
                onChange={(event) => patch(index, { title: event.target.value })}
                className={DUSK_INPUT}
              />
            </DuskField>
            <DuskField label="설명">
              <input
                type="text"
                value={activity.body}
                onChange={(event) => patch(index, { body: event.target.value })}
                className={DUSK_INPUT}
              />
            </DuskField>
          </ListRow>
        ))}
      </div>

      <button
        type="button"
        disabled={activities.length >= 12}
        onClick={() => set([...activities, { title: '새 활동', body: '설명을 입력해 주세요.' }])}
        className={`${ADD_BUTTON} disabled:opacity-40`}
      >
        + 활동 추가 ({activities.length}/12)
      </button>
    </div>
  )
}

export function HackathonsPanel({ document, onChange, apiClient }: PanelProps) {
  const { hackathonIntro, hackathons } = document
  const set = (next: LandingHackathon[]) => onChange({ ...document, hackathons: next })
  const patch = (index: number, next: Partial<LandingHackathon>) =>
    set(hackathons.map((item, i) => (i === index ? { ...item, ...next } : item)))

  return (
    <div className="flex flex-col gap-7">
      <PanelHeading
        title="대회 · 해커톤"
        body="목록과 그 옆 사진을 관리합니다. 배지 색은 정해진 세 가지 중에서 고릅니다."
      />

      <div className="flex flex-col gap-4 rounded-[14px] border border-[rgba(240,234,228,0.12)] p-5">
        <DuskField label="구역 제목">
          <input
            type="text"
            value={hackathonIntro.heading}
            onChange={(event) =>
              onChange({
                ...document,
                hackathonIntro: { ...hackathonIntro, heading: event.target.value }
              })
            }
            className={DUSK_INPUT}
          />
        </DuskField>
        <DuskField label="구역 설명">
          <textarea
            rows={2}
            value={hackathonIntro.body}
            onChange={(event) =>
              onChange({
                ...document,
                hackathonIntro: { ...hackathonIntro, body: event.target.value }
              })
            }
            className={DUSK_TEXTAREA}
          />
        </DuskField>
        <PhotoField
          photo={hackathonIntro.photo}
          onChange={(photo) =>
            onChange({ ...document, hackathonIntro: { ...hackathonIntro, photo } })
          }
          apiClient={apiClient}
          previewClassName="h-[200px]"
        />
      </div>

      <div className="flex flex-col gap-4">
        {hackathons.map((item, index) => (
          <ListRow
            key={index}
            index={index}
            total={hackathons.length}
            onMove={(from, to) => set(moveItem(hackathons, from, to))}
            onRemove={(at) => set(hackathons.filter((_, i) => i !== at))}
          >
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
              <DuskField label="연도" hint="아직 안 정해졌으면 —">
                <input
                  type="text"
                  value={item.year}
                  onChange={(event) => patch(index, { year: event.target.value })}
                  className={DUSK_INPUT}
                />
              </DuskField>
              <DuskField label="배지 문구">
                <input
                  type="text"
                  value={item.badge}
                  onChange={(event) => patch(index, { badge: event.target.value })}
                  className={DUSK_INPUT}
                />
              </DuskField>
              <DuskField label="배지 색">
                <select
                  value={item.badgeTone}
                  onChange={(event) =>
                    patch(index, { badgeTone: event.target.value as LandingBadgeTone })
                  }
                  className={DUSK_SELECT}
                >
                  {(Object.keys(LANDING_BADGE_TONE_LABEL) as LandingBadgeTone[]).map((tone) => (
                    <option key={tone} value={tone} className={DUSK_OPTION}>
                      {LANDING_BADGE_TONE_LABEL[tone]}
                    </option>
                  ))}
                </select>
              </DuskField>
            </div>

            <DuskField label="행사명">
              <input
                type="text"
                value={item.title}
                onChange={(event) => patch(index, { title: event.target.value })}
                className={DUSK_INPUT}
              />
            </DuskField>
            <DuskField label="설명">
              <textarea
                rows={3}
                value={item.body}
                onChange={(event) => patch(index, { body: event.target.value })}
                className={DUSK_TEXTAREA}
              />
            </DuskField>
          </ListRow>
        ))}
      </div>

      <button
        type="button"
        disabled={hackathons.length >= 12}
        onClick={() =>
          set([
            ...hackathons,
            {
              year: '—',
              title: '새 행사',
              badge: '내부 행사',
              badgeTone: 'INTERNAL',
              body: '설명을 입력해 주세요.'
            }
          ])
        }
        className={`${ADD_BUTTON} disabled:opacity-40`}
      >
        + 행사 추가 ({hackathons.length}/12)
      </button>
    </div>
  )
}

export function FaqPanel({ document, onChange }: PanelProps) {
  const { faqs } = document
  const set = (next: LandingFaq[]) => onChange({ ...document, faqs: next })
  const patch = (index: number, next: Partial<LandingFaq>) =>
    set(faqs.map((item, i) => (i === index ? { ...item, ...next } : item)))

  return (
    <div className="flex flex-col gap-7">
      <PanelHeading
        title="FAQ"
        body="자주 묻는 질문과 답을 관리합니다. 답변은 빈 줄로 문단을 나눕니다 — 문단마다 한 줄로 보입니다."
      />

      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => (
          <ListRow
            key={index}
            index={index}
            total={faqs.length}
            onMove={(from, to) => set(moveItem(faqs, from, to))}
            onRemove={(at) => set(faqs.filter((_, i) => i !== at))}
          >
            <DuskField label="질문">
              <input
                type="text"
                value={faq.question}
                onChange={(event) => patch(index, { question: event.target.value })}
                className={DUSK_INPUT}
              />
            </DuskField>
            <DuskField label="답변" hint="줄바꿈 하나가 문단 하나다.">
              <textarea
                rows={5}
                value={faq.answer.join('\n')}
                onChange={(event) =>
                  patch(index, {
                    // 빈 줄은 버린다. 서버가 빈 문자열을 거부하고, 화면에서도 빈 문단은 틈만 만든다.
                    answer: event.target.value.split('\n').filter((line) => line.trim() !== '')
                  })
                }
                className={DUSK_TEXTAREA}
              />
            </DuskField>
          </ListRow>
        ))}
      </div>

      <button
        type="button"
        disabled={faqs.length >= 12}
        onClick={() => set([...faqs, { question: '새 질문', answer: ['답변을 입력해 주세요.'] }])}
        className={`${ADD_BUTTON} disabled:opacity-40`}
      >
        + 질문 추가 ({faqs.length}/12)
      </button>
    </div>
  )
}
