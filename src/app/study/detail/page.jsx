'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Header from '../Header';
import React, {useEffect, useState} from "react";
import axios from "axios";
import studyData from "../studyData";
import {Image, Button, Spinner} from "@nextui-org/react";

export default function DetailPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(true);
    const [studyContent, setStudyContent] = useState([]);
    const [isRecruiting, setIsRecruiting] = useState(false);

    // API 호출
    useEffect(() => {
        const fetchStudyData = async () => {
            try {
                const response = await axios.get(`https://temp.gdgocinha.site/studyData`);
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
                        <h1 className="text-white text-2xl text-left mobile:text-center">
                            {studyTitle} 스터디 상세 정보
                        </h1>
                    </header>

                    <div className="relative flex flex-col items-center justify-center w-full px-[96px] mobile:px-[24px] py-8">
                        <div className="w-full max-w-[800px] border border-white rounded-lg p-8 relative overflow-hidden">
                            {/* 중앙에 흐리게 처리된 배경 이미지 */}
                            <div className="absolute inset-0 flex justify-center pointer-events-none">
                                {studyContent.length > 0 && studyContent[0].thumbnail ? (
                                    <div className="h-3/5 opacity-20 mt-2 items-center justify-center">
                                        <Image
                                            src={studyContent[0].thumbnail}
                                            alt={`${studyTitle} 배경`}
                                            width="50"
                                            height="50"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-3/5 opacity-20 mt-4 flex items-center justify-center">
                                        <Image
                                            src="/src/images/GDGoC_icon.pngç"
                                            alt="gdgocIcon 배경"
                                            width="50"
                                            height="50"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="text-white relative z-10">
                                {studyContent.length > 0 ? (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-lg">{studyContent[0].simIntro}</p>
                                        </div>

                                        <div className="mb-6 border-l-2 border-gray-500 pl-4">
                                            <p className="mb-2">모집 기간: {studyContent[0].reqStart} ~ {studyContent[0].reqEnd}</p>
                                            <p>활동 기간: {studyContent[0].actStart} ~ {studyContent[0].actEnd}</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="mb-4">{studyContent[0].actIntro}</p>
                                        </div>

                                        <div className="bg-[#2a2a2a] p-4 rounded">
                                            <p className="mb-2">장소: {studyContent[0].expPlace}</p>
                                            <p>진행 시간: {studyContent[0].expTime}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p>스터디 정보를 불러올 수 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-center mt-4">
                        {isRecruiting && (
                            <Button
                                onPress={() => router.push(`/study/apply?title=${studyContent[0].title}`)}
                                className="w-3/4 max-w-sm h-14 bg-red-500 text-white text-lg font-semibold rounded-lg"
                            >
                                신청하기
                            </Button>
                        )}
                    </div>
                </>
            )}
        </>
    );
};