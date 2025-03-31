'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Header from '../Header';
import React, {useEffect, useState} from "react";
import axios from "axios";
import studyData from "../studyData";
import {Button, Spinner} from "@nextui-org/react";

export default function DetailPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(true);
    const [studyContent, setStudyContent] = useState([]);
    const [isRecruiting, setIsRecruiting] = useState(false);

    // API 호출
    // 없는 스터디 경우 예외 처리 필요
    useEffect(() => {
        const fetchStudyData = async () => {
            try {
                const response = await axios.get(`https://gdgocinha.site/studyData`);
                setStudyContent(response.data.studies);
            } catch (error) {
                // console.error('Error fetching study data', error);
                const data = studyData.studies.filter(study => study.title === studyTitle);
                setStudyContent(data);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyData();
    }, [studyTitle]);

    // studyContent 변경 시 모집 상태 업데이트
    useEffect(() => {
        if (studyContent.length > 0 && studyContent[0].status === "RECRUITING") {
            setIsRecruiting(true);
        } else {
            setIsRecruiting(false);
        }
    }, [studyContent]);

    const handleClick = () => {
        if (studyContent.length > 0) {
            router.push(`/study/apply?title=${studyContent[0].title}`);
        }
    };

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner />
                </div>
            ) : (
                <>
                    {/* Header */}
                        <Header />
                        <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:justify-self-center">
                            <h1 className="text-white text-xl text-left mobile:text-center">
                                {studyTitle} 스터디 상세 정보
                            </h1>
                        </header>

                        <div className="relative flex flex-col select-none text-white pt-[35px] px-[96px] mobile:px-[24px]">
                            <h2>스터디 장 정보</h2>
                            <p>이름: 이재아</p>
                            <p>학과: 컴퓨터공학과</p>
                            <p>학번: 12243954</p>
                            <p>전화번호: 010-3271-2218</p>
                            <p>학년: 2</p>
                        </div>
                        <hr className="justify-self-center w-[60%] select-none text-white pt-[35px] px-[96px]" />
                        <div className="relative flex flex-col select-none text-white pt-[35px] px-[96px] mobile:px-[24px]">
                            <h2>스터디 정보</h2>
                            {studyContent.length > 0 ? (
                                <>
                                    <p>모임 이름: {studyTitle}</p>
                                    <p>한 줄 소개: {studyContent[0].simIntro}</p>
                                    <p>모집기간: {studyContent[0].reqStart} ~ {studyContent[0].reqEnd}</p>
                                    <p>활동 기간: 시작시간 ~ 마감시간</p>
                                    <p>정기 모임 예상 기간: 매주 월요일 오후 7시</p>
                                    <p>정기 모임 예상 장소: 동방</p>
                                    <p>활동 소개: {studyContent[0].actIntro}</p>
                                    <p>활동 활동 활동 활동 활동 활동 활동 활동 활동 활동 활동 활동 활동 활동 활동 </p>
                                </>
                            ) : (
                                <p>스터디 정보를 불러올 수 없습니다.</p>
                            )}
                        </div>
                    <div className="flex justify-center">
                        {isRecruiting && (
                            <Button onPress={() => router.push(`/study/apply?title=${studyContent[0].title}`)} radius="full" className="mt-[40px] w-80 h-14 mobile:w-40 mobile:h-14 mobile:text-xl bg-gradient-to-r from-[#EA4335] to-[#FF6E62] text-white text-xl relative">
                                <span className="font-semibold">지원하기</span>
                            </Button>
                        )}
                    </div>
                </>
            )}
        </>
    );
};