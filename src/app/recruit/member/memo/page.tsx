'use client'

import { type FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

import { PrivacyPolicyNotice } from '@/components/ui/common/PrivacyPolicyNotice'
import { GdgButton, GdgCheckbox, GdgFieldContainer, GdgInputField, GdgLogo } from '@/components/ui/design-system'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'

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
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined

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
    <main className="min-h-screen bg-black text-white">
      <form onSubmit={handleSubmit} className="pt-18 pb-28 mobile:pt-12 mobile:pb-12">
        <div className="layout-grid layout-grid--narrow-screen layout-grid--4 gap-y-8 mobile:gap-y-6">
          <div className="col-span-4 flex items-center gap-3 mobile:gap-2">
            <GdgLogo mode="auto" />
            <h1 className="typo-pc-h3 mobile:typo-m-h2 text-white">신입생 지원 알림 신청</h1>
          </div>

          <div className="col-span-4 rounded-xl bg-gray-100 px-4 py-3 mobile:px-3.5 mobile:py-3">
            <p className="typo-pc-b2 mobile:typo-m-b3 text-white">
              신입생은 학번 발급 이후 지원이 가능해요. 정보를 남겨주시면 지원 가능 시점에 안내드립니다.
            </p>
          </div>

          <div className="col-span-4 space-y-6">
            <GdgFieldContainer
              label="이름"
              required
              status={nameStatus}
              statusMessage={nameStatus ? '※ 필수 입력 사항입니다.' : undefined}
            >
              <div className="pc:contents hidden">
                <GdgInputField
                  device="pc"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="이름을 입력해 주세요."
                  width="full"
                  state={nameStatus ? 'error' : 'available'}
                />
              </div>
              <div className="pc:hidden contents">
                <GdgInputField
                  device="mobile"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="이름을 입력해 주세요."
                  fullWidth
                  state={nameStatus ? 'error' : 'available'}
                />
              </div>
            </GdgFieldContainer>

            <GdgFieldContainer
              label="전화번호"
              required
              status={phoneStatus}
              statusMessage={phoneStatus ? '※ 010-1234-5678 형식으로 입력해 주세요.' : undefined}
            >
              <div className="pc:contents hidden">
                <GdgInputField
                  device="pc"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: formatInput(e.target.value)
                    }))
                  }
                  placeholder="전화번호를 입력해 주세요. (010-1234-5678)"
                  width="full"
                  state={phoneStatus ? 'error' : 'available'}
                />
              </div>
              <div className="pc:hidden contents">
                <GdgInputField
                  device="mobile"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: formatInput(e.target.value)
                    }))
                  }
                  placeholder="전화번호를 입력해 주세요."
                  fullWidth
                  state={phoneStatus ? 'error' : 'available'}
                />
              </div>
            </GdgFieldContainer>

            <GdgFieldContainer
              label="이메일"
              required
              caption="인하대학교 이메일(@inha.edu)이 아니어도 가능합니다."
              status={emailStatus}
              statusMessage={emailStatus ? '※ 이메일 형식을 확인해 주세요.' : undefined}
            >
              <div className="pc:contents hidden">
                <GdgInputField
                  device="pc"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="이메일을 입력해 주세요."
                  width="full"
                  state={emailStatus ? 'error' : 'available'}
                />
              </div>
              <div className="pc:hidden contents">
                <GdgInputField
                  device="mobile"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="이메일을 입력해 주세요."
                  fullWidth
                  state={emailStatus ? 'error' : 'available'}
                />
              </div>
            </GdgFieldContainer>
          </div>

          <div className="col-span-4 space-y-4 pt-2">
            <PrivacyPolicyNotice target="memo" compact />

            <div className="space-y-3">
              <div className="flex items-center justify-end gap-2">
                <span className="typo-pc-b3 mobile:typo-m-c1 text-red">*</span>
                <p className="typo-pc-b3 mobile:typo-m-c1 text-white text-right">
                  개인정보 처리방침에 동의합니다.
                </p>
                <span className="hidden pc:inline-flex">
                  <GdgCheckbox
                    checked={formData.privacyAgreement}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, privacyAgreement: checked }))
                    }
                    size="pc"
                  />
                </span>
                <span className="inline-flex pc:hidden">
                  <GdgCheckbox
                    checked={formData.privacyAgreement}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, privacyAgreement: checked }))
                    }
                    size="mobile"
                  />
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className="typo-pc-b3 mobile:typo-m-c1 text-red">*</span>
                <p className="typo-pc-b3 mobile:typo-m-c1 text-white text-right">
                  신입생 지원 알림 신청에 동의합니다.
                </p>
                <span className="hidden pc:inline-flex">
                  <GdgCheckbox
                    checked={formData.freshmanMemoAgreement}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, freshmanMemoAgreement: checked }))
                    }
                    size="pc"
                  />
                </span>
                <span className="inline-flex pc:hidden">
                  <GdgCheckbox
                    checked={formData.freshmanMemoAgreement}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, freshmanMemoAgreement: checked }))
                    }
                    size="mobile"
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-4 hidden justify-end gap-5 pt-2 pc:flex">
            <GdgButton
              type="button"
              device="pc"
              size="small"
              variant="default"
              widthToken="small"
              onClick={() => router.push('/recruit/member')}
            >
              이전
            </GdgButton>

            <GdgButton
              type="submit"
              device="pc"
              size="small"
              variant={isFormValid ? 'active' : 'disabled'}
              widthToken="small"
              disabled={!isFormValid || isSaving}
            >
              신청하기
            </GdgButton>
          </div>

          <div className="col-span-4 grid grid-cols-3 gap-2 pt-0 pc:hidden">
            <span aria-hidden />
            <GdgButton
              type="button"
              device="mobile"
              size="small"
              variant="default"
              fullWidth
              onClick={() => router.push('/recruit/member')}
            >
              이전
            </GdgButton>
            <GdgButton
              type="submit"
              device="mobile"
              size="small"
              variant={isFormValid ? 'active' : 'disabled'}
              fullWidth
              disabled={!isFormValid || isSaving}
            >
              신청하기
            </GdgButton>
          </div>
        </div>
      </form>
    </main>
  )
}
