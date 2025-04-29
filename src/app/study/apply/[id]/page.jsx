'use client';

import React, {useEffect, useState} from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spinner } from '@nextui-org/react';
import Image from 'next/image';

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useStudyDetail } from "@/hooks/study/useStudyDetail";

// components
import Header from '@/components/study/StudyHeader';
import SubmitButton from "@/components/ui/button/SubmitButton";
import MarginBottom from "@/components/MarginBottom";

// images
import gdgocIcon from '@public/src/images/GDGoC_icon.png';

export default function Apply() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const pathParams = useParams();
    const studyId =  decodeURIComponent(pathParams.id);

    // API: useStudyDetail
    const { studyDetail, isRecruiting, isApplied, isLoading, error } = useStudyDetail(studyId);

    useEffect(() => {
        if (studyDetail) {
            // Check if the study is recruiting
            if (isRecruiting === false) {
                alert("해당 스터디는 모집 중이 아닙니다.");
                router.push(`/study/detail/${encodeURIComponent(studyId)}`);
                return;
            }

            // Check if the user is already applied
            if (isApplied) {
                alert("이미 신청한 스터디입니다.");
                router.push(`/study/my`);
                return;
            }
        }
    }, [studyDetail, isRecruiting, isApplied, router, studyId]);

    // FormData
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
            await apiClient.post(`/study/${studyId}/applications`, formData);
            alert("신청이 완료되었습니다!");

            router.push(`/study/my`);
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
                    {/* StudyHeader */}
                    <Header />
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
                                    {studyDetail?.title ? studyDetail.title + " 신청하기" : "신청 정보가 없습니다."}
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="flex justify-center items-center mt-10 bg-black text-white">
                        <div className="w-full max-w-2xl px-6">
                            {studyDetail ? (
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
                                            onChange={ handleChange }
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
                                            onChange={ handleChange }
                                            placeholder="Ex) 월 17-19시, 화 15시-"
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                            required
                                        />

                                        {/* Submit */}
                                        <SubmitButton type="submit" text="제출하기" isDisabled={ false } handleClick={() => {}} />

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