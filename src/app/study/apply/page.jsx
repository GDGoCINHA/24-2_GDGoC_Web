'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Header from '../Header';
import React, { useEffect, useState } from "react";
import axios from "axios";
import studyData from "../studyData";
import { Form, Button, Input, Spinner } from "@nextui-org/react";

export default function ApplyPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title') || '';
    const [isLoading, setIsLoading] = useState(true);
    const [studyContent, setStudyContent] = useState([]);

    // API 호출
    useEffect(() => {
        if (!studyTitle) return;

        const fetchStudyData = async () => {
            try {
                const response = await axios.get(`https://gdgocinha.site/studyData`);
                setStudyContent(response.data.studies || []);
            } catch (error) {
                // console.error('Error fetching study data', error);
                const data = studyData.studies.filter(study => study.title === studyTitle) || [];
                setStudyContent(data);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyData();
    }, [studyTitle]);

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
                        <h1 className="text-white text-xl text-left mobile:text-center">
                            {studyTitle} 스터디 신청하기
                        </h1>
                        <p className="text-white text-sm mt-2 text-left mobile:text-center">
                            지원 결과는 마감일에 MY 스터디 | 참여 페이지에서 확인하실 수 있습니다.
                        </p>
                    </header>

                    <Form action="/study" method="post" className="flex flex-col w-3/4 m-auto mt-20 justify-items-center ">
                        <label className="text-white text-left text-xl mb-4">자기소개 <span className="text-red-500">*</span></label>
                        <Input className="bg-[#1f1f1f] h-20" placeholder="자기 소개 및 활동 포부를 적어주세요." isRequired/>

                        <label className="text-white text-left text-xl mt-10 mb-4">활동 가능한 시간대 <span className="text-red-500">*</span></label>
                        <Input className="bg-[#1f1f1f] h-20" placeholder="활동 가능한 시간대를 모두 적어주세요. (ex. 월 17-19시, 화 15시~)" isRequired/>

                        <div className="flex justify-center">
                            <Button type='submit' radius="full" className="mt-[40px] w-80 h-14 mobile:w-40 mobile:h-14 mobile:text-xl bg-gradient-to-r from-[#EA4335] to-[#FF6E62] text-white text-xl relative">
                                <span className="font-semibold">제출하기</span>
                            </Button>
                        </div>
                    </Form>
                </>
            )}
        </>
    );
}