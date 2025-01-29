"use client";

import { useState } from "react";
import { Input, CheckboxGroup, Checkbox } from "@nextui-org/react";

export default function Recruit2( {step} ) {

  const [selected, setSelected] = useState([]);
  
  return (
    <div 
      className={`absolute flex flex-col w-full h-full  transition-all duration-500 ease-in-out 
        ${step-1 == 2 ? "opacity-0" : step == 2 ? "" : step + 1 == 2? "opacity-0" : "hidden"} 
        ${step-1 == 2 ? "-translate-y-full" : step == 2 ? "translate-y-0" : step+1 == 2 ? "translate-y-full" : ""}`}>
      <p className="text-white text-2xl font-semibold">필수 개인정보를 적어주세요</p>
      <Input 
        label="국문성명"
        variant="bordered"
        labelPlacement="outside"
        placeholder=" "
        className="!mt-[57px]"
        classNames={{
          mainWrapper: "w-60 h-[57px]",
          label: "!text-white text-xl pb-[18px]",
          inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                        group-data-[focus=true]:border-[#bbbbbb30]`,
        }}
      />
      <Input 
        label="학번"
        variant="bordered"
        labelPlacement="outside"
        placeholder=" "
        className="!mt-[60px]"
        classNames={{
          mainWrapper: "w-60 h-[57px]",
          label: "!text-white text-xl pb-[18px]",
          inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                        group-data-[focus=true]:border-[#bbbbbb30]`,
        }}
      />
      <p className="text-white text-xl mt-[20px]">재학 구분</p>
      <CheckboxGroup
        className="flex gap-4 mt-[20px] w-[500px]"
        orientation="horizontal"
        value={selected}
        onValueChange={(value)=>{
          if(value.length > 1){
            setSelected(value.slice(-1));
          }else{
            setSelected(value);
          }
        }}
      >
        <Checkbox 
          value="정등록" 
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("정등록") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >정등록</Checkbox>
        <Checkbox 
          value="부분등록"
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("부분등록") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >부분등록</Checkbox>
        <Checkbox 
          value="휴학"
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("휴학") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >휴학</Checkbox>
        <Checkbox 
          value="수료"
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("수료") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >수료</Checkbox>
        <Checkbox 
          value="졸업"
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("졸업") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >졸업</Checkbox>
      </CheckboxGroup>
    </div>
  );
}
