"use client"
import { Autocomplete, AutocompleteItem, AutocompleteSection, Input } from "@nextui-org/react";
import { majors } from "../constants/majors";
import { useState } from "react";

export default function AdditionalInfoForm({
  major, setMajor,
  studentId, setStudentId,
  phoneNumber, setPhoneNumber
}) {
  return (
    <div className="w-full">
      <div className="flex flex-row w-full mt-10">
        <Autocomplete 
          label="전공" 
          labelPlacement="outside" 
          placeholder="학과를 지정해주세요"
          radius="full"
          className="w-full text-white"
          classNames={{
            label: "!pb-[10px] !text-white",
            inputWrapper: `bg-black h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent`,
            mainWrapper: "relative",
            input: "!text-white",
            popoverContent: "bg-black"
          }}
        
          inputProps={{
            classNames: {
              inputWrapper: `bg-black h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent`,
              input: "!text-white",
            }
          }}
          popoverProps={{
            classNames: {
              base: "mt-3",
              content: "bg-black"
            }
          }}
          listboxProps={{
            classNames: {
              base: "bg-black text-white",
            }
          }}
          selectedKeys={major ? new Set([major]) : new Set([])}
          onSelectionChange={setMajor}
        >
          {majors.map((collegeGroup) => (
            <AutocompleteSection key={collegeGroup.title} title={collegeGroup.title} showDivider>
              {collegeGroup.items.map((majorItem) => (
                <AutocompleteItem 
                  key={majorItem.key} 
                  aria-label={majorItem.value} 
                  value={majorItem.value}
                  className="hover:bg-[#1c1c1c]"
                >
                  {majorItem.value}
                </AutocompleteItem>
              ))}
            </AutocompleteSection>
          ))}
        </Autocomplete>
      </div>
      
      <div className="flex flex-row w-full mt-6">
        <Input 
          label="학번" 
          labelPlacement="outside" 
          type="text" 
          placeholder="학번을 입력해주세요" 
          radius="full" 
          className="w-full" 
          value={studentId} 
          onValueChange={setStudentId} 
          classNames={{
            label: "!pb-[10px] !text-white",
            inputWrapper: `h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent`,
            mainWrapper: "relative",
            input: "!text-white",
          }}
        />
      </div>
      
      <div className="flex flex-row w-full mt-6 mb-4">
        <Input 
          label="전화번호" 
          labelPlacement="outside" 
          type="tel" 
          placeholder="전화번호를 입력해주세요 (예: 010-1234-5678)" 
          radius="full" 
          className="w-full" 
          value={phoneNumber} 
          onValueChange={setPhoneNumber} 
          classNames={{
            label: "!pb-[10px] !text-white",
            inputWrapper: `h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent`,
            mainWrapper: "relative",
            input: "!text-white",
          }}
        />
      </div>
    </div>
  );
} 