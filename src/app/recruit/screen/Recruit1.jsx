"use client";

import { useState, useEffect } from 'react';
import { Checkbox } from "@nextui-org/react"


export default function Recruit1({ step, setChecked, updateRecruitData }) {
  const [isAgree, setIsAgree] = useState(false);

  useEffect(() => {
    if (step === 1) {
      setChecked(isAgree);
    }
  }, [isAgree, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out ${
        step - 1 == 1 ? 'opacity-0' : step == 1 ? '' : step + 1 == 1 ? 'opacity-0' : 'hidden'
      } ${step - 1 == 1 ? '-translate-y-full' : step == 1 ? 'translate-y-0' : step + 1 == 1 ? 'translate-y-full' : ''}`}
    >
      <p className='text-white text-3xl font-semibold'>
        아래와 같이 개인정보를 처리하고 제3자에게 제공하는데 동의하십니까?
      </p>
      <div className='flex flex-col w-full bg-[#95959514] h-[358px] mt-[47px] p-2 rounded-2xl border-1 border-[#ffffff34] overflow-y-scroll'>
        <p className='text-white text-3xl font-semibold'>GDG on Campus INHA 개인정보 수집·이용, 제3자 제공 동의서</p>
        <br />
        <p className='text-white text-base font-semibold'>
          Google Developer Groups Campus INHA(이하, “이 동아리”라 한다)는 이 동아리의 운영을 위하여 대한민국 「개인정보
          보호법(법률 제19234호)」에 따라 아래와 같이 개인정보를 수집·이용 및 제3자 제공하고자 합니다. 내용을 자세히
          읽은 후 동의 여부를 결정하여 주십시오.
        </p>
        <br />
        <p className='text-white text-2xl font-semibold'>■ 개인정보 수집·이용 및 제3자 제공 항목</p>
        <p className='text-white text-base font-medium'>
          인하대학교 등록 및 졸업·수료·휴학 여부, 성명, 소속 대학(원) 및 전공, 학년, 학번, 전화번호, 이메일, 성별,
          출생일, 국적, 기타 이 동아리 지원서에 지원자가 제공한 정보
        </p>
        <br />
        <p className='text-white text-2xl font-semibold'>■ 개인정보 수집·이용 및 제3자 제공 목적</p>
        <p className='text-white text-base font-medium'>1. 이 동아리의 운영 및 관리</p>
        <p className='text-white text-base font-medium'>2. 이 동아리가 참여하는 행사 및 프로그램 운영 및 관리</p>
        <br />
        <p className='text-white text-2xl font-semibold'>■ 개인정보 제공받는 자 (제3자)</p>
        <p className='text-white text-base font-medium'>구글코리아(유), 정석인하학원(학), 인하대학교 동아리연합회</p>
        <br />
        <p className='text-white text-2xl font-semibold'>■ 개인정보 보유·이용 및 제3자 제공 기간</p>
        <p className='text-white text-base font-medium'>
          지원서 제출일로부터 1년까지 귀하의 개인정보를 보유 및 이용 그리고 제3자 제공하며, 이후 개인정보는 폐기
          처리됩니다.
        </p>
        <br />
        <p className='text-white text-2xl font-semibold'>■ 동의 거부 권리 및 불이익</p>
        <p className='text-white text-base font-medium'>
          귀하께서는 이 안내에 따른 개인정보 수집·이용, 제3자 제공에 대하여 동의를 거부하실 권리가 있습니다. 다만,
          귀하께서 개인정보 수집·이용, 제3자 제공에 동의하지 않는 경우 이 동아리 지원에 있어 불이익이 발생할 수 있음을
          알려드립니다.
        </p>
      </div>
      <div className='flex w-full items-center justify-end mt-5'>
        <Checkbox
          classNames={{
            wrapper: 'group-data-[selected=true]:after:bg-red-500',
            icon: 'bg-red-500',
          }}
          radius='none'
          color='danger'
          className='text-white text-base font-semibold'
          isSelected={isAgree}
          onValueChange={setIsAgree}
        >
          모두 동의합니다
        </Checkbox>
      </div>
    </div>
  );
}
