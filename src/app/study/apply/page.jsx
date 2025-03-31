'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import studyData from "../studyData";
import { Input, Button, Textarea, Spinner } from '@nextui-org/react';
import Header from '@/app/study/Header';

export default function ApplyPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [isLoading, setIsLoading] = useState(true);
    const [studyContent, setStudyContent] = useState([]);

    // API 호출
    // 없는 스터디 경우 예외 처리 필요
    useEffect(() => {
        const fetchStudyData = async () => {
            try {
                const response = await axios.get(`https://temp.gdgocinha.site/studyData`);
                setStudyContent(response.data.studies);
            } catch (error) {
                // console.error('Error fetching study data', error);
                const data = studyData.studies.filter(study => study.title === studyTitle);
                setStudyContent(data);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyData();
    }, [studyTitle]);

    const [formData, setFormData] = useState({
        intro: "",
        avaTime: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert("신청이 완료!");
        router.push('/study');
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
                            {studyTitle} 스터디 신청하기
                        </h1>
                    </header>

                    <div className="flex justify-center items-center mt-10 bg-black text-white">
                        <div className="w-full max-w-2xl px-6">
                            {studyContent.length > 0 ? (
                                <>
                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <label className="block text-lg font-semibold">
                                            자기소개 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="intro"
                                            value={formData.intro}
                                            onChange={handleChange}
                                            placeholder="자기 소개 및 활동 포부를 적어주세요."
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white h-40"
                                            required
                                        />

                                        <label className="block text-lg font-semibold">
                                            활동 가능한 시간대 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="avaTime"
                                            value={formData.avaTime}
                                            onChange={handleChange}
                                            placeholder="활동 가능한 시간대를 모두 적어주세요. (ex. 월 17-19시, 화 15시~)"
                                            className="w-full bg-[#1f1f1f] border-none rounded-lg p-4 text-white"
                                            required
                                        />

                                        {/* 제출 버튼 */}
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
                                <h1 className="text-center text-xl">스터디 신청 정보를 불러올 수 없습니다.</h1>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}