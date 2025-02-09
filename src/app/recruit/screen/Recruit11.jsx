'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from "@nextui-org/react"

export default function Recruit11({ step, setChecked, updateRecruitData }) {
  const [isPayed, setIsPayed] = useState(false);

  useEffect(() => {
    if (step === 11) {
      setChecked(isPayed);
      const formData = {
        isPayed,
      };
      updateRecruitData(11, formData);
    }
  }, [isPayed, step, setChecked, updateRecruitData]);

  return (
    <div
      className={`absolute flex w-full h-full bg-transparent transition-all duration-500 ease-in-out 
        ${step - 1 == 11 ? 'opacity-0' : step == 11 ? '' : step + 1 == 11 ? 'opacity-0' : 'hidden'} 
        ${
          step - 1 == 11 ? '-translate-y-full' : step == 11 ? 'translate-y-0' : step + 1 == 11 ? 'translate-y-full' : ''
        }`}
    >
      <div className='flex flex-col w-full h-full mx-[10px] text-white'>
        <div className='text-2xl font-semibold'>회비 안내</div>
        <div className='flex flex-col w-full bg-[#95959514] h-[358px] mt-[30px] p-2 rounded-2xl border-1 border-[#ffffff34] overflow-y-scroll'>
          <div className='mt-[5px]'>
            회비 납부 확인 후, GDG on campus 멤버로서 모든 활동들에 대한 참가 권한을 얻게 됩니다.
          </div>
          <div className='mt-[7px]'>
            프로젝트와 스터디 등 일부 활동은 운영 소요에 따라 추가금이 산정될 수 있습니다.
          </div>
          <div className='mt-[7px]'>모든 회비는 커뮤니티 운영비로 투명하게 사용, 처리됩니다.</div>
          <div className='text-sm text-[#eeeeee] mt-[20px]'>
            <ul>
              <li className='text-base font-semibold'>• 👛 입금 계좌</li>
              <li className='ml-[8px] mb-[15px]'>
                : <strong className='text-[#34A853]'>카카오뱅크 3333252211505</strong> | 예금주명
                <strong> 엄수빈</strong>
              </li>

              <li className='text-base font-semibold'>• 💵 25-1 회비</li>
              <li className='ml-[8px] mb-[15px]'>
                : <strong className='text-[#F9AB00]'>20,000</strong> 원
              </li>

              <li className='text-base font-semibold'>• 📌 주의사항</li>
              <li className='ml-[8px]'>
                : 회비 납부 과정에서 입금자명을 반드시
                <strong className='text-[#4285F4]'> [2자리 학번+이름] 으로 변경</strong>해주세요!
              </li>
              <li className='ml-[8px]'>→ ex) 24김인하</li>
            </ul>
          </div>
          <div className='mt-[20px]'>
            <strong>문의사항:</strong> 박우찬 | 010-2087-1816
          </div>
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
            isSelected={isPayed}
            onValueChange={setIsPayed}
          >
            회비 납부를 모두 완료했습니다
          </Checkbox>
        </div>
      </div>
    </div>
  );
}