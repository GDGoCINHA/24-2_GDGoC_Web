'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@nextui-org/react';
import Image from 'next/image';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useStudyApplyPreCheck } from "@/hooks/study/useStudyApplyPreCheck";

import Header from '../components/common/Header';
import SubmitButton from "../components/ui/SubmitButton";
import MarginBottom from "../components/common/MarginBottom";

import gdgocIcon from '@public/src/images/GDGoC_icon.png';

export default function Apply() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');

    // API: useStudyApplyPreCheck
    const { studyInfo, isLoading, error } = useStudyApplyPreCheck();

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
            await apiClient.post(`/studyApply`, {
                formData
            });
            alert("신청이 완료되었습니다!");

            router.push(`/study/detail?title=${encodeURIComponent(studyTitle)}`);
        } catch (error) {
            console.error("error submitting form");
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
                                    {studyTitle} 신청하기
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="flex justify-center items-center mt-10 bg-black text-white">
                        <div className="w-full max-w-2xl px-6">
                            {studyInfo ? (
                                <>
                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <label className="block">
                                            <p className="text-lg font-semibold">자기소개 <span className="text-red-500">*</span></p>
                                            <p className="text-sm">자기 소개 및 활동 포부를 적어주세요.</p>
                                        </label>
                                        <textarea
                                            name="introduce"
                                            value={formData.introduce}
                                            onChange={handleChange}
                                            placeholder="스터디에 참여하고 싶습니다."
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white h-40"
                                            required
                                        />

                                        <label className="block">
                                            <p className="text-lg font-semibold">활동 가능한 시간대 <span className="text-red-500">*</span></p>
                                            <p className="text-sm">활동 가능한 시간대를 모두 적어주세요.</p>
                                        </label>
                                        <input
                                            name="activityTime"
                                            value={formData.activityTime}
                                            onChange={handleChange}
                                            placeholder="Ex) 월 17-19시, 화 15시-"
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                            required
                                        />

                                        {/* Submit */}
                                        <SubmitButton text="제출하기" isDisabled={false} type={"submit"} handleClick={() => {}} />

                                        {/* Margin Bottom to prevent Bottom touch */}
                                        <MarginBottom />
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