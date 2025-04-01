'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Image, Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import Header from '../Header';
import studyDetailData from "../studyDetailData";

export default function DetailPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(true);
    const [studyContent, setStudyContent] = useState(null);
    const [isRecruiting, setIsRecruiting] = useState(false);
    const [leadDetail, setLeadDetail] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    // API 호출
    // 이미 신청 받았을 경우 신청 버튼 예외 처리 필요
    useEffect(() => {
        const fetchStudyData = async () => {
            try {
                if (!studyTitle) {
                    //throw new Error('Study title is missing');
                    router.push(`/study`);
                }

                const response = await axios.get(`https://temp.gdgocinha.site/studyData?title=${studyTitle}`);

                if (response.status === 200 && response.data) {
                    setStudyContent(response.data);
                } else {
                    setStudyContent(null);
                }
                setIsLoading(false);
            } catch (error) {
                //console.error('Error fetching study data:');

                // remove when deploy
                const data = studyDetailData.data.filter(study => study.title === studyTitle);
                if (data.length > 0) {
                    setStudyContent(data[0]);
                } else {
                    setStudyContent(null);
                }

                setIsLoading(false); // remove when deploy
            }
        };

        fetchStudyData();
    }, [studyTitle]);

    // 신청 버튼 예외 처리 위해서 유저가 신청 했는지 체크하기

    useEffect(() => {
        if (studyContent) {
            setIsRecruiting(studyContent.status === "RECRUITING");
        } else {
            setIsRecruiting(false);
        }
    }, [studyContent]);

    const handleClick = () => {
        if (studyContent) {
            router.push(`/study/apply?title=${studyContent.title}`);
        }
    };

    const toggleLeadDetail = () => {
        setLeadDetail(!leadDetail);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formatter = new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const formattedDate = formatter.format(date);
        return formattedDate.replace(',', '');
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
                                {studyContent ? (
                                    <div className="h-3/5 opacity-20 mt-2 items-center justify-center">
                                        <Image
                                            src={studyContent.imagePath}
                                            alt={`${studyTitle} 배경`}
                                            width="50"
                                            height="50"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-3/5 opacity-20 mt-4 flex items-center justify-center">
                                        <Image
                                            src="/src/images/GDGoC_icon.png"
                                            alt="gdgocIcon 배경"
                                            width="50"
                                            height="50"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="text-white relative z-10">
                                {studyContent ? (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-lg">{studyContent.simpleIntroduce}</p>
                                        </div>

                                        <div className="mb-6 border-l-2 border-gray-500 pl-4">
                                            <p className="mb-2">모집 기간: {studyContent.recruitStartDate ? formatDate(studyContent.recruitStartDate) : '정보 없음'} ~ {studyContent.recruitEndDate ? formatDate(studyContent.recruitEndDate) : '정보 없음'}</p>
                                            <p>활동 기간: {studyContent.activityStartDate ? formatDate(studyContent.activityStartDate) : '정보 없음'} ~ {studyContent.activityEndDate ? formatDate(studyContent.activityEndDate) : '정보 없음'}</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="mb-4">{studyContent.activityIntroduce}</p>
                                        </div>

                                        <div className="bg-[#1f1f1f] p-4 rounded">
                                            <p className="mb-2">장소: {studyContent.expectedPlace}</p>
                                            <p>진행 시간: {studyContent.expectedTime}</p>
                                        </div>
                                        <div className="mt-6">
                                            <Button
                                                onPress={toggleLeadDetail}
                                                className="items-center justify-center bg-[#1d1d1d] rounded text-left"
                                            >
                                                <span className="ml-2 text-white transition-transform duration-200" style={{ transform: leadDetail ? 'rotate(90deg)' : 'rotate(0)' }}>
                                                    {'▶'}
                                                </span>
                                                <p className="text-white text-sm">스터디장 이재아 (정보 펼치기)</p>
                                            </Button>

                                            {leadDetail && (
                                                <div className="mt-2 p-4 bg-[#1a1a1a] rounded border border-gray-700 animate-fadeIn">
                                                    <p className="mb-2">이름: 이재아</p>
                                                    <p className="mb-2">학번: 12243954</p>
                                                    <p className="mb-2">전공: 컴퓨터공학과</p>
                                                    <p className="mb-2">학년: 2학년</p>
                                                    <p className="mb-2">연락처: 010-1234-1234</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <h1 className="text-center text-xl">스터디 정보를 불러올 수 없습니다.</h1>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-center mt-4">
                        {isRecruiting && (
                            isApplied !== false ? (
                                <Button
                                    className="w-3/4 max-w-sm h-14 bg-red-500 text-white text-lg font-semibold rounded-lg pointer-events-none"
                                    disabled
                                >
                                    신청 완료
                                </Button>
                            ) : (
                                <Button
                                    onPress={() => handleClick()}
                                    className="w-3/4 max-w-sm h-14 bg-red-500 text-white text-lg font-semibold rounded-lg"
                                >
                                    신청하기
                                </Button>
                            )
                        )}
                    </div>
                </>
            )}
        </>
    );
};