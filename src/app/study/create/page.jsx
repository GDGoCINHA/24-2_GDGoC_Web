'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Spinner } from "@nextui-org/react";
import Image from 'next/image';

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

// components
import StudyHeader from '@/components/study/StudyHeader';
import SubmitButton from '@/components/ui/button/SubmitButton';

export default function CreateStudy() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();

    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const getCurrentDate = () => {
        const now = new Date();
        return now.toISOString().slice(0, 10);
    };

    const addTime = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toISOString();
    };

    // DataFormat
    const [formData, setFormData] = useState({
        title: "",
        simpleIntroduce: "",
        activityIntroduce: "",
        creatorType: "PERSONAL",
        recruitStartDate: getCurrentDate(),
        recruitEndDate: "",
        activityStartDate: "",
        activityEndDate: "",
        expectedTime: "",
        expectedPlace: "",
        image: null
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file' && files[0]) {
            setFormData({ ...formData, [name]: files[0] });

            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // onSubmit for form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // add time 00:00:00
        const updateFormData = {
            ...formData,
            recruitStartDate: addTime(formData.recruitStartDate),
            recruitEndDate: addTime(formData.recruitEndDate),
            activityStartDate: addTime(formData.activityStartDate),
            activityEndDate: addTime(formData.activityEndDate),
        };

        try {
            const multipartForm = new FormData();
            multipartForm.append("title", updateFormData.title);
            multipartForm.append("simpleIntroduce", updateFormData.simpleIntroduce);
            multipartForm.append("activityIntroduce", updateFormData.activityIntroduce);
            multipartForm.append("creatorType", updateFormData.creatorType);
            multipartForm.append("recruitStartDate", updateFormData.recruitStartDate);
            multipartForm.append("recruitEndDate", updateFormData.recruitEndDate);
            multipartForm.append("activityStartDate", updateFormData.activityStartDate);
            multipartForm.append("activityEndDate", updateFormData.activityEndDate);
            multipartForm.append("expectedTime", updateFormData.expectedTime);
            multipartForm.append("expectedPlace", updateFormData.expectedPlace);
            multipartForm.append("image", updateFormData.image);

            await apiClient.post('/studies', multipartForm);

            alert("스터디 개설이 완료되었습니다!");
            router.push(`/study/admin`);
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
                    <StudyHeader />
                    <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] items-center justify-center text-center">
                        <div className="flex flex-col mobile:flex-col items-center gap-2 mt-4 mobile:mt-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-white text-2xl text-center mobile:text-lg">
                                    신규 자율 스터디 개설하기
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="relative flex flex-col items-center justify-center w-full px-[96px] mobile:px-[24px] py-8">
                        <div className="w-full max-w-[800px] border border-white rounded-lg p-8 relative overflow-hidden">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <label className="block text-lg font-semibold text-white">
                                    스터디 명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="스터디 명을 적어주세요."
                                    maxLength="50" // need adjust
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    한 줄 소개 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="simpleIntroduce"
                                    value={formData.simpleIntroduce}
                                    onChange={handleChange}
                                    placeholder="한 줄 소개글을 적어주세요."
                                    maxLength="150"
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    모집 기간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="recruitStartDate"
                                    value={formData.recruitStartDate}
                                    onChange={handleChange}
                                    type="date"
                                    placeholder="모집 시작일"
                                    min={getCurrentDate()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />
                                <input
                                    name="recruitEndDate"
                                    value={formData.recruitEndDate}
                                    onChange={handleChange}
                                    type="date"
                                    placeholder="모집 종료일"
                                    min={getCurrentDate()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    활동 기간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="activityStartDate"
                                    value={formData.activityStartDate}
                                    onChange={handleChange}
                                    type="date"
                                    placeholder="활동 시작일"
                                    min={getCurrentDate()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />
                                <input
                                    name="activityEndDate"
                                    value={formData.activityEndDate}
                                    onChange={handleChange}
                                    type="date"
                                    placeholder="활동 종료일"
                                    min={getCurrentDate()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    정기 모임 예상 장소 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="expectedPlace"
                                    value={formData.expectedPlace}
                                    onChange={handleChange}
                                    placeholder="활동 예정 장소를 적어주세요. (ex. 동방, Google Meet 등)"
                                    type="text"
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />
                                <label className="block text-lg font-semibold text-white">
                                    정기 모임 예상 시간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="expectedTime"
                                    value={formData.expectedTime}
                                    onChange={handleChange}
                                    placeholder="활동 예정 시간대를 모두 적어주세요. (ex. 월 17-19시, 화 15시~)"
                                    type="text"
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    활동 소개 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="activityIntroduce"
                                    value={formData.activityIntroduce}
                                    onChange={handleChange}
                                    placeholder="스터디 활동 내역을 적어주세요."
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white h-40"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    썸네일 로고 업로드 (1대1 사이즈)<span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="image"
                                    onChange={handleChange}
                                    accept="image/*"
                                    type="file"
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="mt-4">
                                        <p className="text-white mb-2">이미지 미리보기:</p>
                                        <div className="w-40 h-40 relative border border-gray-300 rounded-lg overflow-hidden">
                                            <Image
                                                src={imagePreview}
                                                alt="Thumbnail preview"
                                                width="160"
                                                height="160"
                                                className="object-cover"
                                            />
                                        </div>
                                        <Button
                                            className="mt-2 bg-gray-600 text-white"
                                            size="sm"
                                            onPress={() => {
                                                setImagePreview(null);
                                                setFormData({...formData, image: null});
                                                document.querySelector('input[name="image"]').value = '';
                                            }}
                                        >
                                            이미지 제거
                                        </Button>
                                    </div>
                                )}

                                {/* 제출 버튼 */}
                                <SubmitButton type="submit" text="제출하기" isDisabled={ false } handleClick={() => {}} />
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};