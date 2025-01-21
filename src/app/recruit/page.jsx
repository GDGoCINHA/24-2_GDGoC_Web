"use client";
import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";

export default function Recruit() {

  const [step, setStep] = useState(1);

  return (
    <>
        <div className="flex flex-col w-full h-full pl-[306px] pt-[132px] pr-[306px]">
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
                      <div id="long-line-red" className={`absolute top-0 bg-red-500 w-1 transition-all duration-500 ease-in-out`} style={{height: `${(step-1) * 20}%`}}></div>
                    </div>
                    <div id="circle" className="absolute flex flex-col items-center justify-between h-full w-full">
                      <div id="circle-1" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 1 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-2" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 2 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-3" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 3 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-4" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 4 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-5" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 5 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                      <div id="circle-6" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-500 ease-in-out ${step >= 6 ? "bg-red-500" : "bg-gray-500"}`}>✓</div>
                    </div>
                    
                  </div>
                </div>
                <div className="relative flex w-full h-full border-2 border-gray-500 overflow-hidden">
                  <div className={`absolute flex w-full h-full bg-red-500 transition-all duration-500 ease-in-out ${step-1 == 1 ? "opacity-0" : step == 1 ? "" : step + 1 == 1? "opacity-0" : "hidden"} ${step-1 == 1 ? "-translate-y-full" : step == 1 ? "translate-y-0" : step+1 == 1 ? "translate-y-full" : ""}`}>
                    우왕1
                  </div>
                  <div className={`absolute flex w-full h-full bg-green-500 transition-all duration-500 ease-in-out ${step-1 == 2 ? "opacity-0" : step == 2 ? "" : step + 1 == 2? "opacity-0" : "hidden"} ${step-1 == 2 ? "-translate-y-full" : step == 2 ? "translate-y-0" : step+1 == 2 ? "translate-y-full" : ""}`}>
                    우왕2
                  </div>
                  <div className={`absolute flex w-full h-full bg-blue-500 transition-all duration-500 ease-in-out ${step-1 == 3 ? "opacity-0" : step == 3 ? "" : step + 1 == 3? "opacity-0" : "hidden"} ${step-1 == 3 ? "-translate-y-full" : step == 3 ? "translate-y-0" : step+1 == 3 ? "translate-y-full" : ""}`}>
                    우왕3
                  </div>
                  <div className={`absolute flex w-full h-full bg-yellow-500 transition-all duration-500 ease-in-out ${step-1 == 4 ? "opacity-0" : step == 4 ? "" : step + 1 == 4? "opacity-0" : "hidden"} ${step-1 == 4 ? "-translate-y-full" : step == 4 ? "translate-y-0" : step+1 == 4 ? "translate-y-full" : ""}`}>
                    우왕4
                  </div>
                  <div className={`absolute flex w-full h-full bg-purple-500 transition-all duration-500 ease-in-out ${step-1 == 5 ? "opacity-0" : step == 5 ? "" : step + 1 == 5? "opacity-0" : "hidden"} ${step-1 == 5 ? "-translate-y-full" : step == 5 ? "translate-y-0" : step+1 == 5 ? "translate-y-full" : ""}`}>
                    우왕5
                  </div>
                  <div className={`absolute flex w-full h-full bg-orange-500 transition-all duration-500 ease-in-out ${step-1 == 6 ? "opacity-0" : step == 6 ? "" : step + 1 == 6? "opacity-0" : "hidden"} ${step-1 == 6 ? "-translate-y-full" : step == 6 ? "translate-y-0" : step+1 == 6 ? "translate-y-full" : ""}`}>
                    우왕6
                  </div>
                </div>
            </div>
            <div className="flex w-full items-center justify-end">
              <Button className="bg-red-500 text-white px-4 py-2 rounded-md" onPress={() => setStep(step - 1)}>이전</Button>
              <Button className="bg-red-500 text-white px-4 py-2 rounded-md" onPress={() => setStep(step + 1)}>다음</Button>
            </div>
        </div>
    </>
  );
}
