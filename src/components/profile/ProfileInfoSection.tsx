'use client'

import { useState } from 'react'

import { GdgButton, GdgInputField, GdgMajorDropdown } from '@/components/ui/design-system'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import type { UpdateProfilePayload, UserProfile } from '@/types/profile'
import { formatPhoneNumberInput } from '@/utils/phoneNumber'

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
  const { formatInput, toDigits, isValidFormat } = usePhoneNumber()

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

  const canSave = name.trim().length > 0 && major.length > 0 && isValidFormat(phoneNumber)

  const handleSave = async () => {
    if (!canSave) return
    await onSave({
      name: name.trim(),
      major,
      phoneNumber: toDigits(phoneNumber)
    })
    setEditing(false)
  }

  return (
    <section className="space-y-4">
      <h2 className="typo-pc-h4 text-white">사용자 개인정보</h2>

      <div className="grid gap-4 pc:grid-cols-2">
        <GdgInputField
          label="이름"
          value={editing ? name : profile.name}
          state={editing ? 'available' : 'disabled'}
          disabled={!editing}
          onChange={(event) => setName(event.target.value)}
          fullWidth
        />
        <GdgInputField label="학번" value={profile.studentId} state="disabled" disabled fullWidth />
      </div>

      <div>
        {editing ? (
          <GdgMajorDropdown value={major} onChangeAction={setMajor} />
        ) : (
          <GdgInputField label="학과" value={profile.major} state="disabled" disabled fullWidth />
        )}
      </div>

      <GdgInputField
        label="전화번호"
        type="tel"
        value={editing ? phoneNumber : formatPhoneNumberInput(profile.phoneNumber)}
        state={
          editing && !isValidFormat(phoneNumber) ? 'error' : editing ? 'available' : 'disabled'
        }
        errorText={
          editing && !isValidFormat(phoneNumber) ? '전화번호 형식을 확인해 주세요.' : undefined
        }
        disabled={!editing}
        onChange={(event) => setPhoneNumber(formatInput(event.target.value))}
        fullWidth
      />

      <GdgInputField label="이메일" value={profile.email} state="disabled" disabled fullWidth />

      {error && <p className="typo-pc-c1 text-red">{error}</p>}

      <div className="flex justify-end gap-2">
        {editing ? (
          <>
            <GdgButton type="button" onClick={cancelEditing} disabled={saving}>
              취소
            </GdgButton>
            <GdgButton type="button" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? '저장 중…' : '저장하기'}
            </GdgButton>
          </>
        ) : (
          <GdgButton type="button" onClick={startEditing}>
            수정하기
          </GdgButton>
        )}
      </div>
    </section>
  )
}
