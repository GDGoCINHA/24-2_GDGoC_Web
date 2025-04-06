'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Spinner } from "@nextui-org/react";
import Image from 'next/image';
import axios from "axios";
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import Header from '../Header';
import gdgocIcon from '@public/src/images/GDGoC_icon.png';
import studyList from "../mock/studyData";
import { user, attendee } from "../mock/userData";

export default function Detail() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const urlParams = useSearchParams();
    const studyTitle = decodeURIComponent(urlParams.get('title'));
    const [isLoading, setIsLoading] = useState(true);
    const [studyInfo, setStudyInfo] = useState(null);
    const [studyLeadInfo, setStudyLeadInfo] = useState(null);
    const [isRecruiting, setIsRecruiting] = useState(false);
    const [leadDetail, setLeadDetail] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    // Call API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if studyTitle is provided
                if (!studyTitle || studyTitle === "null") { // 타이틀이 없는 자, 너는 여길 지나갈수 없다!
                    router.push(`/study`);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    const studyData = studyList.data.studyList.find(study => study.title === studyTitle);
                    const leadData = user.data.find(usr => usr.studentId === studyData.creatorId);
                    const userApplication = attendee.data.applications.find(usr => usr.attendeeId === 12253956 && usr.studyId === studyData.id);
                    setStudyInfo(studyData);
                    setStudyLeadInfo(leadData);
                    if (userApplication) setIsApplied(true);
                } else {
                    // Fetch study info
                    const { data: studyDataRes } = await apiClient.get('/studyData?page=1');
                    const studyData = studyDataRes.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);

                    // Fetch study lead info
                    const { data: studyLeadDataRes } = await apiClient.get(`/user?id=${studyData.creatorId}`);
                    setStudyLeadInfo(studyLeadDataRes);

                    // Fetch user's application status
                    const thisUserId = 12253956;
                    const { data: userApplications } = await apiClient.get(`/attendee?studyId=${studyData.id}`);
                    if (userApplications.applications.filter((application) => application.attendeeId === thisUserId).length > 0) {
                        setIsApplied(true);
                    }
                }
            } catch (error) {
                console.error('Lerror fetching study data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studyTitle]);

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

    // Date format
    function formatDate(dateString) {
        if (!dateString) return "정보없음";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "정보없음";
        const year = String(date.getFullYear());
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // add later
        /*
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        */
        return `${year}/${month}/${day}`;
    }

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
                    <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] items-center justify-center text-center">
                        <div className="flex flex-col mobile:flex-col items-center gap-2 mt-4 mobile:mt-2">
                            <div className="flex items-center gap-2">
                                {studyInfo && Object.keys(studyInfo).length > 0 ? (
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
                                <h1 className="text-white text-2xl text-center mobile:text-lg">
                                    {studyTitle}
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="relative flex flex-col items-center justify-center w-full px-[96px] mobile:px-[24px] py-8">
                        <div className="w-full max-w-[800px] border border-white rounded-lg p-8 relative overflow-hidden">
                            <div className="text-white relative z-10">
                                {studyInfo && Object.keys(studyInfo).length > 0 ? (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-lg">{studyInfo.simpleIntroduce}</p>
                                        </div>

                                        <div className="mb-6 border-l-2 border-yellow-500 pl-4">
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
                                                className="items-center justify-center bg-[#1f1f1f] rounded text-left"
                                            >
                                                <span className="ml-2 text-white transition-transform duration-200" style={{ transform: leadDetail ? 'rotate(90deg)' : 'rotate(0)' }}>
                                                    {'▶'}
                                                </span>
                                                <p className="text-white text-sm">스터디장 {studyLeadInfo.name} (정보 펼치기)</p>
                                            </Button>

                                            {leadDetail && (
                                                <div className="mt-2 p-4 bg-[#1f1f1f] rounded border border-white animate-fadeIn">
                                                    <p className="mb-2">이름: {studyLeadInfo.name}</p>
                                                    <p className="mb-2">학번: {studyLeadInfo.studentId}</p>
                                                    <p className="mb-2">전공: {studyLeadInfo.major}</p>
                                                    <p className="mb-2">학년: {studyLeadInfo.grade}학년</p>
                                                    <p className="mb-2">연락처: {studyLeadInfo.phoneNumber}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-center text-xl">스터디 정보를 불러올 수 없습니다.</h1>
                                        <p className="text-center">URL을 다시 확인해주세요.</p>
                                    </>
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