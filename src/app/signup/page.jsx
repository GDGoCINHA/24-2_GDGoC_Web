"use client"
import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import ProfileInfoForm from "./components/ProfileInfoForm";
import AdditionalInfoForm from "./components/AdditionalInfoForm";
import usePasswordValidation from "./hooks/usePasswordValidation";
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi.js';

export default function Signup() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const { apiClient, handLeLogout }= useAuthenticatedApi();
    
    // 사용자 정보 상태
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [major, setMajor] = useState("");
    const [studentId, setStudentId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    
    // 애니메이션 상태
    const [isAnimating, setIsAnimating] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    
    // 필드 비활성화 상태
    const [isNameDisabled, setIsNameDisabled] = useState(false);
    const [isEmailDisabled, setIsEmailDisabled] = useState(false);
    
    // 비밀번호 유효성 검사 훅 사용
    const { errors } = usePasswordValidation(password);

    useEffect(() => {
        // localStorage에서 signup_email과 signup_name 값을 확인
        if (typeof window !== 'undefined') {
            const storedEmail = localStorage.getItem('signup_email');
            const storedName = localStorage.getItem('signup_name');
            
            if (storedEmail) {
                setEmail(storedEmail);
                setIsEmailDisabled(true);
            }
            
            if (storedName) {
                setName(storedName);
                setIsNameDisabled(true);
            }
        }
        
        setIsLoading(false);
    }, []);

    // 첫 번째 화면에서 다음 버튼 클릭 시 처리
    const handleNext = () => {
        if (!name || !email || !password || !confirmPassword) {
            alert("모든 칸을 채워주세요.");
            return;
        }
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        if(email === "pwc2002"){
            setIsEmailValid(true);
            alert("이미 가입된 이메일입니다.");
            return;
        }
        if(errors.length > 0){
            alert("비밀번호 조건을 만족해주세요.");
            return;
        }
        
        // 화면 전환 애니메이션
        setIsRendering(true);
        setTimeout(() => {
            setIsAnimating(true);
        }, 100);
    };

    const setMajorInfo = (value) => {
        setMajor(value);
    };

    // 가입하기 버튼 클릭 시 처리
    const handleSignup = async () => {
        if (!major || !studentId || !phoneNumber) {
            alert("모든 칸을 채워주세요.");
            console.log(name,email,password,major,studentId,phoneNumber);
            return;
        }

        // 회원가입 정보 객체 생성
        const userinfo = {
            name: name,
            email: email,
            password: password,
            major: major,
            studentId: studentId,
            phoneNumber: phoneNumber
        }

        try {
            const res = await apiClient.post('/auth/signup', userinfo);
            console.log(res);
        } catch (error) {
            console.log(error);
        }
        
        // 홈으로 리디렉션
        router.push("/");
    };

    // 로딩 상태 처리
    if (isLoading) {
        return (
            <div className="flex flex-col w-full items-center justify-center h-screen bg-black">
                <div className="text-white text-2xl">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full items-center justify-start h-screen bg-black">
            <div className="flex flex-col max-w-[414px] w-full h-full pt-[30px] px-5">
                <p className="text-white text-xl font-bold mb-2">회원가입하기</p>
                
                <div className="relative w-full h-full overflow-y-scroll">
                    <div key="screen1" className={`absolute w-full transition-all duration-500 ease-in-out transform ${isAnimating ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
                        <ProfileInfoForm 
                            name={name}
                            setName={setName}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                            errors={errors}
                            isEmailValid={isEmailValid}
                            isNameDisabled={isNameDisabled}
                            isEmailDisabled={isEmailDisabled}
                        />
                    </div>

                    <div key="screen2" className={`${isRendering ? "" : "hidden"} absolute w-full transition-all duration-500 ease-in-out transform ${isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
                        <AdditionalInfoForm 
                            major={major}
                            setMajor={setMajorInfo}
                            studentId={studentId}
                            setStudentId={setStudentId}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                        />
                    </div>
                </div>
                
                {/* 하단 버튼 영역 */}
                <div className="flex flex-col w-full pb-4 mt-auto">
                    <Button 
                        className="text-white bg-[#EA4336] w-full h-[48px] rounded-full" 
                        style={{boxShadow: "black 0px -10px 20px 10px"}}
                        onPress={isAnimating ? handleSignup : handleNext}
                        isDisabled={!isAnimating && (!name || !email || !password || !confirmPassword || errors.length > 0 || password !== confirmPassword)}
                    >
                        {isAnimating ? "가입하기" : "다음"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
