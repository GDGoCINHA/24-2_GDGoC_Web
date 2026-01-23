'use client'

import { majorOptions } from '@/constant/majorOptions'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import CustomCheckbox from './CustomCheckbox'
import Image from 'next/image'
import axios from 'axios'
import Tag from '@/components/ui/Tag/Tag'

export default function RecruitCore() {
  const { accessToken } = useAuth()
  const steps = ['기본정보', '내용작성', '일정안내', '약관동의']
  const [scheduleChecked, setScheduleChecked] = useState(false)
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    major: '',
    phone: '',
    team: '',
    motivation: '',
    role: '',
    strength: '',
    determination: '',
    files: []
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'portfolio' && files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        file: file
      }))
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }))
      // Reset file input
      e.target.value = ''
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateCurrentStep = () => {
    const newErrors = {}

    if (currentStep === 0) {
      // Step 0: 기본정보
      if (!formData.name.trim()) newErrors.name = true
      if (!formData.studentId.trim()) newErrors.studentId = true
      if (!formData.email.trim()) newErrors.email = true
      if (!formData.major.trim()) newErrors.major = true
      if (!formData.phone.trim()) newErrors.phone = true
    } else if (currentStep === 1) {
      // Step 1: 내용작성
      if (!formData.team.trim()) newErrors.team = true
      if (!formData.motivation.trim()) newErrors.motivation = true
      if (!formData.role.trim()) newErrors.role = true
      if (!formData.strength.trim()) newErrors.strength = true
      if (!formData.determination.trim()) newErrors.determination = true
    } else if (currentStep === 2) {
      // Step 2: 일정안내
      if (!scheduleChecked) newErrors.scheduleCheck = true
    } else if (currentStep === 3) {
      // Step 3: 약관동의
      if (!agreementChecked) newErrors.agreementCheck = true
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 현재 step 검증
    if (!validateCurrentStep()) {
      return
    }

    if (currentStep < steps.length - 1) {
      // 마지막 단계가 아니면 다음 스텝으로
      setCurrentStep(currentStep + 1)
      setErrors({})
    } else {
      // 마지막 단계면 제출
      try {
        const payload = {
          snapshot: {
            name: formData.name,
            phone: formData.phone,
            major: formData.major
          },
          team: formData.team,
          motivation: formData.motivation,
          wish: formData.role,
          strengths: formData.strength,
          pledge: formData.determination,
          fileUrls: []
        }

        console.log('[지원서 제출] 요청 데이터:', payload)

        const response = await axios.post('/api/recruit/core/applications', payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        })

        console.log('[지원서 제출] 성공:', response.status, response.data)
        alert('지원서가 제출되었습니다!')
      } catch (error) {
        console.log('[지원서 제출] 에러:', error.response?.status, error.response?.data)
        if (error.response?.status === 409) {
          alert('이미 지원이 완료되었습니다.')
        } else {
          alert('지원서 제출 중 오류가 발생했습니다.')
        }
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <main className="bg-black relative flex min-h-screen justify-center">
      <div className="max-w-85.75 md:max-w-137.5 w-full mx-auto my-12 min-h-screen text-white">
        {/* ----- Header ----- */}
        <div className="flex gap-3 mb-8 items-center">
          <Image
            src="/icons/logo/gdgoc.png"
            alt="GDGoC_Icon"
            width={40}
            height={18}
            className="w-10 h-4.5"
          />
          <h1 className="text-white text-2xl font-bold">Core Member 지원</h1>
          <Tag label="접수중" color="green" variant="glass" size="default" />
        </div>

        {/* ----- Step Bar ----- */}
        <div className="flex items-center mb-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : 'flex-initial'}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full flex items-center justify-center px-3 py-2 whitespace-nowrap text-sm ${
                    index === currentStep
                      ? 'bg-red'
                      : index < currentStep
                        ? 'border border-red'
                        : 'border text-gray-600'
                  }`}
                >
                  {step}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 ${index < currentStep ? 'bg-red' : 'bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ----- Form ----- */}
        <form onSubmit={handleSubmit} noValidate>
          {/* 기본정보 (Step 0) */}
          {currentStep === 0 && (
            <>
              <div className="text-white mb-6 bg-gray-100 px-3 py-4 rounded-xl">
                <ul className="list-disc pl-5 space-y-1">
                  <li>아래 정보는 회원가입 시 입력한 정보를 기반으로 자동 입력됩니다.</li>
                  <li>지원서 제출 시점의 정보를 기준으로 저장됩니다.</li>
                  <li>예상 소요 시간: 약 10~15분</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="col-span-1">
                  <label htmlFor="name" className="block mb-1 text-white font-bold">
                    이름 <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`ml-0! w-full p-2.5 text-base bg-gray-300 border rounded-full ${
                      errors.name ? 'border-red' : 'border-none'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="studentId" className="block mb-1 text-white font-bold">
                    학번 <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`ml-0! w-full p-2.5 text-base bg-gray-300 border rounded-full ${
                      errors.studentId ? 'border-red' : 'border-none'
                    }`}
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label htmlFor="email" className="block mb-1 text-white font-bold">
                    이메일 <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`ml-0! w-full p-2.5 text-base bg-gray-300 border rounded-full ${
                      errors.email ? 'border-red' : 'border-none'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="major" className="block mb-1 text-white font-bold">
                  주전공 <span className="text-red">*</span>
                </label>
                <select
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 text-base  border border-gray-800 rounded-full cursor-pointer "
                >
                  {majorOptions.map((section) => (
                    <optgroup className="bg-gray-100" label={section.title} key={section.title}>
                      {section.items.map((item) => (
                        <option
                          className="bg-gray-100 hover:bg-white"
                          key={item.key}
                          value={item.value}
                        >
                          {item.value}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.major && <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block mb-1 text-white font-bold">
                  전화번호 <span className="text-red">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`ml-0! w-full p-2.5 text-base border rounded-full ${
                    errors.phone ? 'border-red' : 'border-gray-800'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>}
              </div>
            </>
          )}

          {/* 내용작성 (Step 1) */}
          {currentStep === 1 && (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-white font-bold">
                    희망 팀 <span className="text-red">*</span>
                  </label>
                </div>

                <div className="grid w-full gap-3 grid-cols-2 md:grid-cols-4">
                  <div className="w-full">
                    <input
                      id="team-hr"
                      name="team"
                      type="radio"
                      value="HR"
                      checked={formData.team === 'HR'}
                      onChange={handleChange}
                      className="peer hidden"
                    />
                    <label
                      htmlFor="team-hr"
                      className="flex items-center justify-center w-full py-3 border border-gray-800 rounded-full text-white cursor-pointer transition-all  peer-checked:bg-[#471815] peer-checked:border-red"
                    >
                      HR
                    </label>
                  </div>

                  <div className="w-full">
                    <input
                      id="team-bd"
                      name="team"
                      type="radio"
                      value="BD"
                      checked={formData.team === 'BD'}
                      onChange={handleChange}
                      className="peer hidden"
                    />
                    <label
                      htmlFor="team-bd"
                      className="flex items-center justify-center w-full py-3 border border-gray-800 rounded-full text-white cursor-pointer transition-all  peer-checked:bg-[#471815] peer-checked:border-red"
                    >
                      BD
                    </label>
                  </div>

                  <div className="w-full">
                    <input
                      id="team-tech"
                      name="team"
                      type="radio"
                      value="TECH"
                      checked={formData.team === 'TECH'}
                      onChange={handleChange}
                      className="peer hidden"
                    />
                    <label
                      htmlFor="team-tech"
                      className="flex items-center justify-center w-full py-3 border border-gray-800 rounded-full text-white cursor-pointer transition-all  peer-checked:bg-[#471815] peer-checked:border-red"
                    >
                      TECH
                    </label>
                  </div>

                  <div className="w-full">
                    <input
                      id="team-design"
                      name="team"
                      type="radio"
                      value="PR/DESIGN"
                      checked={formData.team === 'PR/DESIGN'}
                      onChange={handleChange}
                      className="peer hidden"
                    />
                    <label
                      htmlFor="team-design"
                      className="flex items-center justify-center w-full py-3 border border-gray-800 rounded-full text-white cursor-pointer transition-all  peer-checked:bg-[#471815] peer-checked:border-red"
                    >
                      PR·DESIGN
                    </label>
                  </div>
                </div>
                {errors.team && <p className="mt-1 text-xs text-red">※ 필수 선택 사항입니다.</p>}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="motivation" className="block text-white font-bold">
                    지원 동기 <span className="text-red">*</span>
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    maxLength={500}
                    rows={6}
                    className={`w-full p-3 text-base border rounded-xl resize-none ${
                      errors.motivation ? 'border-red' : 'border-gray-800'
                    }`}
                    placeholder="내용을 입력하세요."
                  />{' '}
                  <span className="absolute bottom-4 right-4 text-sm text-gray-700">
                    ({formData.motivation.length} / 500)
                  </span>
                </div>
                {errors.motivation && (
                  <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="role" className="block text-white font-bold">
                    희망 역할 및 수행하고 싶은 업무 <span className="text-red">*</span>
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    maxLength={500}
                    rows={6}
                    className={`w-full p-3 text-base border rounded-xl resize-none ${
                      errors.role ? 'border-red' : 'border-gray-800'
                    }`}
                    placeholder="내용을 입력하세요."
                  />
                  <span className="absolute bottom-4 right-4 text-sm text-gray-700">
                    ({formData.role.length} / 500)
                  </span>
                </div>
                {errors.role && <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="strength" className="block text-white font-bold">
                    본인의 강점 <span className="text-red">*</span>
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    id="strength"
                    name="strength"
                    value={formData.strength}
                    onChange={handleChange}
                    maxLength={500}
                    rows={6}
                    className={`w-full p-3 text-base border rounded-xl resize-none ${
                      errors.strength ? 'border-red' : 'border-gray-800'
                    }`}
                    placeholder="내용을 입력하세요."
                  />
                  <span className="absolute bottom-4 right-4 text-sm text-gray-700">
                    ({formData.strength.length} / 500)
                  </span>
                </div>
                {errors.strength && (
                  <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="determination" className="block text-white font-bold">
                    각오 <span className="text-red">*</span>
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    id="determination"
                    name="determination"
                    value={formData.determination}
                    onChange={handleChange}
                    maxLength={100}
                    rows={3}
                    className={`w-full p-3 text-base border rounded-xl resize-none ${
                      errors.determination ? 'border-red' : 'border-gray-800'
                    }`}
                    placeholder="내용을 입력하세요."
                  />
                  <span className="absolute bottom-4 right-4 text-sm text-gray-700">
                    ({formData.determination.length} / 100)
                  </span>
                </div>
                {errors.determination && (
                  <p className="mt-1 text-xs text-red">※ 필수 입력 사항입니다.</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex gap-2.5 items-center mb-3">
                  <label htmlFor="portfolio" className="block text-white font-bold">
                    파일 첨부
                  </label>
                  <span className="text-xs text-gray-700">다중 파일 업로드 가능</span>
                </div>

                {/* File List */}
                {formData.files.length > 0 && (
                  <div className="mb-4 ">
                    <ul className="space-y-2">
                      {formData.files.map((file, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center text-sm text-gray-700 bg-gray-200 p-2 rounded"
                        >
                          <span className="truncate">
                            {file.name} ({formatFileSize(file.size)})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="ml-2 text-red hover:text-red font-bold"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="portfolio"
                  name="portfolio"
                  onChange={handleChange}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                  className="hidden"
                />

                {/* Custom Button */}
                <label
                  htmlFor="portfolio"
                  className="block w-full py-3 px-4 bg-red text-white rounded-xl text-center cursor-pointer  transition"
                >
                  + 파일선택
                </label>
              </div>
            </>
          )}

          {/* 일정안내 (Step 2) */}
          {currentStep === 2 && (
            <>
              <h2>모집 일정</h2>
              <div className="text-white mb-6 bg-gray-100 px-3 py-4 rounded-xl">
                <ul className="space-y-3">
                  <li className="flex">
                    <span>✅</span>
                    <span>서류 지원 기간:</span>
                  </li>
                  <li className="flex">
                    <span>✅</span>
                    <span>서류 결과 발표:</span>
                  </li>
                  <li>
                    <div className="flex">
                      <span>✅</span>
                      <span>면접 진행 기간:</span>
                    </div>
                    <div className="text-sm text-gray-700 ml-6 ">
                      * 지원자 및 면접관 일정에 따라 마감 전 면접이 가능할 수 있습니다.
                    </div>
                  </li>
                  <li className="flex">
                    <span>✅</span>
                    <span>최종 결과 발표:</span>
                  </li>
                </ul>
              </div>

              <h2>면접 안내</h2>
              <div className="text-white mb-6 bg-gray-100 px-3 py-4 rounded-xl">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    원칙적으로 대면 면접을 진행하며, 부득이한 경우 비대면으로 조정될 수 있습니다.
                  </li>
                  <li>면접은 인하대학교 내부 장소에서 진행됩니다.</li>
                </ul>
              </div>

              <h2>활동 안내</h2>
              <div className="text-white mb-6 bg-gray-100 px-3 py-4 rounded-xl">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <div className="flex">
                      <span>
                        운영진으로 활동 시, 매주 1회 정기 운영진 회의에 필수 참석해야 합니다.
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 ml-6 ">
                      * 일정은 1월 내로 공지 드립니다.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex w-full mb-6">
                <div className="flex flex-col items-end w-full">
                  <CustomCheckbox
                    checked={scheduleChecked}
                    onChange={() => setScheduleChecked(!scheduleChecked)}
                    required={true}
                    label="전체 일정을 확인하였습니다."
                  />
                  {errors.scheduleCheck && (
                    <p className="mt-1 text-xs text-red">※ 미확인 시 지원서 제출이 불가합니다.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 약관동의 (Step 3) */}
          {currentStep === 3 && (
            <>
              <h2>개인정보 수집 및 이용 동의</h2>
              <div className="text-white mb-6 bg-gray-100 px-3 py-4 rounded-xl">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span>
                      개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보
                      수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및
                      이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서
                      내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용
                      개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보
                      수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및
                      이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서
                      내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용
                      개인정보 수집 및 이용동의서 내용 개인정보 수 개인정보 수집 및 이용동의서 내용
                      개인정보 수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보
                      수집 및 이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보 수집 및
                      이용동의서 내용 개인정보 수집 및 이용동의서 내용 개인정보
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex w-full mb-6">
                <div className="flex flex-col items-end w-full">
                  <CustomCheckbox
                    checked={agreementChecked}
                    onChange={() => setAgreementChecked(!agreementChecked)}
                    required={true}
                  />
                  {errors.agreementCheck && (
                    <p className="mt-1 text-xs text-red">※ 미동의 시 지원서 제출이 불가합니다.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-4 justify-end">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className=" px-12 py-3 text-base font-bold bg-gray-600 text-white border-0 rounded-full cursor-pointer hover:bg-gray-700 transition"
              >
                이전
              </button>
            )}
            <button
              type="submit"
              className={`px-12 py-3 text-base font-bold bg-red text-white border-0 rounded-full cursor-pointer  transition`}
            >
              {currentStep === steps.length - 1 ? '제출하기' : '다음'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
