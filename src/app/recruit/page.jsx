"use client";

import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { Button } from '@nextui-org/react';
import { formatRecruitData } from '../utils/formatRecruitData.js';
import { useRouter } from 'next/navigation';

import Recruit1 from '@/app/recruit/screen/Recruit1';
import Recruit2 from '@/app/recruit/screen/Recruit2';
import Recruit3 from '@/app/recruit/screen/Recruit3';
import Recruit4 from '@/app/recruit/screen/Recruit4';
import Recruit5 from '@/app/recruit/screen/Recruit5';
import Recruit6 from '@/app/recruit/screen/Recruit6';
import Recruit7 from '@/app/recruit/screen/Recruit7';
import Recruit8 from '@/app/recruit/screen/Recruit8';
import Recruit9 from '@/app/recruit/screen/Recruit9';
import Recruit10 from '@/app/recruit/screen/Recruit10';
import Recruit11 from '@/app/recruit/screen/Recruit11';

import RecruitLoading from '@/app/recruit/screen/RecruitLoading.jsx'
import VerticalProgressBar from './VerticalProgressBar.jsx';
import HorizontalProgressBar from './HorizontalProgressBar.jsx';

export default function Recruit() {
  const [mainRecruitData, setMainRecruitData] = useState(new Map());
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    if (!checked) {
      alert("신청서의 공란을 모두 기입해 주세요.");
      return;
    }
    if (step >= 11) {
      const confirmation = window.confirm("정말 제출하시겠습니까?");
      if (confirmation) {
        const formattedData = formatRecruitData(mainRecruitData);
        try {
          setLoading(true)
          const response = await axios.post("https://www.gdgocinha.site/apply", formattedData);
          router.push("/recruit/submitted");
        } catch (error) {
          if (error.response && error.response.status === 500) {
            alert("이미 가입된 회원입니다.");
          } else {
            alert("제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
          }
          setLoading(false)
        }
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const updateRecruitData = useCallback((step, data) => {
    setMainRecruitData((prev) => new Map(prev).set(step, data));
  }, []);

  return (
    <div className='flex flex-col max-w-[1305px] mx-auto h-screen justify-center mobile:h-[100svh]'>
      <RecruitLoading isLoading={loading} />
      <div className='flex flex-col scale-90 origin-top-left w-[111.11%] mobile:flex-grow'>
        <div className='mx-[30px] mobile:flex mobile:flex-col mobile:h-full mobile:justify-between'>
          <p className='text-white text-4xl font-bold mt-[80px] select-none mobile:text-3xl mobile:mt-[7svh]'>
            <strong className='text-[#EA4335]'>G</strong>
            <strong className='text-[#34A853]'>D</strong>
            <strong className='text-[#F9AB00]'>G</strong>
            <strong className='text-[#4285F4]'>o</strong>
            <strong className='text-[#EA4335]'>C</strong> INHA 25-1 <br className='pc:hidden' />
            멤버에 지원해보세요
          </p>
          <HorizontalProgressBar step={step} />
          <div className='flex flex-row w-full pc:h-[489px] pc:mt-[90px] mobile:flex-grow'>
            <div className='flex flex-row flex-none h-full'>
              <div className='flex flex-col text-white text-2xl mr-[54px] justify-between select-none mobile:hidden'>
                <p>개인정보 수집</p>
                <p>필수 인적 사항</p>
                <p>단과대학 | 전공</p>
                <p>지원 정보</p>
                <p>설문조사</p>
                <p>회비 안내</p>
              </div>
              <VerticalProgressBar step={step} />
            </div>
            <div className='relative flex w-full h-full ml-8 overflow-hidden mobile:ml-0'>
              <Recruit1 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit2 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit3 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit4 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit5 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit6 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit7 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit8 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit9 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit10 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
              <Recruit11 step={step} setChecked={setChecked} updateRecruitData={updateRecruitData} />
            </div>
          </div>
          <div className='flex w-full items-center justify-end mt-[62px] mobile:mt-[20px]'>
            {step > 1 && (
              <Button
                className='bg-gray-500 text-white rounded-full w-[183px] h-[57px] text-lg font-semibold mr-[24px]'
                onPress={handlePrevious}
                disableAutoFocus
              >
                이전
              </Button>
            )}
            <Button
              className='bg-red-500 text-white rounded-full w-[183px] h-[57px] text-lg font-semibold'
              onPress={handleNext}
              isDisabled={!checked}
              disableAutoFocus
            >
              {step < 11 ? '다음' : '완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}