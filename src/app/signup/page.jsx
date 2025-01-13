"use client"

import { useState } from "react";
import { Button, Input } from "@nextui-org/react";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [step, setStep] = useState(2);
    const [id, setId] = useState("");
    const [major, setMajor] = useState("");
    const [interest, setInterest] = useState("");


    const handleNext = () => {
        if (!name || !email || !password || !confirmPassword) {
            alert("모든 칸을 채워주세요.");
            return;
        }
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        setStep(2);
    };

    const firstForm = (
        <div className={`absolute w-full transition-transform duration-500 ${
            step === 1 ? "translate-x-0" : "-translate-x-full"
        }`}>
            <Input 
                label="이름" 
                labelPlacement="outside" 
                type="text" 
                placeholder="이름을 적어주세요"
                radius="full"
                className="!mt-28"
                value={name}
                onValueChange={setName}
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
            <div className="flex flex-row w-full">
                <Input 
                    label="이메일" 
                    labelPlacement="outside" 
                    type="text" 
                    placeholder="이메일을 입력해주세요"
                    radius="full"
                    className="!mt-20 w-full !mr-3"
                    value={email}
                    onValueChange={setEmail}
                    classNames={{
                        label: "!text-white text-[21px] pb-3",
                        inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px] w-full",
                        input: "!text-white text-[18px]"
                    }}
                />
                <Input  
                    type="text" 
                    value="@inha.edu"
                    disabled
                    radius="full"
                    className="!mt-20 !w-[150px]"
                    classNames={{
                        label: "!text-white text-[21px] pb-3",
                        inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px] !w-[150px]",
                        input: "!text-white text-[18px] text-center"
                    }}
                />
            </div>
            <p className={`text-[#FF5252] text-[15px] ml-[21px] mt-[6px] ${isEmailValid ? "" : "hidden"}`}>이미 가입된 이메일입니다!</p>
            <Input 
                label="비밀번호" 
                labelPlacement="outside" 
                type="password" 
                placeholder="비밀번호를 입력해주세요."
                radius="full"
                className="!mt-20"
                value={password}
                onValueChange={setPassword}
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
            <Input 
                label="비밀번호 확인" 
                labelPlacement="outside" 
                type="password" 
                placeholder="비밀번호를 다시 입력해주세요."
                radius="full"
                className="!mt-20"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
        </div>
    );

    const secondForm = (
        <div className={`absolute w-full transition-transform duration-500 ${
            step === 2 ? "translate-x-0" : "translate-x-full"
        }`}>
            {/* id, 전공, 관심분야 입력 // 전공과 관심분야는 리스트 */}
            <Input label="아이디" labelPlacement="outside" type="text" placeholder="아이디를 입력해주세요" radius="full" className="!mt-20" value={id} onValueChange={setId} classNames={{
                label: "!text-white text-[21px] pb-3",
                inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                input: "!text-white text-[18px]"
            }}/>
            <Input label="전공" labelPlacement="outside" type="text" placeholder="전공을 입력해주세요" radius="full" className="!mt-20" value={major} onValueChange={setMajor} classNames={{
                label: "!text-white text-[21px] pb-3",
                inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                input: "!text-white text-[18px]"
            }}/>
            <Input label="관심분야" labelPlacement="outside" type="text" placeholder="관심분야를 입력해주세요" radius="full" className="!mt-20" value={interest} onValueChange={setInterest} classNames={{
                label: "!text-white text-[21px] pb-3",
                inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                input: "!text-white text-[18px]"
            }}/>
        </div>
    );

    return (
        <div className="flex flex-col w-full items-center justify-start h-screen">
            <div className="flex flex-col max-w-[414px] w-full h-full pt-[72px]">
                <p className="text-white text-3xl font-bold">회원가입하기</p>
                <div className="relative w-full h-full overflow-hidden">
                    {firstForm}
                    {secondForm}
                </div>
                <div className="flex flex-col w-full pb-20">
                    <Button 
                        className="text-white bg-[#ea4335] w-full h-[57px] rounded-full" 
                        onPress={step === 1 ? handleNext : () => alert("가입 완료!")}
                    >
                        {step === 1 ? "다음" : "가입하기"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
