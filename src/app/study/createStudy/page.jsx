'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Image, Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import Header from '../Header';

export default function DetailPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(false);
    const [studyContent, setStudyContent] = useState(null);
    const [isApplied, setIsApplied] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const getCurrentDT = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        title: "",
        introduce: "",
        recruitStartTime: getCurrentDT(),
        recruitEndTime: "",
        activityStartTime: "",
        activityEndTime: "",
        expectedPlace: "",
        expectedTime: "",
        activityIntroduce: "",
        thumbnail: null
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

    // NEED EDIT
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert("신청이 완료!");
        router.push(`/study/detail?title=${formData.title}`);
    };

    const handleClick = () => {
        //router.push(`/study/Detail?title=${}`);
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
                            신규 자율 스터디 개설하기
                        </h1>
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
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    한 줄 소개 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="introduce"
                                    value={formData.introduce}
                                    onChange={handleChange}
                                    placeholder="한 줄 소개글을 적어주세요."
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    모집 기간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="recruitStartTime"
                                    value={formData.recruitStartTime}
                                    onChange={handleChange}
                                    type="datetime-local"
                                    placeholder="모집 시작일"
                                    min={getCurrentDT()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />
                                <input
                                    name="recruitEndTime"
                                    value={formData.recruitEndTime}
                                    onChange={handleChange}
                                    type="datetime-local"
                                    placeholder="모집 종료일"
                                    min={getCurrentDT()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />

                                <label className="block text-lg font-semibold text-white">
                                    활동 기간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="activityStartTime"
                                    value={formData.activityStartTime}
                                    onChange={handleChange}
                                    type="datetime-local"
                                    placeholder="활동 시작일"
                                    min={getCurrentDT()}
                                    className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                    required
                                />
                                <input
                                    name="activityEndTime"
                                    value={formData.activityEndTime}
                                    onChange={handleChange}
                                    type="datetime-local"
                                    placeholder="활동 종료일"
                                    min={getCurrentDT()}
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
                                    type="file"
                                    name="thumbnail"
                                    accept="image/*"
                                    onChange={handleChange}
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
                                                className="object-cover"
                                                width="100%"
                                                height="100%"
                                            />
                                        </div>
                                        <Button
                                            className="mt-2 bg-gray-600 text-white"
                                            size="sm"
                                            onPress={() => {
                                                setImagePreview(null);
                                                setFormData({...formData, thumbnail: null});
                                                document.querySelector('input[name="thumbnail"]').value = '';
                                            }}
                                        >
                                            이미지 제거
                                        </Button>
                                    </div>
                                )}

                                {/* 제출 버튼 */}
                                <div className="flex justify-center mt-4">
                                    <Button
                                        type="submit"
                                        className="w-3/4 max-w-sm h-14 bg-red-500 text-white text-lg font-semibold rounded-lg"
                                    >
                                        제출하기
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};