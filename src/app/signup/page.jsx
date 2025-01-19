"use client"
import { useState, useMemo, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [currentScreen, setCurrentScreen] = useState(0);
    const [id, setId] = useState("");
    const [major, setMajor] = useState("");
    const [interest, setInterest] = useState("");
    const errors = [];

    useEffect(() => {
        console.log("123",currentScreen);
    }, [currentScreen]);



    if (password.length < 8) {
        errors.push('비밀번호는 8자 이상이어야 합니다.');
    }
    if (
        !password.match(/[0-9]/) || 
        !password.match(/[a-zA-Z]/) || 
        !password.match(/[^a-zA-Z0-9]/)
    ) {
        errors.push('비밀번호는 숫자,영어,특수문자가 반드시 포함되어야 합니다.');
    }

    const handleNext = () => {
        if (!name || !email || !password || !confirmPassword) {
            alert("모든 칸을 채워주세요.");
            return;
        }
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        setCurrentScreen(1);
    };

    const screens = () => {
        if (currentScreen === 0 ) {
            return (
            <div key="screen1" className="w-full">
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
                        input: "!text-white text-[18px]",
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
                        input: "!text-white text-[18px] text-center m-0"
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
                isInvalid={errors.length > 0}
                errorMessage={errors.map((error, index) => (
                    <p key={index} className="text-white text-[15px] mt-[6px]">{error}</p>
                ))}
                classNames={{
                    label: "!text-white text-[21px] pb-3",  
                    inputWrapper: "group-data-[invalid=true]:!bg-[#1c1c1c] bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]",
                }}
            />
            <Input 
                label="비밀번호 확인" 
                labelPlacement="outside" 
                type="password" 
                placeholder="비밀번호를 다시 입력해주세요."
                radius="full"
                className="!mt-20 mb-10"
                value={confirmPassword}
                isInvalid={password != confirmPassword && confirmPassword.length > 0}
                errorMessage={
                    <p className="text-[#FF5252] text-[15px] mt-[6px]">비밀번호가 일치하지 않습니다.</p>
                }
                onValueChange={setConfirmPassword}
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "group-data-[invalid=true]:!bg-[#1c1c1c] bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
        </div>
            );
        }
        else if (currentScreen === 1) {
            return (
            <div key="screen2" className="w-full">
            <Input 
                label="아이디" 
                labelPlacement="outside" 
                type="text" 
                placeholder="아이디를 입력해주세요" 
                radius="full" 
                className="!mt-20" 
                value={id} 
                onValueChange={setId} 
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
            <Input 
                label="전공" 
                labelPlacement="outside" 
                type="text" 
                placeholder="전공을 입력해주세요" 
                radius="full" 
                className="!mt-20" 
                value={major} 
                onValueChange={setMajor} 
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
            <Input 
                label="관심분야" 
                labelPlacement="outside" 
                type="text" 
                placeholder="관심분야를 입력해주세요" 
                radius="full" 
                className="!mt-20" 
                value={interest} 
                onValueChange={setInterest} 
                classNames={{
                    label: "!text-white text-[21px] pb-3",
                    inputWrapper: "bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                    input: "!text-white text-[18px]"
                }}
            />
        </div>
            );
        }
    };
       

    return (
        <div className="flex flex-col w-full items-center justify-start h-screen">
            {console.log(currentScreen)}
            <div className="flex flex-col max-w-[414px] w-full h-full pt-[72px] px-5">
                <p className="text-white text-xl font-bold">회원가입하기</p>
                <div className="relative w-full h-full overflow-x-hidden overflow-y-scroll">
                    {screens()}
                </div>
                <div className="flex flex-col w-full pb-20">
                    <Button 
                        className="text-white bg-[#ea4335] w-full h-[57px] rounded-full" 
                        onPress={currentScreen === 0 ? handleNext : () => alert("가입 완료!")}
                    >
                        {currentScreen === 0 ? "다음" : "가입하기"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
