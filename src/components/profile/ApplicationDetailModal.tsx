'use client'

import { useEffect } from 'react'

import { formatMajorLabel } from '@/constant/majorOptions'
import type { MyCoreApplicationDetail, MyMemberApplication } from '@/types/profile'
import { formatPhoneNumberDisplay } from '@/utils/phoneNumber'

/** 서버 InputType enum 이름 → 지원 폼에 쓰인 문항 이름. 값이 없으면 원문을 그대로 보여준다. */
const ANSWER_LABELS: Record<string, string> = {
  INTERESTS: '관심 분야',
  EXPECTED_ACTIVITY: '하고 싶은 활동',
  FEEDBACK: '동아리 운영에 바라는 점',
  PROOF_FILE: '증빙 서류',
  APPLY_MOTIVATION: '지원 동기',
  LIFE_STORY: '살아온 이야기',
  GDG_PERIOD: '활동 기간',
  ROUTE_TO_KNOW: '알게 된 경로',
  WANT_TO_GET: '기대하는 것'
}

const ENROLLMENT_LABELS: Record<string, string> = {
  FULL_REGISTRATION: '재학',
  PARTIAL_REGISTRATION: '부분등록',
  LEAVE_OF_ABSENCE: '휴학',
  MILITARY_LEAVE: '군휴학',
  COMPLETION: '수료',
  GRADUATION: '졸업'
}

const GENDER_LABELS: Record<string, string> = {
  MALE: '남성',
  FEMALE: '여성',
  PRIVATE: '비공개'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** 'Y26_2' → '2026-2학기' */
const formatSemesterLabel = (value?: string | null) => {
  if (!value) return '-'
  const matched = /^Y(\d{2})_(\d)$/.exec(value)
  return matched ? `20${matched[1]}-${matched[2]}학기` : value
}

const isFileUrl = (value: string) => value.startsWith('http://') || value.startsWith('https://')

const formatAnswerValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-[15px] text-dusk-ink-700">{label}</span>
      <span className="break-all text-[15px] text-dusk-ink-100">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[rgba(240,234,228,0.10)] bg-[rgba(240,234,228,0.05)] p-4">
      <p className="text-[13px] text-dusk-ink-700">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function LongAnswer({ label, value }: { label: string; value: string }) {
  return (
    <Section title={label}>
      <p className="whitespace-pre-wrap break-keep text-[15px] leading-[1.75] text-dusk-ink-200">
        {value || '-'}
      </p>
    </Section>
  )
}

interface ApplicationDetailModalProps {
  title: string
  /** 둘 중 하나만 채운다. 로딩 중에는 둘 다 null 이다. */
  core?: MyCoreApplicationDetail | null
  member?: MyMemberApplication | null
  loading?: boolean
  error?: string | null
  onClose: () => void
}

/**
 * 마이페이지에서 내가 낸 지원서를 펼쳐 본다.
 *
 * 운영진 대시보드의 상세 모달과 겉모습은 닮았지만 그쪽은 합불 처리 UI 가 붙어 있어 재사용하지 않는다.
 * 여기서는 읽기만 하며, 검토 메모·검토자는 서버가 애초에 내려주지 않는다.
 */
export default function ApplicationDetailModal({
  title,
  core = null,
  member = null,
  loading = false,
  error = null,
  onClose
}: ApplicationDetailModalProps) {
  // 모달이 떠 있는 동안 뒤 화면이 같이 스크롤되면 어디를 보고 있는지 잃는다.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const memberAnswers = member?.answers?.answers ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,15,22,0.70)] px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-full w-full max-w-[720px] overflow-y-auto rounded-[18px] border border-[rgba(240,234,228,0.12)] bg-dusk-field p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 text-xl font-light text-dusk-ink-700 transition-colors hover:text-dusk-ink-100"
          >
            ×
          </button>
        </div>

        {loading ? <p className="mt-6 text-[15px] text-dusk-ink-800">불러오는 중…</p> : null}
        {error ? <p className="mt-6 text-[15px] text-signal-err">{error}</p> : null}

        {core ? (
          <div className="mt-6 space-y-4">
            <Section title="기본 정보">
              <div className="space-y-2">
                <Field label="이름" value={core.snapshot.name} />
                <Field label="학번" value={core.snapshot.studentId} />
                <Field label="전공" value={formatMajorLabel(core.snapshot.major)} />
                <Field label="전화번호" value={formatPhoneNumberDisplay(core.snapshot.phone)} />
                <Field label="이메일" value={core.snapshot.email} />
                <Field label="지원 팀" value={core.team} />
                <Field label="제출 시각" value={formatDateTime(core.createdAt)} />
              </div>
            </Section>

            <LongAnswer label="지원 동기" value={core.motivation} />
            <LongAnswer label="하고 싶은 일" value={core.wish} />
            <LongAnswer label="강점" value={core.strengths} />
            <LongAnswer label="다짐" value={core.pledge} />

            <Section title="첨부 파일">
              {core.fileUrls.length > 0 ? (
                <div className="space-y-2">
                  {core.fileUrls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-[15px] text-tag-info underline"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-dusk-ink-800">첨부 파일이 없습니다.</p>
              )}
            </Section>
          </div>
        ) : null}

        {member ? (
          <div className="mt-6 space-y-4">
            <Section title="기본 정보">
              <div className="space-y-2">
                <Field label="이름" value={member.name} />
                <Field label="학번" value={member.studentId} />
                <Field label="전공" value={formatMajorLabel(member.major)} />
                <Field
                  label="재학 상태"
                  value={ENROLLMENT_LABELS[member.enrolledClassification ?? ''] ?? '-'}
                />
                <Field label="성별" value={GENDER_LABELS[member.gender ?? ''] ?? '-'} />
                <Field label="생년월일" value={member.birth ?? '-'} />
                <Field label="전화번호" value={formatPhoneNumberDisplay(member.phoneNumber)} />
                <Field label="이메일" value={member.email} />
                <Field label="지원 학기" value={formatSemesterLabel(member.admissionSemester)} />
                <Field label="제출 시각" value={formatDateTime(member.createdAt)} />
                <Field label="회비 입금" value={member.isPayed ? '입금 완료' : '미입금'} />
              </div>
            </Section>

            {memberAnswers.map((answer) => {
              const label = ANSWER_LABELS[answer.inputType] ?? answer.inputType
              const value = answer.responseValue

              if (
                answer.inputType === 'PROOF_FILE' &&
                typeof value === 'string' &&
                isFileUrl(value)
              ) {
                return (
                  <Section key={answer.id} title={label}>
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-[15px] text-tag-info underline"
                    >
                      {value}
                    </a>
                  </Section>
                )
              }

              return <LongAnswer key={answer.id} label={label} value={formatAnswerValue(value)} />
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
