'use client'

import { GdgInput } from '@/components/ui/input/GdgInput'
import { MajorAutocomplete } from '@/components/ui/input/MajorAutocomplete'
import { usePhoneNumber } from '@/hooks/usePhoneNumber'

export default function AdditionalInfoForm({
  major,
  setMajor,
  studentId,
  setStudentId,
  phoneNumber,
  setPhoneNumber
}) {
  const { formatInput } = usePhoneNumber()

  return (
    <div className="w-full">
      <div className="flex flex-col w-full mt-10 gap-2">
        <p className="text-[#e1e1e1] text-[12px] leading-[18px] font-medium">전공</p>
        <MajorAutocomplete value={major} onChangeAction={setMajor} />
      </div>

      <div className="flex flex-row w-full mt-6">
        <GdgInput
          label="학번"
          labelPlacement="outside"
          type="text"
          placeholder="학번을 입력해주세요"
          className="w-full"
          value={studentId}
          onValueChange={setStudentId}
        />
      </div>

      <div className="flex flex-row w-full mt-6 mb-4">
        <GdgInput
          label="전화번호"
          labelPlacement="outside"
          type="tel"
          placeholder="전화번호를 입력해주세요 (예: 010-1234-5678)"
          className="w-full"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatInput(e.target.value))}
        />
      </div>
    </div>
  )
}
