'use client'

import { useState } from 'react'

import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_INPUT,
  DUSK_INPUT_READONLY,
  DUSK_OPTION,
  DUSK_PRIMARY_BUTTON,
  DUSK_SELECT
} from '@/components/ui/dusk/DuskForm'
import { formatMajorLabel, majorOptions } from '@/constant/majorOptions'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import type { UpdateProfilePayload, UserProfile } from '@/types/profile'
import { formatPhoneNumberInput } from '@/utils/phoneNumber'

// 서버의 PATCH /api/v1/users/me 검증(^01[0-9]\d{7,8}$)과 같은 범위를 쓴다.
// 공유 유틸 isPhoneNumberFormatValid는 010 11자리만 허용해, DB에 남아 있는
// 011·016 번호를 가진 사용자가 이름만 고쳐도 저장할 수 없게 만든다.
const PROFILE_PHONE_PATTERN = /^01[0-9]\d{7,8}$/

interface ProfileInfoSectionProps {
  profile: UserProfile
  onSave: (payload: UpdateProfilePayload) => Promise<void>
  saving?: boolean
  error?: string | null
}

export default function ProfileInfoSection({
  profile,
  onSave,
  saving = false,
  error = null
}: ProfileInfoSectionProps) {
  const { formatInput, toDigits } = usePhoneNumber()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name)
  const [major, setMajor] = useState(profile.major)
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumberInput(profile.phoneNumber))

  const startEditing = () => {
    setName(profile.name)
    setMajor(profile.major)
    setPhoneNumber(formatPhoneNumberInput(profile.phoneNumber))
    setEditing(true)
  }

  const cancelEditing = () => setEditing(false)

  const isPhoneValid = PROFILE_PHONE_PATTERN.test(toDigits(phoneNumber))
  const canSave = name.trim().length > 0 && major.length > 0 && isPhoneValid

  const handleSave = async () => {
    if (!canSave) return
    try {
      await onSave({
        name: name.trim(),
        major,
        phoneNumber: toDigits(phoneNumber)
      })
      setEditing(false)
    } catch {
      // 부모가 에러 메시지를 렌더링한다. 편집 모드를 유지해 사용자가 재시도할 수 있다.
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-[-0.02em]">사용자 개인정보</h2>
        {!editing && (
          <button type="button" onClick={startEditing} className={DUSK_PRIMARY_BUTTON}>
            수정하기
          </button>
        )}
      </div>

      <div className="mt-[26px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <DuskField label="이름">
          <input
            type="text"
            value={editing ? name : profile.name}
            disabled={!editing}
            onChange={(event) => setName(event.target.value)}
            // 서버의 @Size(max = 30)과 같은 범위를 쓴다.
            maxLength={30}
            className={editing ? DUSK_INPUT : DUSK_INPUT_READONLY}
          />
        </DuskField>

        {/* 학번·이메일은 고칠 수 없다. 편집 중에도 흐린 채로 둔다. */}
        <DuskField label="학번">
          <input type="text" value={profile.studentId} disabled className={DUSK_INPUT_READONLY} />
        </DuskField>

        <DuskField label="학과">
          {editing ? (
            <select
              value={major}
              onChange={(event) => setMajor(event.target.value)}
              className={DUSK_SELECT}
            >
              {majorOptions.map((group) => (
                <optgroup key={group.title} label={group.title} className={DUSK_OPTION}>
                  {group.items.map((item) => (
                    <option key={item.code} value={item.code} className={DUSK_OPTION}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            // 서버는 학과를 코드(ME)로 저장한다. 사람이 읽는 이름으로 바꿔 보여준다.
            <input
              type="text"
              value={formatMajorLabel(profile.major)}
              disabled
              className={DUSK_INPUT_READONLY}
            />
          )}
        </DuskField>

        <DuskField
          label="전화번호"
          error={editing && !isPhoneValid ? '전화번호 형식을 확인해 주세요.' : undefined}
        >
          <input
            type="tel"
            value={editing ? phoneNumber : formatPhoneNumberInput(profile.phoneNumber)}
            disabled={!editing}
            onChange={(event) => setPhoneNumber(formatInput(event.target.value))}
            className={editing ? DUSK_INPUT : DUSK_INPUT_READONLY}
          />
        </DuskField>
      </div>

      <DuskField label="이메일" className="mt-[18px]">
        <input type="email" value={profile.email} disabled className={DUSK_INPUT_READONLY} />
      </DuskField>

      {error && <p className="mt-4 text-sm text-signal-err">{error}</p>}

      {editing && (
        <div className="mt-[22px] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={cancelEditing}
            disabled={saving}
            className={DUSK_CANCEL_BUTTON}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="whitespace-nowrap rounded-full bg-ember px-[26px] py-4 text-[15px] font-medium text-ember-ink transition-colors hover:bg-dusk-ink-100 hover:text-dusk-base disabled:opacity-50"
          >
            {saving ? '저장 중…' : '저장하기'}
          </button>
        </div>
      )}
    </section>
  )
}
