"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Button } from "@nextui-org/react";

export default function RecruitSubmitted() {
  const router = useRouter()
  const [checkMotion, setCheckMotion] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckMotion(true);
    }, 50);
  
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[100svh] text-white">
      <div
        className={`w-[75px] h-[75px] border-5 rounded-full border-green-500 flex justify-center items-center relative overflow-hidden transition-all duration-500 ${
          checkMotion ? 'scale-125' : ''
        }`}
      >
        <span
          className={`text-[60px] text-green-500 transform ${
            checkMotion ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          } transition-all duration-500`}
        >
          ✓
        </span>
      </div>
        <div className="text-3xl mt-[50px] font-semibold mobile:text-2xl">25-1 멤버 가입이 완료되었습니다.</div>
        <div className='text-xl mt-[20px] mobile:text-base items-center mobile:text-center'>
          회비 납부를 확인한 후 2~3일 내로,              
          <strong className='text-[#EA4335]'> G</strong>
          <strong className='text-[#34A853]'>D</strong>
          <strong className='text-[#F9AB00]'>G</strong>
          <strong className='text-[#4285F4]'>o</strong>
          <strong className='text-[#EA4335]'>C</strong> <strong>INHA</strong> <br className='pc:hidden'/>채팅방에 초대해 드리겠습니다
        </div>
      <Button variant='solid' color="success" className="mt-[50px] p-5 rounded-full text-white text-[15px] font-semibold !bg-[#34A853] mb-[50px]" onPress={() => router.push('/')}>메인으로 이동하기</Button>
    </div>
  );
}