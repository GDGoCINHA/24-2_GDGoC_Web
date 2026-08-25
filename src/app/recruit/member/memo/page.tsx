'use client'

import { type FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

import Link from 'next/link'

import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import { GdgLogo } from '@/components/ui/design-system'
import {
  DuskField,
  DUSK_CANCEL_BUTTON,
  DUSK_CHECKBOX,
  DUSK_INPUT,
  DUSK_SUBMIT_BUTTON
} from '@/components/ui/dusk/DuskForm'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'
import { cn } from '@/utils/cn'

type MemoFormState = {
  name: string
  phoneNumber: string
  email: string
  privacyAgreement: boolean
  freshmanMemoAgreement: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialFormState: MemoFormState = {
  name: '',
  phoneNumber: '',
  email: '',
  privacyAgreement: false,
  freshmanMemoAgreement: false
}

export default function RecruitMemberMemoPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<MemoFormState>(initialFormState)
  const { formatInput, isValidFormat, toDigits } = usePhoneNumber()

  const isPhoneValid = isValidFormat(formData.phoneNumber)
  const isEmailValid = EMAIL_PATTERN.test(formData.email.trim())

  const isFormValid = useMemo(
    () =>
      Boolean(
        formData.name.trim() &&
        isPhoneValid &&
        isEmailValid &&
        formData.privacyAgreement &&
        formData.freshmanMemoAgreement
      ),
    [formData, isEmailValid, isPhoneValid]
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)
    if (!isFormValid) return

    try {
      setIsSaving(true)
      const normalizedPhoneNumber = toDigits(formData.phoneNumber)

      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/recruit/member/memo`, {
        name: formData.name.trim(),
        phoneNumber: normalizedPhoneNumber,
        email: formData.email.trim(),
        privacyAgreement: formData.privacyAgreement,
        freshmanMemoAgreement: formData.freshmanMemoAgreement
      })
      alert('신입생 지원 알림 신청이 완료되었습니다.')
      router.push('/')
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined

      if (errorMessage === '이미 지원을 완료하였습니다.') {
        alert('이미 지원을 완료하였습니다.')
        router.push('/')
      } else {
        alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const nameStatus = isSubmitted && !formData.name.trim() ? 'error' : undefined
  const phoneStatus = isSubmitted && !isPhoneValid ? 'error' : undefined
  const emailStatus = isSubmitted && !isEmailValid ? 'error' : undefined

  return (
    <main className="mx-auto w-full max-w-[760px] px-[clamp(20px,5vw,44px)] pb-[100px] pt-14">
      <Link
        href="/recruit/"
        className="text-[13px] text-dusk-ink-800 transition-colors hover:text-dusk-ink-100"
      >
        ← 지원 종류 선택
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <GdgLogo mode="auto" />
        <h1 className="text-[clamp(24px,2.8vw,34px)] font-semibold leading-[1.26] tracking-[-0.03em]">
          신입생 지원 알림 신청
        </h1>
      </div>

      <p className="mt-7 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-5 py-[18px] text-[15px] leading-[1.7] text-dusk-ink-300">
        신입생은 학번 발급 이후 지원이 가능해요. 정보를 남겨주시면 지원 가능 시점에 안내드립니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-[34px] flex flex-col gap-[22px]">
        <DuskField label="이름" required error={nameStatus ? '※ 필수 입력 사항입니다.' : undefined}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="이름을 입력해 주세요."
            className={cn(DUSK_INPUT, nameStatus && 'border-[rgba(196,88,74,0.6)]')}
          />
        </DuskField>

        <DuskField
          label="전화번호"
          required
          error={phoneStatus ? '※ 010-1234-5678 형식으로 입력해 주세요.' : undefined}
        >
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phoneNumber: formatInput(e.target.value) }))
            }
            placeholder="전화번호를 입력해 주세요. (010-1234-5678)"
            className={cn(DUSK_INPUT, phoneStatus && 'border-[rgba(196,88,74,0.6)]')}
          />
        </DuskField>

        <DuskField
          label="이메일"
          required
          hint="인하대학교 이메일(@inha.edu)이 아니어도 가능합니다."
          error={emailStatus ? '※ 이메일 형식을 확인해 주세요.' : undefined}
        >
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="이메일을 입력해 주세요."
            className={cn(DUSK_INPUT, emailStatus && 'border-[rgba(196,88,74,0.6)]')}
          />
        </DuskField>

        <PrivacyPolicyNotice target="memo" showTitle={false} compact />

        <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
          <input
            type="checkbox"
            checked={formData.privacyAgreement}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, privacyAgreement: e.target.checked }))
            }
            className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
          />
          <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
            개인정보 수집 및 이용, 개인정보 처리방침에 동의합니다.
            <span className="text-signal-err"> *</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[rgba(240,234,228,0.12)] px-[18px] py-4">
          <input
            type="checkbox"
            checked={formData.freshmanMemoAgreement}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, freshmanMemoAgreement: e.target.checked }))
            }
            className={cn(DUSK_CHECKBOX, 'mt-[3px]')}
          />
          <span className="text-[15px] leading-[1.7] text-dusk-ink-400">
            신입생 지원 알림 신청에 동의합니다.
            <span className="text-signal-err"> *</span>
          </span>
        </label>

        <div className="mt-1.5 flex gap-2.5">
          <button
            type="button"
            onClick={() => router.push('/recruit/member')}
            className={DUSK_CANCEL_BUTTON}
          >
            이전
          </button>
          <button type="submit" disabled={!isFormValid || isSaving} className={DUSK_SUBMIT_BUTTON}>
            {isSaving ? '신청 중...' : '신청하기'}
          </button>
        </div>
      </form>
    </main>
  )
}
