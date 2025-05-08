'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@nextui-org/react";
import Image from 'next/image';

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

// components
import StudyHeader from '@/components/study/StudyHeader';
import SubmitButton from '@/components/ui/button/SubmitButton';

export default function CreateStudy() {
    const { apiClient } = useAuthenticatedApi();
    const router = useRouter();

    const [imagePreview, setImagePreview] = useState(null);

    // current date
    const getCurrentDate = () => {
        const now = new Date();
        return now.toISOString().slice(0, 10);
    };

    // add time 00:00:00
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

    // onChange for form
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file' && files[0]) {
            setFormData({ ...formData, [name]: files[0] });

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // onSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const imageFile = formData.image;
            const s3key = `study`;

            const s3Form = new FormData();
            s3Form.append('file', imageFile);
            s3Form.append('s3key', s3key);

            const resS3 = await apiClient.post('/resource/image', s3Form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const getS3Key = resS3?.data?.s3key;
            if (!getS3Key) throw new Error('S3 이미지 업로드 실패');

            const updateFormData = {
                ...formData,
                recruitStartDate: addTime(formData.recruitStartDate),
                recruitEndDate: addTime(formData.recruitEndDate),
                activityStartDate: addTime(formData.activityStartDate),
                activityEndDate: addTime(formData.activityEndDate),
                imagePath: getS3Key
            };

            await apiClient.post('/study', updateFormData);

            alert("스터디 개설이 완료되었습니다!");
            router.push(`/study/admin`);
        } catch (error) {
            console.error("Error during submission");
            alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <>
            {/* StudyHeader */}
            <StudyHeader />
            <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] items-center justify-center text-center">
                <div className="flex flex-col mobile:flex-col items-center gap-2 mt-4 mobile:mt-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-white text-3xl text-center mobile:text-xl">
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
                            placeholder="스터디 명을 적어주세요. (14자)"
                            maxLength="14"
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
                            maxLength="55"
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
                            maxLength="90"
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
                            maxLength="90"
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
                            /*maxLength="500"*/
                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white h-40"
                            required
                        />

                        <label className="block text-lg font-semibold text-white">
                            썸네일 로고 업로드 <span className="text-red-500">*</span>
                        </label>
                        {/* 나중에는 이미지 에디터 기능까지..!!!!!!! */}
                        {!imagePreview ? (
                            <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-300 transition-colors">
                                <input
                                    name="image"
                                    id="imageUpload"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.size > 10 * 1024 * 1024) {
                                            alert("이미지 파일 크기는 10MB 이하로 제한됩니다.");
                                            e.target.value = '';
                                            return;
                                        }
                                        handleChange(e);
                                    }}
                                    accept="image/*"
                                    type="file"
                                    className="hidden"
                                    required
                                />
                                <label htmlFor="imageUpload" className="flex flex-col items-center justify-center cursor-pointer">
                                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span className="text-gray-300">클릭하여 이미지 업로드</span>
                                    <span className="text-xs text-gray-500 mt-1">1:1 사이즈 권장 (10MB 이하)</span>
                                </label>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <div className="w-40 h-40 relative border border-gray-300 rounded-lg overflow-hidden group">
                                    <Image
                                        src={imagePreview}
                                        alt="Thumbnail preview"
                                        width="160"
                                        height="160"
                                        className="object-cover"
                                    />

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                                        {/* Remove Image */}
                                        <Button
                                            className="bg-red-500 hover:bg-red-600 text-white mb-2"
                                            size="sm"
                                            onPress={() => {
                                                setImagePreview(null);
                                                setFormData({ ...formData, image: null });
                                                const inputFile = document.querySelector('input[name="image"]');
                                                if (inputFile) inputFile.value = '';
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            제거
                                        </Button>

                                        {/* Change Image */}
                                        <input
                                            name="imageChange"
                                            id="imageChange"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file && file.size > 10 * 1024 * 1024) {
                                                    alert("이미지 파일 크기는 10MB 이하로 제한됩니다.");
                                                    e.target.value = '';
                                                    return;
                                                }
                                                handleChange(e);
                                            }}
                                            accept="image/*"
                                            type="file"
                                            className="hidden"
                                        />
                                        <Button
                                            className="bg-blue-500 hover:bg-blue-600 text-white mb-2"
                                            size="sm"
                                            onPress={() => {
                                                document.getElementById('imageChange').click();
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            변경
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create New Study */}
                        <SubmitButton type="submit" text="생성하기" isDisabled={ false } handleClick={() => {}} />
                    </form>
                </div>
            </div>
        </>
    );
};