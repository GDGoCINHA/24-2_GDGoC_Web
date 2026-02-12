"use client"

import { GdgInput } from "@/components/ui/input/GdgInput";

export default function ProfileInfoForm({ 
  name, setName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  errors, isEmailValid,
  isNameDisabled, isEmailDisabled, setIsEmailValid
}) {

  const emailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailValid(false);
  }

  return (
    <div className="w-full">
      <GdgInput 
        label="이름" 
        labelPlacement="outside" 
        type="text" 
        placeholder="이름을 적어주세요"
        className="!mt-14"
        value={name}
        onValueChange={setName}
        isDisabled={isNameDisabled}
      />
      
      <div className="flex flex-row w-full mt-10">
        <GdgInput 
          label="이메일" 
          labelPlacement="outside" 
          type="text" 
          placeholder="이메일을 입력해주세요"
          className="w-full"
          value={email}
          onChange={emailChange}
          isDisabled={isEmailDisabled}
        />
      </div>
      
      <p className={`text-[#EA4336] text-[15px] ml-[21px] mt-[6px] ${isEmailValid ? "opacity-100" : "opacity-0"}`}>
        이미 가입된 이메일입니다!
      </p>
      
      <GdgInput 
        label="비밀번호" 
        labelPlacement="outside" 
        type="password" 
        placeholder="비밀번호를 입력해주세요."
        className="!mt-10"
        value={password}
        onValueChange={setPassword}
        isInvalid={errors.length > 0}
        errorMessage={errors.join(' ')}
      />
      
      <GdgInput 
        label="비밀번호 확인" 
        labelPlacement="outside" 
        type="password" 
        placeholder="비밀번호를 다시 입력해주세요."
        className="!mt-[84px] mb-6"
        value={confirmPassword}
        isInvalid={password !== confirmPassword && confirmPassword.length > 0}
        errorMessage={
          password !== confirmPassword && confirmPassword.length > 0
            ? '비밀번호가 일치하지 않습니다.'
            : ''
        }
        onValueChange={setConfirmPassword}
      />
    </div>
  );
} 