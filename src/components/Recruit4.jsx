"use client";

import { useState } from "react";
import { Input, CheckboxGroup, Checkbox, Select, SelectItem } from "@nextui-org/react";

export default function Recruit4( {step} ) {
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(new Set([]));
  const [gender, setGender] = useState([]);
  const [birthDate, setBirthDate] = useState("");

  const domains = [
    { label: "gmail.com", value: "gmail.com" },
    { label: "naver.com", value: "naver.com" },
    { label: "daum.net", value: "daum.net" },
    { label: "kakao.com", value: "kakao.com" },
    { label: "기타", value: "custom" },
  ];

  return (
    <div 
      className={`absolute flex flex-col w-full h-full transition-all duration-500 ease-in-out 
        ${step-1 == 4 ? "opacity-0" : step == 4 ? "" : step + 1 == 4? "opacity-0" : "hidden"} 
        ${step-1 == 4 ? "-translate-y-full" : step == 4 ? "translate-y-0" : step+1 == 4 ? "translate-y-full" : ""}`}>
      <p className="text-white text-2xl font-semibold">필수 개인정보를 적어주세요</p>
      
      <div className="flex flex-row items-end justify-start gap-2 !mt-[57px]">
        <Input 
          label="이메일"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
          variant="bordered"
          labelPlacement="outside"
          placeholder=" "
          classNames={{
            base: "w-auto",
            mainWrapper: "w-60 h-[57px]",
            label: "!text-white text-xl pb-[18px]",
            inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                          group-data-[focus=true]:border-[#bbbbbb30]`,
          }}
        />
        <span className="text-white text-xl mb-[14px]">@</span>
        {selectedDomain.has("custom") ? (
          <Input 
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
            variant="bordered"
            placeholder=" "
            classNames={{
              mainWrapper: "w-60 h-[57px]",
              inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                            group-data-[focus=true]:border-[#bbbbbb30]`,
            }}
          />
        ) : (
          <Select
            placeholder=" "
            selectedKeys={selectedDomain}
            onSelectionChange={setSelectedDomain}
            className="w-[200px]"
            classNames={{
              trigger: "h-[57px] bg-[#181818] border-[#bbbbbb30] border-[1.5px] data-[selected=true]:bg-[#471915] data-[selected=true]:border-[#ea4335] data-[hover=true]:bg-[#181818] data-[hover=true]:border-[#bbbbbb30]",
              value: "!text-white text-xl",
              listbox: "bg-[#181818] text-white",
              popoverContent: "bg-[#181818]",
              selectorIcon: "invert"
            }}
          >
            {domains.map((domain) => (
              <SelectItem key={domain.value} value={domain.value} className="text-white">
                {domain.label}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      <p className="text-white text-xl mt-[20px]">성별</p>
      <CheckboxGroup
        className="flex gap-4 mt-[20px]"
        orientation="horizontal"
        value={gender}
        onValueChange={(value)=>{
          if(value.length > 1){
            setGender(value.slice(-1));
          }else{
            setGender(value);
          }
        }}
      >
        <Checkbox 
          value="남자" 
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${gender.includes("남자") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >남자</Checkbox>
        <Checkbox 
          value="여자"
          radius="none"
          classNames={{
            wrapper: "hidden",
            label: `text-white text-xl w-[150px] h-[67px] flex justify-center items-center rounded-md ${gender.includes("여자") ? "bg-[#471915] border-[1.5px] border-[#ea4335]" : "bg-[#181818]"}`
          }}
        >여자</Checkbox>
      </CheckboxGroup>

      <Input
        label="생년월일"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        variant="bordered"
        labelPlacement="outside"
        placeholder=" "
        className="!mt-[60px]"
        classNames={{
          mainWrapper: "w-60 h-[57px]",
          label: "!text-white text-xl pb-[18px]",
          inputWrapper: `h-[57px] border-[#bbbbbb30] border-[1.5px] rounded-md text-white text-xl
                        group-data-[focus=true]:border-[#bbbbbb30]`,
          input: "!text-black invert",
        }}
      />
    </div>
  );
}
