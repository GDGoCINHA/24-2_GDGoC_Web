'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import AdminHeader from '@/components/admin/dashboard/AdminHeader'
import {
  ADMIN_ACCENT_BUTTON,
  ADMIN_CAPTION,
  ADMIN_CELL_SELECT,
  ADMIN_CONTAINER,
  ADMIN_ERROR_BANNER,
  ADMIN_GHOST_BUTTON,
  ADMIN_OPTION,
  ADMIN_PAGE,
  ADMIN_TITLE
} from '@/components/admin/dashboard/adminStyles'
import FormPreview from '@/components/eventApplication/FormPreview'
import QuestionEditor, { conditionCandidates } from '@/components/eventApplication/QuestionEditor'
import Loader from '@/components/ui/common/Loader'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  addQuestion,
  createEventForm,
  deleteEventForm,
  deleteQuestion,
  publishEventForm,
  fetchEventForm,
  reorderQuestions,
  updateEventForm,
  updateQuestion
} from '@/services/eventApplication/eventApplicationClient'
import type { EventForm, QuestionSavePayload } from '@/types/eventApplication'
import type { UserRoleValue } from '@/types/profile'

const HEADER_LINKS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '행사 게시판', href: '/board/events' }
]

const INPUT =
  'rounded-[10px] border border-admin-line bg-admin-card px-3 py-2 text-[14px] text-admin-ink outline-none transition-colors duration-200 focus:border-admin-accent'

const LABEL = 'text-[12px] tracking-[0.06em] text-admin-ink-dim'

/** 신청 자격으로 고를 수 있는 등급. 그 위 등급은 운영진뿐이라 폼 자격으로 둘 이유가 없다. */
type FormStatus = 'DRAFT' | 'OPEN' | 'CLOSED'

/** 발행 여부와 isOpen 은 다른 축이다 — 발행은 "드러냈는가", isOpen 은 "지금 받는가". */
const formStatusOf = (form: EventForm): FormStatus =>
  !form.publishedAt ? 'DRAFT' : form.isOpen ? 'OPEN' : 'CLOSED'

const STATUS_LABEL: Record<FormStatus, string> = {
  DRAFT: '작성 중',
  OPEN: '신청 받는 중',
  CLOSED: '마감'
}

const BADGE = 'rounded-full px-3 py-1 text-[12px] tracking-[0.04em]'

const STATUS_BADGE: Record<FormStatus, string> = {
  DRAFT: `${BADGE} border border-admin-line text-admin-ink-dim`,
  OPEN: `${BADGE} bg-admin-accent text-admin-accent-ink`,
  CLOSED: `${BADGE} border border-admin-line text-admin-ink-muted`
}

const MIN_ROLE_CHOICES: { value: UserRoleValue; label: string }[] = [
  { value: 'GUEST', label: '로그인한 누구나 (부원 아니어도)' },
  { value: 'MEMBER', label: '부원부터' },
  { value: 'CORE', label: '코어부터' }
]

export default function EventFormBuilderPage() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const eventBoardId = idParam ? Number(idParam) : NaN

  const { apiClient } = useAuthenticatedApi()

  const [form, setForm] = useState<EventForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [closesAt, setClosesAt] = useState('')
  const [capacity, setCapacity] = useState('')
  const [minRole, setMinRole] = useState<UserRoleValue>('MEMBER')
  const [isOpen, setIsOpen] = useState(true)

  const load = useCallback(async () => {
    if (Number.isNaN(eventBoardId)) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const loaded = await fetchEventForm(apiClient, eventBoardId)
      setForm(loaded)
      setClosesAt(toLocalInput(loaded.closesAt))
      setCapacity(loaded.capacity == null ? '' : String(loaded.capacity))
      setMinRole(loaded.minRole)
      setIsOpen(loaded.isOpen)
    } catch (e) {
      // 폼이 아직 없는 행사는 404 다. 만들기 전 상태이므로 오류가 아니다.
      if (statusOf(e) === 404) setForm(null)
      else setError(readErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [apiClient, eventBoardId])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (task: () => Promise<unknown>) => {
    setSaving(true)
    setError(null)
    try {
      await task()
      await load()
    } catch (e) {
      setError(readErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = () =>
    run(() => createEventForm(apiClient, eventBoardId, { minRole: 'MEMBER', isOpen: true }))

  const handleSaveSettings = () =>
    run(() =>
      updateEventForm(apiClient, eventBoardId, {
        closesAt: closesAt === '' ? null : new Date(closesAt).toISOString(),
        capacity: capacity === '' ? null : Number(capacity),
        clearCapacity: capacity === '',
        minRole,
        isOpen
      })
    )

  const handleAddQuestion = () =>
    run(() =>
      addQuestion(apiClient, eventBoardId, {
        type: 'SHORT_TEXT',
        label: '새 질문',
        isRequired: false
      })
    )

  const handleSaveQuestion = (questionId: number, payload: QuestionSavePayload) =>
    run(() => updateQuestion(apiClient, eventBoardId, questionId, payload))

  const handleDeleteQuestion = (questionId: number) =>
    run(() => deleteQuestion(apiClient, eventBoardId, questionId))

  const handleMove = (index: number, direction: -1 | 1) => {
    if (!form) return
    const ids = form.questions.map((question) => question.id)
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    return run(() => reorderQuestions(apiClient, eventBoardId, ids))
  }

  const handlePublish = () => run(() => publishEventForm(apiClient, eventBoardId))

  const handleDeleteForm = () => run(() => deleteEventForm(apiClient, eventBoardId))

  if (Number.isNaN(eventBoardId)) {
    return (
      <main className={ADMIN_PAGE}>
        <AdminHeader links={HEADER_LINKS} />
        <section className={`${ADMIN_CONTAINER} pt-10`}>
          <p className={ADMIN_ERROR_BANNER}>행사를 찾을 수 없습니다. 주소를 확인해주세요.</p>
        </section>
      </main>
    )
  }

  return (
    <main className={ADMIN_PAGE}>
      <AdminHeader links={HEADER_LINKS} />
      <Loader isLoading={loading} />

      <section className={`${ADMIN_CONTAINER} pt-[clamp(20px,2.5vw,32px)]`}>
        <p data-admin-reveal className={ADMIN_CAPTION}>
          신청 폼
        </p>
        <div data-admin-reveal className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={ADMIN_TITLE}>{form?.eventTitle ?? '행사 신청 폼'}</h1>
            {form && (
              <span className={STATUS_BADGE[formStatusOf(form)]}>
                {STATUS_LABEL[formStatusOf(form)]}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/board/events/detail/?id=${eventBoardId}`} className={ADMIN_GHOST_BUTTON}>
              행사 글 보기
            </Link>
            {form && (
              <Link
                href={`/dashboard/events/applicants/?id=${eventBoardId}`}
                className={ADMIN_GHOST_BUTTON}
              >
                신청자 {form.appliedCount}명
              </Link>
            )}
          </div>
        </div>

        {form && !form.publishedAt && (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-[20px] border border-admin-line-accent bg-admin-card p-5">
            <p className="text-[15px] text-admin-ink">아직 부원에게 보이지 않습니다.</p>
            <p className="text-[13px] leading-[1.7] text-admin-ink-dim">
              지금은 이 화면에서만 보입니다. 질문을 다 넣고 미리보기로 확인한 뒤 공개하세요.
              공개하기 전까지는 무엇이든 몇 번이든 고칠 수 있습니다.
              <br />
              공개한 뒤에는 되돌릴 수 없습니다 — 그만 받고 싶을 때는 아래의 「지금 신청 받는 중」을
              끄면 됩니다.
            </p>
            <button
              type="button"
              className={ADMIN_ACCENT_BUTTON}
              disabled={saving}
              onClick={handlePublish}
            >
              신청 폼 공개하기
            </button>
          </div>
        )}

        {error && <p className={ADMIN_ERROR_BANNER}>{error}</p>}

        {!loading && !form && (
          <div className="mt-8 flex flex-col items-start gap-3 rounded-[20px] border border-admin-line-soft bg-admin-card p-6">
            <p className="text-[15px] text-admin-ink">이 행사는 아직 신청을 받지 않습니다.</p>
            <p className="text-[13px] leading-[1.7] text-admin-ink-dim">
              폼을 만들어도 곧바로 공개되지 않습니다. 질문을 다 넣고 공개 버튼을 눌러야 부원에게
              보입니다. 질문 없이 참가 신청만 받을 수도 있습니다.
            </p>
            <button
              type="button"
              className={ADMIN_ACCENT_BUTTON}
              disabled={saving}
              onClick={handleCreate}
            >
              폼 만들기
            </button>
          </div>
        )}

        {form && (
          <>
            <div className="mt-8 flex flex-col gap-4 rounded-[20px] border border-admin-line-soft bg-admin-card p-5">
              <p className="text-[14px] font-medium text-admin-ink">신청 설정</p>

              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>마감 일시</span>
                  <input
                    type="datetime-local"
                    className={INPUT}
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>정원 (비우면 무제한)</span>
                  <input
                    type="number"
                    min={1}
                    className={INPUT}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>신청 자격</span>
                  <select
                    className={ADMIN_CELL_SELECT}
                    value={minRole}
                    onChange={(e) => setMinRole(e.target.value as UserRoleValue)}
                  >
                    {MIN_ROLE_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value} className={ADMIN_OPTION}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] text-admin-ink-dim">
                    어느 쪽이든 로그인이 필요합니다
                  </span>
                </label>

                <label className="flex items-end gap-2 pb-2 text-[13px] text-admin-ink-muted">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    className="size-[15px] cursor-pointer accent-admin-accent"
                  />
                  지금 신청 받는 중
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={ADMIN_ACCENT_BUTTON}
                  disabled={saving}
                  onClick={handleSaveSettings}
                >
                  설정 저장
                </button>
                {form.appliedCount === 0 && (
                  <button
                    type="button"
                    className={ADMIN_GHOST_BUTTON}
                    disabled={saving}
                    onClick={handleDeleteForm}
                  >
                    신청 받기 해제
                  </button>
                )}
              </div>

              {form.capacity != null && form.appliedCount >= form.capacity && (
                <p className="text-[13px] text-signal-ok">
                  정원 {form.capacity}명이 모두 찼습니다. 새 신청은 서버가 자동으로 막으므로 따로
                  닫지 않아도 됩니다. 정원을 늘리면 그 즉시 다시 받습니다.
                </p>
              )}

              {form.appliedCount > 0 && (
                <p className="text-[12px] text-admin-ink-dim">
                  신청자가 {form.appliedCount}명 있어 질문 유형·선택지를 바꾸거나 선택 질문을 필수로
                  올릴 수 없습니다. 문구와 순서는 고칠 수 있습니다.
                </p>
              )}
            </div>

            <FormPreview questions={form.questions} />

            <div className="mt-6 flex flex-col gap-3 pb-12">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-admin-ink">
                  질문 {form.questions.length}개
                </p>
                <button
                  type="button"
                  className={ADMIN_ACCENT_BUTTON}
                  disabled={saving}
                  onClick={handleAddQuestion}
                >
                  질문 추가
                </button>
              </div>

              {form.questions.length === 0 && (
                <p className="rounded-[16px] border border-dashed border-admin-line px-4 py-8 text-center text-[14px] text-admin-ink-dim">
                  질문이 없습니다. 이대로 두면 버튼만 눌러 참가 신청하는 폼이 됩니다.
                </p>
              )}

              {form.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  candidates={conditionCandidates(form.questions, question)}
                  locked={form.appliedCount > 0}
                  saving={saving}
                  onSave={(payload) => handleSaveQuestion(question.id, payload)}
                  onDelete={() => handleDeleteQuestion(question.id)}
                  onMove={(direction) => handleMove(index, direction)}
                  canMoveUp={index > 0 && !saving}
                  canMoveDown={index < form.questions.length - 1 && !saving}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

/** datetime-local 은 초·타임존이 없는 로컬 문자열을 받는다. */
const toLocalInput = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const statusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status

const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? '처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
