"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@nextui-org/react";

export default function CoreRecruitSubmit() {
  const router = useRouter();
  const [checkMotion, setCheckMotion] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCheckMotion(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[100svh] text-white">
      <div
        className={`w-[75px] h-[75px] border-5 rounded-full border-green-500 flex justify-center items-center relative overflow-hidden transition-all duration-500 ${checkMotion ? 'scale-125' : ''}`}
      >
        <span className={`text-[60px] text-green-500 transform ${checkMotion ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-500`}>
          ✓
        </span>
      </div>
      <div className="text-3xl mt-[50px] font-semibold mobile:text-2xl">코어 멤버 지원서 제출이 완료되었습니다.</div>
      <div className='text-xl mt-[20px] mobile:text-sm items-center justify-center mobile:text-center'>
        <div className="flex flex-col items-start mt-5 justify-center text-white gap-2">
          <div className="text-xl font-bold mb-2">아래 일정을 한번 더 확인해주세요!</div>
          <div>✅ 서류 지원 기간 : 2025년 09월 8일 (월) ~ 2025년 09월 21일 (일) 11:59:59</div>
          <div>✅ 서류 결과 발표 : ~ 2025년 09월 21일 (일)</div>
          <div>✅ 면접 진행 기간 : 2025년 09월 22일 (월) ~ 2025년 09월 26일 (금)</div>
          <div className="text-white/70 text-sm mb-2">※ 지원자 및 면접관의 일정에 따라 마감 전 조기 면접 진행이 가능할 수 있습니다.</div>
          <div>✅ 최종 결과 발표 : ~ 2025년 09월 28일 (일)</div>
        </div>
      </div>
      <div className='flex gap-3 mt-[50px] mb-[50px]'>
        <Button variant='solid' color="default" className="p-5 rounded-full text-white text-[15px] font-semibold !bg-gray-600" onPress={() => router.push('/core-recruit')}>
          폼으로 돌아가기
        </Button>
        <Button variant='solid' color="success" className="p-5 rounded-full text-white text-[15px] font-semibold !bg-[#34A853]" onPress={() => router.push('/')}>메인으로 이동하기</Button>
      </div>
    </div>
  );
}


