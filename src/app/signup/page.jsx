"use client"
import { useState, useMemo, useEffect } from "react";
import { Button, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Select, SelectItem, Chip, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [id, setId] = useState("");
    const [major, setMajor] = useState(new Set([]));
    const [interest, setInterest] = useState(new Set([]));
    const errors = [];

    const [isAnimating, setIsAnimating] = useState(false);
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        if (!document.referrer) {
            router.push('/');
        } else {
            setIsLoading(false);
        }
    }, []);

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
        if(email == "pwc2002"){
            setIsEmailValid(true);
            alert("이미 가입된 이메일입니다.");
            return;
        }
        if(errors.length > 0){
            alert("비밀번호 조건을 만족해주세요.");
            return;
        }
        setIsRendering(true);
        setTimeout(() => {
            setIsAnimating(true);
        }, 100);
    };

    const handleSignup = () => {
        const userinfo = {
            name: name,
            email: email,
            password: password,
            id: id,
            major: major,
            interest: Array.from(interest).filter(item => item !== ''),
        }
        console.log(userinfo);
        router.push("/");
    };

    const handleSelectionChange = (e) => {
        const selectedItems = new Set(e.target.value.split(','));
        if(Array.from(selectedItems).filter(item => item !== '').length > 3){
            alert("관심분야는 3개까지만 선택할 수 있습니다.");
            return;
        } else {
            setInterest(selectedItems);
        }
    };

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner />
                </div>
            ) : (
                <div className="flex flex-col w-full items-center justify-start h-screen">
                    <div className="flex flex-col max-w-[414px] w-full h-full pt-[72px] px-5">
                        <p className="text-white text-xl font-bold">회원가입하기</p>
                        <div className="relative w-full h-full overflow-y-scroll">
                            <div key="screen1"  className={`absolute w-full transition-all duration-500 ease-in-out transform  ${isAnimating ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`} >
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
                                <p className={`text-[#FF5252] text-[15px] ml-[21px] mt-[6px] ${isEmailValid ? "opacity-100" : "opacity-0"}`}>이미 가입된 이메일입니다!</p>
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
                            <div key="screen2" className={` ${isRendering ? "" : "hidden"} absolute w-full transition-all duration-500 ease-in-out transform  ${isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
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
                                <Autocomplete label="전공" labelPlacement="outside" placeholder="학과를 지정해주세요"
                                    className="!mt-14"
                                    classNames={{
                                        popoverContent: "bg-[#1c1c1c]"
                                    }}
                                    inputProps={{
                                        classNames: {
                                            label: "!text-white text-[21px] pb-3",
                                            inputWrapper: "rounded-full bg-[#1c1c1c] group-data-[focus=true]:bg-[#1c1c1c] group-data-[hover=true]:bg-[#1c1c1c] h-[57px]",
                                            input: "!text-white text-[18px]"
                                        }
                                    }}
                                    popoverProps={{
                                        classNames: {
                                            base: "mt-3"
                                        }
                                    }}
                                    listboxProps={{
                                        classNames: {
                                            base: "bg-[#1c1c1c] text-white",
                                        }
                                    }}
                                    selectedKeys={major}
                                    onSelectionChange={setMajor}
                                >
                                    <AutocompleteSection title="프런티어 학부대학">
                                        <AutocompleteItem key="자유전공학부" aria-label="자유전공학부" value="자유전공학부">자유전공학부</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="공과대학" showDivider >
                                        <AutocompleteItem key="기계공학과" aria-label="기계공학과" value="기계공학과">기계공학과</AutocompleteItem>
                                        <AutocompleteItem key="항공우주공학과" aria-label="항공우주공학과" value="항공우주공학과">항공우주공학과</AutocompleteItem>
                                        <AutocompleteItem key="조선해양공학과" aria-label="조선해양공학과" value="조선해양공학과">조선해양공학과</AutocompleteItem>
                                        <AutocompleteItem key="산업경영공학과" aria-label="산업경영공학과" value="산업경영공학과">산업경영공학과</AutocompleteItem>
                                        <AutocompleteItem key="화학공학과" aria-label="화학공학과" value="화학공학과">화학공학과</AutocompleteItem>
                                        <AutocompleteItem key="고분자공학과" aria-label="고분자공학과" value="고분자공학과">고분자공학과</AutocompleteItem>
                                        <AutocompleteItem key="신소재공학과" aria-label="신소재공학과" value="신소재공학과">신소재공학과</AutocompleteItem>
                                        <AutocompleteItem key="사회인프라공학과" aria-label="사회인프라공학과" value="사회인프라공학과">사회인프라공학과</AutocompleteItem>
                                        <AutocompleteItem key="환경공학과" aria-label="환경공학과" value="환경공학과">환경공학과</AutocompleteItem>
                                        <AutocompleteItem key="공간정보공학과" aria-label="공간정보공학과" value="공간정보공학과">공간정보공학과</AutocompleteItem>
                                        <AutocompleteItem key="건축학부(건축공학)" aria-label="건축학부(건축공학)" value="건축학부(건축공학)">건축학부(건축공학)</AutocompleteItem>
                                        <AutocompleteItem key="건축학부(건축학)" aria-label="건축학부(건축학)" value="건축학부(건축학)">건축학부(건축학)</AutocompleteItem>
                                        <AutocompleteItem key="에너지자원공학과" aria-label="에너지자원공학과" value="에너지자원공학과">에너지자원공학과</AutocompleteItem>
                                        <AutocompleteItem key="융합기술경영학부" aria-label="융합기술경영학부" value="융합기술경영학부">융합기술경영학부</AutocompleteItem>
                                        <AutocompleteItem key="전기공학과" aria-label="전기공학과" value="전기공학과">전기공학과</AutocompleteItem>
                                        <AutocompleteItem key="전자공학과" aria-label="전자공학과" value="전자공학과">전자공학과</AutocompleteItem>
                                        <AutocompleteItem key="정보통신공학과" aria-label="정보통신공학과" value="정보통신공학과">정보통신공학과</AutocompleteItem>
                                        <AutocompleteItem key="반도체시스템공학과" aria-label="반도체시스템공학과" value="반도체시스템공학과">반도체시스템공학과</AutocompleteItem>
                                        <AutocompleteItem key="미래자동차공학(융합전공)" aria-label="미래자동차공학(융합전공)" value="미래자동차공학(융합전공)">미래자동차공학(융합전공)</AutocompleteItem>
                                        <AutocompleteItem key="이차전지공학(융합전공)" aria-label="이차전지공학(융합전공)" value="이차전지공학(융합전공)">이차전지공학(융합전공)</AutocompleteItem>
                                        <AutocompleteItem key="반도체공학(융합전공)" aria-label="반도체공학(융합전공)" value="반도체공학(융합전공)">반도체공학(융합전공)</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="자연과학대학" showDivider>
                                        <AutocompleteItem key="수학과" aria-label="수학과" value="수학과">수학과</AutocompleteItem>
                                        <AutocompleteItem key="통계학과" aria-label="통계학과" value="통계학과">통계학과</AutocompleteItem>
                                        <AutocompleteItem key="물리학과" aria-label="물리학과" value="물리학과">물리학과</AutocompleteItem>
                                        <AutocompleteItem key="화학과" aria-label="화학과" value="화학과">화학과</AutocompleteItem>
                                        <AutocompleteItem key="해양과학과" aria-label="해양과학과" value="해양과학과">해양과학과</AutocompleteItem>
                                        <AutocompleteItem key="식품영양학과" aria-label="식품영양학과" value="식품영양학과">식품영양학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="경영대학" showDivider>
                                        <AutocompleteItem key="경영학과" aria-label="경영학과" value="경영학과">경영학과</AutocompleteItem>
                                        <AutocompleteItem key="글로벌금융학과" aria-label="글로벌금융학과" value="글로벌금융학과">글로벌금융학과</AutocompleteItem>
                                        <AutocompleteItem key="아태물류학부" aria-label="아태물류학부" value="아태물류학부">아태물류학부</AutocompleteItem>
                                        <AutocompleteItem key="국제통상학과" aria-label="국제통상학과" value="국제통상학과">국제통상학과</AutocompleteItem>
                                        <AutocompleteItem key="기후위기대응(융합전공)" aria-label="기후위기대응(융합전공)" value="기후위기대응(융합전공)">기후위기대응(융합전공)</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="사범대학" showDivider>
                                        <AutocompleteItem key="국어교육과" aria-label="국어교육과" value="국어교육과">국어교육과</AutocompleteItem>
                                        <AutocompleteItem key="영어교육과" aria-label="영어교육과" value="영어교육과">영어교육과</AutocompleteItem>
                                        <AutocompleteItem key="사회교육과" aria-label="사회교육과" value="사회교육과">사회교육과</AutocompleteItem>
                                        <AutocompleteItem key="교육학과" aria-label="교육학과" value="교육학과">교육학과</AutocompleteItem>
                                        <AutocompleteItem key="체육교육과" aria-label="체육교육과" value="체육교육과">체육교육과</AutocompleteItem>
                                        <AutocompleteItem key="수학교육과" aria-label="수학교육과" value="수학교육과">수학교육과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="사회과학대학" showDivider>
                                        <AutocompleteItem key="행정학과" aria-label="행정학과" value="행정학과">행정학과</AutocompleteItem>
                                        <AutocompleteItem key="정치외교학과" aria-label="정치외교학과" value="정치외교학과">정치외교학과</AutocompleteItem>
                                        <AutocompleteItem key="미디어커뮤니케이션학과" aria-label="미디어커뮤니케이션학과" value="미디어커뮤니케이션학과">미디어커뮤니케이션학과</AutocompleteItem>
                                        <AutocompleteItem key="경제학과" aria-label="경제학과" value="경제학과">경제학과</AutocompleteItem>
                                        <AutocompleteItem key="소비자학과" aria-label="소비자학과" value="소비자학과">소비자학과</AutocompleteItem>
                                        <AutocompleteItem key="아동심리학과" aria-label="아동심리학과" value="아동심리학과">아동심리학과</AutocompleteItem>
                                        <AutocompleteItem key="사회복지학과" aria-label="사회복지학과" value="사회복지학과">사회복지학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="문과대학" showDivider>
                                        <AutocompleteItem key="한국어문학과" aria-label="한국어문학과" value="한국어문학과">한국어문학과</AutocompleteItem>
                                        <AutocompleteItem key="사학과" aria-label="사학과" value="사학과">사학과</AutocompleteItem>
                                        <AutocompleteItem key="철학과" aria-label="철학과" value="철학과">철학과</AutocompleteItem>
                                        <AutocompleteItem key="중국학과" aria-label="중국학과" value="중국학과">중국학과</AutocompleteItem>
                                        <AutocompleteItem key="일본언어문화학과" aria-label="일본언어문화학과" value="일본언어문화학과">일본언어문화학과</AutocompleteItem>
                                        <AutocompleteItem key="영어영문학과" aria-label="영어영문학과" value="영어영문학과">영어영문학과</AutocompleteItem>
                                        <AutocompleteItem key="프랑스언어문화학과" aria-label="프랑스언어문화학과" value="프랑스언어문화학과">프랑스언어문화학과</AutocompleteItem>
                                        <AutocompleteItem key="문화콘텐츠문화경영학과" aria-label="문화콘텐츠문화경영학과" value="문화콘텐츠문화경영학과">문화콘텐츠문화경영학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="의과대학" showDivider>
                                        <AutocompleteItem key="의예과" aria-label="의예과" value="의예과">의예과</AutocompleteItem>
                                        <AutocompleteItem key="의학과" aria-label="의학과" value="의학과">의학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="간호대학" showDivider>
                                        <AutocompleteItem key="간호학과" aria-label="간호학과" value="간호학과">간호학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="미래융합대학" showDivider>
                                        <AutocompleteItem key="메카트로닉스공학과" aria-label="메카트로닉스공학과" value="메카트로닉스공학과">메카트로닉스공학과</AutocompleteItem>
                                        <AutocompleteItem key="소프트웨어융합공학과" aria-label="소프트웨어융합공학과" value="소프트웨어융합공학과">소프트웨어융합공학과</AutocompleteItem>
                                        <AutocompleteItem key="산업경영학과" aria-label="산업경영학과" value="산업경영학과">산업경영학과</AutocompleteItem>
                                        <AutocompleteItem key="금융투자학과" aria-label="금융투자학과" value="금융투자학과">금융투자학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="예술체육대학" showDivider>
                                        <AutocompleteItem key="조형예술학과" aria-label="조형예술학과" value="조형예술학과">조형예술학과</AutocompleteItem>
                                        <AutocompleteItem key="디자인융합학과" aria-label="디자인융합학과" value="디자인융합학과">디자인융합학과</AutocompleteItem>
                                        <AutocompleteItem key="스포츠과학과" aria-label="스포츠과학과" value="스포츠과학과">스포츠과학과</AutocompleteItem>
                                        <AutocompleteItem key="연극영화학과" aria-label="연극영화학과" value="연극영화학과">연극영화학과</AutocompleteItem>
                                        <AutocompleteItem key="의류디자인학과" aria-label="의류디자인학과" value="의류디자인학과">의류디자인학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="국제학부" showDivider>
                                        <AutocompleteItem key="IBT학과" aria-label="IBT학과" value="IBT학과">IBT학과</AutocompleteItem>
                                        <AutocompleteItem key="ISE학과" aria-label="ISE학과" value="ISE학과">ISE학과</AutocompleteItem>
                                        <AutocompleteItem key="KLC학과" aria-label="KLC학과" value="KLC학과">KLC학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="소프트웨어융합대학" showDivider>
                                        <AutocompleteItem key="인공지능공학과" aria-label="인공지능공학과" value="인공지능공학과">인공지능공학과</AutocompleteItem>
                                        <AutocompleteItem key="데이터사이언스학과" aria-label="데이터사이언스학과" value="데이터사이언스학과">데이터사이언스학과</AutocompleteItem>
                                        <AutocompleteItem key="스마트모빌리티공학과" aria-label="스마트모빌리티공학과" value="스마트모빌리티공학과">스마트모빌리티공학과</AutocompleteItem>
                                        <AutocompleteItem key="디자인테크놀로지학과" aria-label="디자인테크놀로지학과" value="디자인테크놀로지학과">디자인테크놀로지학과</AutocompleteItem>
                                        <AutocompleteItem key="컴퓨터공학과" aria-label="컴퓨터공학과" value="컴퓨터공학과">컴퓨터공학과</AutocompleteItem>
                                    </AutocompleteSection>
                                    <AutocompleteSection title="바이오시스템융합학부" showDivider>
                                        <AutocompleteItem key="생명공학과" aria-label="생명공학과" value="생명공학과">생명공학과</AutocompleteItem>
                                        <AutocompleteItem key="바이오제약공학과" aria-label="바이오제약공학과" value="바이오제약공학과">바이오제약공학과</AutocompleteItem>
                                        <AutocompleteItem key="생명과학과" aria-label="생명과학과" value="생명과학과">생명과학과</AutocompleteItem>
                                    </AutocompleteSection>
                                </Autocomplete>
                                <Select label="관심분야" labelPlacement="outside" placeholder="관심분야를 선택해주세요"
                                    className="!mt-9 mb-10"
                                    classNames={{
                                        label: "!text-white text-[21px] pb-3",
                                        trigger: `rounded-full bg-[#1c1c1c] !h-[57px] 
                                                    group-data-[focus=true]:bg-[#1c1c1c]
                                                    data-[hover=true]:bg-[#1c1c1c]
                                                    `,
                                        value: "!text-white !text-[18px] !text-[#71717a]",
                                        popoverContent: "bg-[#1c1c1c]",
                                        innerWrapper: "pl-2"
                                    }}
                                    popoverProps={{
                                        classNames: {
                                            base: "mt-3",
                                            content: "bg-[#1c1c1c]"
                                        }
                                    }}
                                    listboxProps={{
                                        classNames: {
                                            base: "bg-[#1c1c1c] text-white",
                                        }
                                    }}
                                    isMultiline={true}
                                    selectionMode="multiple"
                                    renderValue={(items) => {
                                        return (
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item, index) => (
                                                <Chip key={index}>
                                                    {item.props.value}</Chip>
                                                ))}
                                            </div>
                                            );
                                        }}
                                    selectedKeys={interest}
                                    onChange={handleSelectionChange}
                                >
                                    <SelectItem key="FrontEnd" value="FrontEnd">FrontEnd</SelectItem>
                                    <SelectItem key="BackEnd" value="BackEnd">BackEnd</SelectItem>
                                    <SelectItem key="UX/UI" value="UX/UI">UX/UI</SelectItem>
                                    <SelectItem key="AI" value="AI">AI</SelectItem>
                                    <SelectItem key="Mobile" value="Mobile">Mobile</SelectItem>
                                    <SelectItem key="Game" value="Game">Game</SelectItem>
                                    <SelectItem key="3D" value="3D">3D 디자인</SelectItem>
                                    <SelectItem key="IT" value="IT">IT 기획 및 경영</SelectItem>
                                    <SelectItem key="PM" value="PM">PM</SelectItem>
                                    <SelectItem key="Startup" value="Startup">스타트업</SelectItem>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-col w-full pb-20">
                            <Button 
                                className="text-white bg-[#ea4335] w-full h-[57px] rounded-full" 
                                style={{boxShadow: "black 0px -10px 20px 10px"}}
                                onPress={isAnimating ? handleSignup : handleNext}
                            >
                                {isAnimating ? "가입하기" : "다음"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
