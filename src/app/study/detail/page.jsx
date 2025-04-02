'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Image, Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import Header from '../Header';
import { studyDetail } from "../mock/studyData";
import { user, attendee } from "../mock/userData";

export default function DetailPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(true);
    const [studyInfo, setStudyInfo] = useState(null);
    const [studyLeadInfo, setStudyLeadInfo] = useState(null);
    const [isRecruiting, setIsRecruiting] = useState(false);
    const [leadDetail, setLeadDetail] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    // API 호출
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if studyTitle is provided
                if (!studyTitle) {
                    router.push(`/study`); // 너는 여길 지나갈수 없다!
                    return;
                }

                // Fetch study info
                const { data: studyData } = await axios.get(`https://temp.gdgocinha.site/studyData?title=${studyTitle}`);
                if (!studyData) throw new Error('No study data found');
                setStudyInfo(studyData);

                // Fetch study lead info
                const { data: leadData } = await axios.get(`https://temp.gdgocinha.site/user?id=${studyData.createdBy}`);
                setStudyLeadInfo(leadData || null);

                // Fetch user's application status
                // NEED EDIT
                const thisUserId = 12253956;
                const { data: userApplication } = await axios.get(`https://temp.gdgocinha.site/atendee?id=${studyData.id}`);
                if (userApplication && userApplication.attendeeId === thisUserId) setIsApplied(true);
            } catch (error) {
                //console.error('Error fetching study data:');

                // Fallback to local study data
                const localStudyData = studyDetail.data.find(study => study.title === studyTitle);
                const localLeadData = user.data.find(usr => usr.studentId === localStudyData.createdBy);
                const localThisUserData = attendee.data.find(usr => usr.attendeeId === 12253956 && usr.studyId === localStudyData.id);
                setStudyInfo(localStudyData);
                setStudyLeadInfo(localLeadData);
                if (localThisUserData) setIsApplied(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studyTitle]);

    useEffect(() => {
        if (studyInfo) {
            setIsRecruiting(studyInfo.status === "RECRUITING");
        } else {
            setIsRecruiting(false);
        }
    }, [studyInfo]);

    const handleClick = () => {
        if (studyInfo) {
            router.push(`/study/apply?title=${studyInfo.title}`);
        }
    };

    const toggleLeadDetail = () => {
        setLeadDetail(!leadDetail);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "정보 없음";
        const date = new Date(dateString);
        const year = String(date.getFullYear()).slice(2); // Get last two digits of year
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two digits
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
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
                                {studyInfo ? (
                                    <div className="h-3/5 opacity-20 mt-2 items-center justify-center">
                                        <Image
                                            src={studyInfo.imagePath}
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
                                {studyInfo ? (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-lg">{studyInfo.simpleIntroduce}</p>
                                        </div>

                                        <div className="mb-6 border-l-2 border-gray-500 pl-4">
                                            <p className="mb-2">모집 기간: {studyInfo.recruitStartDate ? formatDate(studyInfo.recruitStartDate) : '정보 없음'} ~ {studyInfo.recruitEndDate ? formatDate(studyInfo.recruitEndDate) : '정보 없음'}</p>
                                            <p>활동 기간: {studyInfo.activityStartDate ? formatDate(studyInfo.activityStartDate) : '정보 없음'} ~ {studyInfo.activityEndDate ? formatDate(studyInfo.activityEndDate) : '정보 없음'}</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="mb-4">{studyInfo.activityIntroduce}</p>
                                        </div>

                                        <div className="bg-[#1f1f1f] p-4 rounded">
                                            <p className="mb-2">장소: {studyInfo.expectedPlace}</p>
                                            <p>진행 시간: {studyInfo.expectedTime}</p>
                                        </div>
                                        <div className="mt-6">
                                            <Button
                                                onPress={toggleLeadDetail}
                                                className="items-center justify-center bg-[#1d1d1d] rounded text-left"
                                            >
                                                <span className="ml-2 text-white transition-transform duration-200" style={{ transform: leadDetail ? 'rotate(90deg)' : 'rotate(0)' }}>
                                                    {'▶'}
                                                </span>
                                                <p className="text-white text-sm">스터디장 {studyLeadInfo.name} (정보 펼치기)</p>
                                            </Button>

                                            {leadDetail && (
                                                <div className="mt-2 p-4 bg-[#1a1a1a] rounded border border-gray-700 animate-fadeIn">
                                                    <p className="mb-2">이름: {studyLeadInfo.name}</p>
                                                    <p className="mb-2">학번: {studyLeadInfo.id}</p>
                                                    <p className="mb-2">전공: {studyLeadInfo.major}</p>
                                                    <p className="mb-2">학년: {studyLeadInfo.grade}학년</p>
                                                    <p className="mb-2">연락처: {studyLeadInfo.phoneNumber}</p>
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