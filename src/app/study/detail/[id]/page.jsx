'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button, Spinner } from "@nextui-org/react";
import Image from 'next/image';

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useStudyDetail } from '@/hooks/study/useStudyDetail';

// components
import StudyHeader from '@/components/study/StudyHeader';
import SubmitButton from '@/components/ui/button/SubmitButton';
import MarginBottom from '@/components/MarginBottom';

// utils
import { formatDate } from '@/utils/formatDate';

import gdgocIcon from '@public/src/images/GDGoC_icon.png';

export default function Detail() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const pathParams = useParams();
    const studyId =  decodeURIComponent(pathParams.id);
    const [leadInfoToggle, setLeadInfoToggle] = useState(false);

    // API: useStudyDetail
    const { studyDetail, studyLead, isRecruiting, isApplied, isLoading, error } = useStudyDetail(apiClient, studyId);

    // toggle lead detail
    const toggleLeadDetail = () => {
        setLeadInfoToggle(!leadInfoToggle);
    };

    // onClick to Apply
    const sendToApply = useCallback(() => {
        if (studyId) {
            router.push(`/study/apply/${encodeURIComponent(studyId)}`);
        }
    }, [router, studyId]);

    // onClick to MyPage
    const sendToMyPage = useCallback(() => {
        router.push(`/study/my/`);
    }, [router]);

    // Check if the user is already applied
    const renderSubmitButton = () => {
        if (!isRecruiting) return null;

        return (
            <SubmitButton
                type="button"
                text={isApplied ? "신청 완료" : "신청하기"}
                isDisabled={false}
                handleClick={isApplied ? sendToMyPage : sendToApply}
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
                                {studyDetail ? (
                                    <Image
                                        src={studyDetail.imagePath}
                                        alt={`${studyDetail.title} Icon`}
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
                                    { studyDetail?.title || '존재하지 않는 스터디' }
                                </h1>
                            </div>
                        </div>
                    </header>

                    {/* White Box */}
                    <div className="relative flex flex-col items-center justify-center w-full px-[96px] mobile:px-[24px] py-8">
                        <div className="w-full max-w-[800px] border border-white rounded-lg p-7 mobile:pb-2 relative overflow-hidden">
                            <div className="text-white relative">
                                {studyDetail ? (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-xl mobile:text-sm">{studyDetail.simpleIntroduce}</p>
                                        </div>

                                        <div className="mb-6 border-l-2 border-yellow-500 pl-4">
                                            <p className="mb-2 text-lg mobile:text-sm">모집 기간: {studyDetail.recruitStartDate ? formatDate(studyDetail.recruitStartDate) : '정보 없음'} ~ {studyDetail.recruitEndDate ? formatDate(studyDetail.recruitEndDate) : '정보 없음'}</p>
                                            <p className="text-lg mobile:text-sm">활동 기간: {studyDetail.activityStartDate ? formatDate(studyDetail.activityStartDate) : '정보 없음'} ~ {studyDetail.activityEndDate ? formatDate(studyDetail.activityEndDate) : '정보 없음'}</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="mb-4 text-lg mobile:text-sm">{studyDetail.activityIntroduce}</p>
                                        </div>

                                        <div className="bg-[#1f1f1f] p-4 rounded">
                                            <p className="mb-2 text-lg mobile:text-sm">장소: {studyDetail.expectedPlace}</p>
                                            <p className="text-lg mobile:text-sm">진행 시간: {studyDetail.expectedTime}</p>
                                        </div>
                                        <div className="mt-6 mobile:pt-0 mobile:p-4 rounded">
                                            <Button
                                                onPress={toggleLeadDetail}
                                                className="items-center justify-center bg-[#1f1f1f] rounded text-left"
                                            >
                                                <span className="ml-2 text-white transition-transform duration-200" style={{ transform: leadInfoToggle ? 'rotate(90deg)' : 'rotate(0)' }}>
                                                    {'▶'}
                                                </span>
                                                <p className="text-white text-sm">스터디장 {studyLead.name} (정보 펼치기)</p>
                                            </Button>

                                            {leadInfoToggle && (
                                                <div className="mt-2 p-4 bg-[#1f1f1f] rounded border border-white animate-fadeIn">
                                                    <p className="mb-2 text-lg mobile:text-sm">이름: {studyLead.name}</p>
                                                    <p className="mb-2 text-lg mobile:text-sm">학번: {studyLead.studentId}</p>
                                                    <p className="mb-2 text-lg mobile:text-sm">전공: {studyLead.major}</p>
                                                    <p className="text-lg mobile:text-sm">연락처: {studyLead.phoneNumber}</p>
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