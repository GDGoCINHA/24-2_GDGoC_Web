'use client'

import { useState, useEffect } from 'react'
import { MajorAutocomplete } from '@/components/ui/input/MajorAutocomplete'
import { GdgInput } from '@/components/ui/input/GdgInput'

export default function Recruit5({ step, setChecked, updateRecruitData }) {
  const [major, setMajor] = useState('')
  const [doubleMajor, setDoubleMajor] = useState('')

  useEffect(() => {
    const isMajorFilled = major ? major.trim().length : false
    if (step === 5) {
      setChecked(isMajorFilled)
      const formData = {
        major,
        doubleMajor
      }
      updateRecruitData(5, formData)
    }
  }, [major, doubleMajor, step, setChecked, updateRecruitData])

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step - 1 === 5 ? 'opacity-0' : step === 5 ? '' : step + 1 === 5 ? 'opacity-0' : 'hidden'} 
        ${step - 1 === 5 ? '-translate-y-full' : step === 5 ? 'translate-y-0' : step + 1 === 5 ? 'translate-y-full' : ''}`}
    >
      <p className="text-white text-2xl font-semibold mobile:text-xl">필수 개인정보를 적어주세요</p>
      <div className="flex flex-col w-full gap-2 !mt-14">
        <p className="text-[#e1e1e1] text-[12px] leading-[18px] font-medium">주전공</p>
        <MajorAutocomplete value={major} onChangeAction={setMajor} />
      </div>
      <div className="flex flex-col w-full mt-6">
        <p className="text-white text-xl mobile:text-lg">다중전공 (선택)</p>
        <p className="text-white text-base mt-2 mobile:text-sm">
          • 현재 진행 중인 다중 전공(복수전공, 부전공, 융합전공, 연계전공)을 순서에 맞게 띄어쓰기
          없이 정확한 이름으로 입력해주세요.
          <br /> ex) XXX 학과 복수전공, 000학과 융합전공
        </p>
        <GdgInput
          value={doubleMajor}
          onValueChange={setDoubleMajor}
          labelPlacement="outside"
          placeholder="다중전공이 있을경우 입력해주세요."
          className="!mt-5"
        />
      </div>
    </div>
  )
}
