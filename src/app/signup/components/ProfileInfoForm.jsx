"use client"
import { useState, useEffect } from "react";
import { Input } from "@nextui-org/react";

export default function ProfileInfoForm({ 
  name, setName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  errors, isEmailValid,
  isNameDisabled, isEmailDisabled
}) {
  return (
    <div className="w-full">
      <Input 
        label="이름" 
        labelPlacement="outside" 
        type="text" 
        placeholder="이름을 적어주세요"
        radius="full"
        className="!mt-14"
        value={name}
        onValueChange={setName}
        isDisabled={isNameDisabled}
        classNames={{
          label: "!pb-[10px] !text-white",
          inputWrapper: `h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
            group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
            group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
            ${isNameDisabled ? "opacity-80" : ""}`,
          mainWrapper: "relative",
          input: "!text-white",
        }}
      />
      
      <div className="flex flex-row w-full mt-10">
        <Input 
          label="이메일" 
          labelPlacement="outside" 
          type="text" 
          placeholder="이메일을 입력해주세요"
          radius="full"
          className="w-full"
          value={email}
          onValueChange={setEmail}
          isDisabled={isEmailDisabled}
          classNames={{
            label: "!pb-[10px] !text-white",
            inputWrapper: `h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
              group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
              group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
              ${isEmailDisabled ? "opacity-80" : ""}`,
            mainWrapper: "relative",
            input: "!text-white",
          }}
        />
      </div>
      
      <p className={`text-[#EA4336] text-[15px] ml-[21px] mt-[6px] ${isEmailValid ? "opacity-100" : "opacity-0"}`}>
        이미 가입된 이메일입니다!
      </p>
      
      <Input 
        label="비밀번호" 
        labelPlacement="outside" 
        type="password" 
        placeholder="비밀번호를 입력해주세요."
        radius="full"
        className="!mt-10"
        value={password}
        onValueChange={setPassword}
        isInvalid={errors.length > 0}
        errorMessage={errors.map((error, index) => (
          <p key={index} className="text-[#EA4336] text-[15px]">{error}</p>
        ))}
        classNames={{
          label: "!pb-[10px] !text-white",
          inputWrapper: `h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
            group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
            group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
            group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#EA4336]`,
          mainWrapper: "relative",
          helperWrapper: "absolute -bottom-12 left-0",
          input: "!text-white",
          errorMessage: "text-[#EA4336]",
        }}
      />
      
      <Input 
        label="비밀번호 확인" 
        labelPlacement="outside" 
        type="password" 
        placeholder="비밀번호를 다시 입력해주세요."
        radius="full"
        className="!mt-[84px] mb-6"
        value={confirmPassword}
        isInvalid={password !== confirmPassword && confirmPassword.length > 0}
        errorMessage={
          password !== confirmPassword && confirmPassword.length > 0 ? 
          <p className="text-[#EA4336] text-[15px]">비밀번호가 일치하지 않습니다.</p> : ""
        }
        onValueChange={setConfirmPassword}
        classNames={{
          label: "!pb-[10px] !text-white",
          inputWrapper: `h-[48px] rounded-full border-2 border-white/50 caret-white bg-transparent !transition !duration-300 !ease-in-out
            group-data-[focus=true]:border-2 group-data-[focus=true]:border-white group-data-[focus=true]:bg-transparent
            group-data-[hover=true]:border-2 group-data-[hover=true]:border-white group-data-[hover=true]:bg-transparent
            group-data-[invalid=true]:!bg-transparent group-data-[invalid=true]:!border-[#EA4336]`,
          mainWrapper: "relative",
          helperWrapper: "absolute -bottom-6 left-0",
          input: "!text-white",
          errorMessage: "text-[#EA4336]",
        }}
      />
    </div>
  );
} 