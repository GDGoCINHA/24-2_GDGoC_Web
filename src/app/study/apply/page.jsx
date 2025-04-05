'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Textarea, Spinner } from '@nextui-org/react';
import Image from 'next/image';
import axios from 'axios';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import Header from '../Header';
import gdgocIcon from '@public/src/images/GDGoC_icon.png';
import studyList from "../mock/studyData";
import { user, attendee } from "../mock/userData";

export default function Apply() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(true);
    const [studyInfo, setStudyInfo] = useState(null);

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
                    setStudyInfo(studyData);

                    const userApplication = attendee.data.applications.find(usr => usr.attendeeId === 12253956 && usr.studyId === studyData.id);
                    if (userApplication) { // 당신은 이미 지원을 했다!
                        router.push(`/study/detail?title=${encodeURIComponent(studyTitle)}`);
                    }
                } else {
                    const { data: studyDataRes } = await apiClient.get('/studyData?page=1');
                    const studyData = studyDataRes.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);

                    const thisUserId = 12253956;
                    const { data: userApplications } = await apiClient.get('/attendee?studyId=${studyData.id}');
                    if (userApplications.applications.filter((application) => application.attendeeId === thisUserId).length > 0) {
                        router.push(`/study/detail?title=${encodeURIComponent(studyTitle)}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching study data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studyTitle]);

    // NEED EDIT
    const [formData, setFormData] = useState({
        introduce: "",
        activityTime: "",
    });

    // onChange for form inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // onSubmit for form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`https://temp.gdgocinha.site/studyApply`, {
                formData
            });
            alert("신청이 완료되었습니다!");

            router.push(`/study/detail?title=${encodeURIComponent(studyTitle)}`);
        } catch (error) {
            console.error("Error submitting form");
            alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
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
                                    {studyTitle} 신청하기
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="flex justify-center items-center mt-10 bg-black text-white">
                        <div className="w-full max-w-2xl px-6">
                            {studyInfo && Object.keys(studyInfo).length > 0 ? (
                                <>
                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <label className="block text-lg font-semibold">
                                            자기소개 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="introduce"
                                            value={formData.introduce}
                                            onChange={handleChange}
                                            placeholder="자기 소개 및 활동 포부를 적어주세요."
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white h-40"
                                            required
                                        />

                                        <label className="block text-lg font-semibold">
                                            활동 가능한 시간대 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="activityTime"
                                            value={formData.activityTime}
                                            onChange={handleChange}
                                            placeholder="활동 가능한 시간대를 모두 적어주세요. (ex. 월 17-19시, 화 15시~)"
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                            required
                                        />

                                        {/* Submit */}
                                        <div className="flex justify-center pt-4">
                                            <Button
                                                type="submit"
                                                className="w-3/4 max-w-sm h-14 bg-red-500 text-white text-lg font-semibold rounded-lg"
                                            >
                                                제출하기
                                            </Button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="w-full max-w-[800px] border border-white rounded-lg p-8 relative overflow-hidden">
                                    <div className="text-white relative z-10">
                                        <h1 className="text-center text-xl">스터디 신청 정보를 불러올 수 없습니다.</h1>
                                        <p className="text-center">URL을 다시 확인해주세요.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}