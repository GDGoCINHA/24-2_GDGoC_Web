'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Spinner } from "@nextui-org/react";
import Image from 'next/image';

import { useStudyDetail } from '@/hooks/study/useStudyDetail';
import { formatDate } from '@/utils/formatDate';

import StudyHeader from '@/components/study/StudyHeader';
import SubmitButton from '@/components/ui/button/SubmitButton';
import MarginBottom from '@/components/MarginBottom';

import gdgocIcon from '@public/src/images/GDGoC_icon.png';

export default function Detail() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = decodeURIComponent(urlParams.get('title'));
    const [isRecruiting, setIsRecruiting] = useState(false);
    const [leadDetail, setLeadDetail] = useState(false);

    // API: useStudyDetail
    const { studyInfo, studyLeadInfo, isApplied, isLoading, error: studyDetailError } = useStudyDetail();

    // Get recruiting status
    useEffect(() => {
        if (studyInfo) {
            setIsRecruiting(studyInfo.status === "RECRUITING");
        } else {
            setIsRecruiting(false);
        }
    }, [studyInfo]);

    // toggle lead detail
    const toggleLeadDetail = () => {
        setLeadDetail(!leadDetail);
    };

    // onClick to apply
    const handleClick = useCallback(() => {
        if (studyInfo) {
            router.push(`/study/apply?title=${encodeURIComponent(studyInfo.title)}`);
        }
    }, [studyInfo]);

    // Check if the user is already applied
    const renderSubmitButton = () => {
        if (!isRecruiting) return null;

        const isAlreadyApplied = isApplied !== false;

        return (
            <SubmitButton
                text={isAlreadyApplied ? "신청 완료" : "신청하기"}
                isDisabled={isAlreadyApplied}
                handleClick={isAlreadyApplied ? () => {} : handleClick}
            />
        );
    };

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner />
                </div>
            ) : (
                <>
                    {/* StudyHeader */}
                    <StudyHeader />
                    <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] items-center justify-center text-center">
                        <div className="flex flex-col mobile:flex-col items-center gap-2 mt-4 mobile:mt-2">
                            <div className="flex items-center gap-2">
                                {studyInfo ? (
                                    <Image
                                        src={studyInfo.imagePath}
                                        alt={`${studyTitle} Icon`}
                                        width="30"
                                        height="30"
                                        className="object-contain mobile:w-[25px]"
                                    />
                                ) : (
                                    <Image
                                        src={gdgocIcon}
                                        alt="gdgocIcon Icon"
                                        width="30"
                                        height="30"
                                        className="object-contain mobile:w-[25px]"
                                    />
                                )}
                                <h1 className="text-white text-3xl text-center mobile:text-xl">
                                    {studyTitle}
                                </h1>
                            </div>
                        </div>
                    </header>

                    {/* White Box */}
                    <div className="relative flex flex-col items-center justify-center w-full px-[96px] mobile:px-[24px] py-8">
                        <div className="w-full max-w-[800px] border border-white rounded-lg p-7 mobile:pb-2 relative overflow-hidden">
                            <div className="text-white relative">
                                {studyInfo ? (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-xl mobile:text-sm">{studyInfo.simpleIntroduce}</p>
                                        </div>

                                        <div className="mb-6 border-l-2 border-yellow-500 pl-4">
                                            <p className="mb-2 text-lg mobile:text-sm">모집 기간: {studyInfo.recruitStartDate ? formatDate(studyInfo.recruitStartDate) : '정보 없음'} ~ {studyInfo.recruitEndDate ? formatDate(studyInfo.recruitEndDate) : '정보 없음'}</p>
                                            <p className="text-lg mobile:text-sm">활동 기간: {studyInfo.activityStartDate ? formatDate(studyInfo.activityStartDate) : '정보 없음'} ~ {studyInfo.activityEndDate ? formatDate(studyInfo.activityEndDate) : '정보 없음'}</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="mb-4 text-lg mobile:text-sm">{studyInfo.activityIntroduce}</p>
                                        </div>

                                        <div className="bg-[#1f1f1f] p-4 rounded">
                                            <p className="mb-2 text-lg mobile:text-sm">장소: {studyInfo.expectedPlace}</p>
                                            <p className="text-lg mobile:text-sm">진행 시간: {studyInfo.expectedTime}</p>
                                        </div>
                                        <div className="mt-6 mobile:pt-0 mobile:p-4 rounded">
                                            <Button
                                                onPress={toggleLeadDetail}
                                                className="items-center justify-center bg-[#1f1f1f] rounded text-left"
                                            >
                                                <span className="ml-2 text-white transition-transform duration-200" style={{ transform: leadDetail ? 'rotate(90deg)' : 'rotate(0)' }}>
                                                    {'▶'}
                                                </span>
                                                <p className="text-white text-sm">스터디장 {studyLeadInfo.name} (정보 펼치기)</p>
                                            </Button>

                                            {leadDetail && (
                                                <div className="mt-2 p-4 bg-[#1f1f1f] rounded border border-white animate-fadeIn">
                                                    <p className="mb-2 text-lg mobile:text-sm">이름: {studyLeadInfo.name}</p>
                                                    <p className="mb-2 text-lg mobile:text-sm">학번: {studyLeadInfo.studentId}</p>
                                                    <p className="mb-2 text-lg mobile:text-sm">전공: {studyLeadInfo.major}</p>
                                                    <p className="mb-2 text-lg mobile:text-sm">학년: {studyLeadInfo.grade}학년</p>
                                                    <p className="text-lg mobile:text-sm">연락처: {studyLeadInfo.phoneNumber}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="mobile:pb-7">
                                        <h1 className="text-center text-xl mobile:text-lg">스터디 정보를 불러올 수 없습니다.</h1>
                                        <p className="text-center text-lg mobile:text-sm">URL을 다시 확인해주세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    {renderSubmitButton()}

                    {/* Margin Bottom to prevent Bottom touch */}
                    <MarginBottom />
                </>
            )}
        </>
    );
};