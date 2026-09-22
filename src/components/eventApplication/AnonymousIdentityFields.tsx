'use client'

import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import {
  DuskField,
  DUSK_CHECKBOX,
  DUSK_INPUT,
  DUSK_OPTION,
  DUSK_SELECT
} from '@/components/ui/dusk/DuskForm'
import { majorOptions } from '@/constant/majorOptions'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import type { AnonymousIdentity } from '@/types/eventApplication'
import { cn } from '@/utils/cn'
import { toPhoneDigits } from '@/utils/phoneNumber'

/** 서버 AnonymousApplicationRequest 와 같은 규칙이다. 회원가입과도 같다. */
const STUDENT_ID_PATTERN = /^12\d{6}$/
const PHONE_PATTERN = /^010\d{8}$/

export interface AnonymousIdentityDraft {
  name: string
  studentId: string
  /** 학과 코드. 목록에서만 고르므로 정규화가 필요 없다. */
  major: string
  /** 입력 중 모양(하이픈 포함). 보낼 때 숫자만 남긴다. */
  phoneNumber: string
  privacyAgreed: boolean
}

export const EMPTY_IDENTITY: AnonymousIdentityDraft = {
  name: '',
  studentId: '',
  major: '',
  phoneNumber: '',
  privacyAgreed: false
}

/** 채우지 않았거나 형식이 틀린 칸. 비어 있으면 제출할 수 있다. */
export const missingIdentityFields = (draft: AnonymousIdentityDraft): string[] => {
  const missing: string[] = []
  if (draft.name.trim() === '') missing.push('이름')
  if (!STUDENT_ID_PATTERN.test(draft.studentId)) missing.push('학번')
  if (draft.major === '') missing.push('학과')
  if (!PHONE_PATTERN.test(toPhoneDigits(draft.phoneNumber))) missing.push('연락처')
  if (!draft.privacyAgreed) missing.push('개인정보 동의')
  return missing
}

export const toAnonymousIdentity = (draft: AnonymousIdentityDraft): AnonymousIdentity => ({
  name: draft.name.trim(),
  studentId: draft.studentId,
  major: draft.major,
  phoneNumber: toPhoneDigits(draft.phoneNumber)
})

/**
 * 로그인하지 않은 신청자의 신원 칸.
 *
 * 계정이 없으니 운영진이 누구인지 알 수 있는 최소한만 받는다. 학번은 중복 신청을 막는 기준이고
 * QR 체크인 때 다시 적는 값이라 형식을 맞춰 받는다.
 */
export default function AnonymousIdentityFields({
  value,
  onChange,
  disabled
}: {
  value: AnonymousIdentityDraft
  onChange: (next: AnonymousIdentityDraft) => void
  disabled?: boolean
}) {
  const { formatInput } = usePhoneNumber()
  const set = <K extends keyof AnonymousIdentityDraft>(key: K, next: AnonymousIdentityDraft[K]) =>
    onChange({ ...value, [key]: next })

  const studentIdInvalid = value.studentId !== '' && !STUDENT_ID_PATTERN.test(value.studentId)
  const phoneDigits = toPhoneDigits(value.phoneNumber)
  const phoneInvalid = phoneDigits.length >= 11 && !PHONE_PATTERN.test(phoneDigits)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <DuskField label="이름" required>
          <input
            type="text"
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            // 서버의 @Size(max = 50)과 같다.
            maxLength={50}
            autoComplete="name"
            disabled={disabled}
            className={DUSK_INPUT}
          />
        </DuskField>

        <DuskField
          label="학번"
          required
          error={studentIdInvalid ? '학번 8자리를 확인해 주세요. (예: 12241234)' : undefined}
        >
          <input
            type="text"
            inputMode="numeric"
            value={value.studentId}
            onChange={(e) => set('studentId', e.target.value.replace(/\D/g, ''))}
            maxLength={8}
            disabled={disabled}
            className={DUSK_INPUT}
          />
        </DuskField>

        <DuskField label="학과" required>
          <select
            value={value.major}
            onChange={(e) => set('major', e.target.value)}
            disabled={disabled}
            className={DUSK_SELECT}
          >
            <option value="" className={DUSK_OPTION}>
              학과를 선택하세요
            </option>
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
        </DuskField>

        <DuskField
          label="연락처"
          required
          error={phoneInvalid ? '010 으로 시작하는 번호를 적어 주세요.' : undefined}
        >
          <input
            type="tel"
            value={value.phoneNumber}
            onChange={(e) => set('phoneNumber', formatInput(e.target.value))}
            placeholder="010-0000-0000"
            autoComplete="tel"
            disabled={disabled}
            className={DUSK_INPUT}
          />
        </DuskField>
      </div>

      <PrivacyPolicyNotice target="event" showTitle={false} compact />

      <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
        <input
          type="checkbox"
          checked={value.privacyAgreed}
          onChange={(e) => set('privacyAgreed', e.target.checked)}
          disabled={disabled}
          className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
        />
        <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
          개인정보 수집 및 이용, 개인정보 처리방침에 동의합니다.
          <span className="text-signal-err"> *</span>
        </span>
      </label>
    </div>
  )
}
