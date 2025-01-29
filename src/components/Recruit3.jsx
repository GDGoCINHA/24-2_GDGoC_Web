"use client";

import { useState } from "react";
import { Input, CheckboxGroup, Checkbox, Select, SelectItem } from "@nextui-org/react";

export default function Recruit3( {step} ) {
  const [selected, setSelected] = useState([]);
  const [gradeSelected, setGradeSelected] = useState(new Set([]));
  const [otherNationality, setOtherNationality] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <div 
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step-1 == 3 ? "opacity-0" : step == 3 ? "" : step + 1 == 3? "opacity-0" : "hidden"} 
        ${step-1 == 3 ? "-translate-y-full" : step == 3 ? "translate-y-0" : step+1 == 3 ? "translate-y-full" : ""}`}>
      <p className="text-white text-2xl font-semibold">필수 개인정보를 적어주세요</p>
      <Select
        label="학년"
        labelPlacement="outside"
        placeholder=" "
        className="w-[200px] !mt-[57px]"
        selectedKeys={gradeSelected}
        onSelectionChange={setGradeSelected}
        classNames={{
          trigger: "h-[57px] bg-[#181818] border-[#bbbbbb30] border-[1.5px] data-[selected=true]:bg-[#471915] data-[selected=true]:border-[#ea4335] data-[hover=true]:bg-[#181818] data-[hover=true]:border-[#bbbbbb30]",
          value: "!text-white text-xl",
          label: "!text-white text-xl pb-[18px]",
          listbox: "bg-[#181818] text-white",
          popoverContent: "bg-[#181818]"
        }}
      >
        <SelectItem key="1학년" value="1학년" className="text-white">1학년</SelectItem>
        <SelectItem key="2학년" value="2학년" className="text-white">2학년</SelectItem>
        <SelectItem key="3학년" value="3학년" className="text-white">3학년</SelectItem>
        <SelectItem key="4학년" value="4학년" className="text-white">4학년</SelectItem>
        <SelectItem key="초과학기" value="초과학기" className="text-white">초과학기</SelectItem>
      </Select>
      <Input 
        label="전화번호"
        value={phoneNumber}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, '');
          if (value.length <= 11) {
            let formattedNumber = '';
            if (value.length > 3) {
              formattedNumber += value.slice(0,3) + '-';
              if (value.length > 7) {
                formattedNumber += value.slice(3,7) + '-' + value.slice(7);
              } else {
                formattedNumber += value.slice(3);
              }
            } else {
              formattedNumber = value;
            }
            setPhoneNumber(formattedNumber);
          }
        }}
        placeholder="010-0000-0000"
        variant="bordered"
        labelPlacement="outside"
        className="!mt-[60px]"
        classNames={{
          mainWrapper: "w-60 h-[57px]",
          label: "!text-white text-xl pb-[18px]",
          inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                        group-data-[focus=true]:border-[#bbbbbb30]`,
        }}
      />
      <p className="text-white text-xl mt-[20px]">국적</p>
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
          value="대한민국" 
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("대한민국") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >대한민국</Checkbox>
        <Checkbox 
          value="기타"
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${selected.includes("기타") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >기타</Checkbox>
      </CheckboxGroup>

      {selected.includes("기타") && (
        <Input
          variant="bordered"
          placeholder="국가를 입력해주세요"
          className="max-w-xs mt-4"
          value={otherNationality}
          onChange={(e) => setOtherNationality(e.target.value)}
          classNames={{
            mainWrapper: "w-60 h-[57px]",
            label: "!text-white text-xl pb-[18px]",
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                          group-data-[focus=true]:border-[#bbbbbb30]`,
          }}
        />
      )}
    </div>
  );
}
