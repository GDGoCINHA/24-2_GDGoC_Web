"use client";
import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import Recruit1 from "@/components/Recruit1";
import Recruit2 from "@/components/Recruit2";
import Recruit3 from "@/components/Recruit3";
import Recruit4 from "@/components/Recruit4";
import Recruit5 from "@/components/Recruit5";
import Recruit6 from "@/components/Recruit6";
import Recruit7 from "@/components/Recruit7";
import Recruit8 from "@/components/Recruit8";
import Recruit9 from "@/components/Recruit9";
import Recruit10 from "@/components/Recruit10";


export default function Recruit() {

  const [step, setStep] = useState(1);

  return (
    <>
        <div className="flex flex-col max-w-[1305px] mx-auto h-full pt-[132px]">
            <p className="text-white text-4xl font-bold">GDGoC INHA 25-1 멤버에 지원해보세요</p>
            <div className="flex flex-row w-full mt-[90px] h-[489px]">
                <div className="flex flex-row flex-none h-full">
                  <div className="flex flex-col text-white text-2xl mr-[54px] justify-between">
                    <p>개인정보 수집</p>
                    <p>필수 인적 사항</p>
                    <p>전공 | 사범대학</p>
                    <p>지원 정보</p>
                    <p>설문조사</p>
                    <p>회비 안내</p>
                  </div>
                  <div className="flex flex-col relative pr-[46px]">
                    <div id="line" className="absolute flex items-center justify-center h-full w-full">
                      <div id="long-line-gray" className="absolute h-full bg-gray-500 w-1"></div>
                      <div id="long-line-red" className={`absolute top-0 bg-red-500 w-1 transition-all duration-500 ease-in-out`} style={{height: `${step === 1 ? 0 : step <= 4 ? 20 : step === 5 ? 40 : step <= 8 ? 60 : step === 9 ? 80 : 100}%`}}></div>
                    </div>
                    <div id="circle" className="absolute flex flex-col items-center justify-between h-full w-full">
                      <div id="circle-1" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 1 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-2" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 2 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-3" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 5 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-4" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 6 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-5" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 9 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-6" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 10 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                    </div>
                    
                  </div>
                </div>
                <div className="relative flex w-full h-full ml-8  overflow-hidden">
                  <Recruit1 step={step} />
                  <Recruit2 step={step} />
                  <Recruit3 step={step} />
                  <Recruit4 step={step} />
                  <Recruit5 step={step} />
                  <Recruit6 step={step} />
                  <Recruit7 step={step} />
                  <Recruit8 step={step} />
                  <Recruit9 step={step} />
                  <Recruit10 step={step} />
                </div>
            </div>
            <div className="flex w-full items-center justify-end mt-[72px]">
              <Button className="bg-red-500 text-white rounded-full w-[183px] h-[57px] text-lg font-semibold" onPress={step < 10 ? () => setStep(step + 1) : () => { alert("완료") }}>
                {step < 10 ? "다음" : "완료"}
              </Button>
            </div>
        </div>
    </>
  );
}
