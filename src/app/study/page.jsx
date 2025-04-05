'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Spinner,
    Button
} from '@nextui-org/react';
import Image from 'next/image';
import axios from 'axios';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import Header from './Header';
import StudyCard from './StudyCard';
import writeIcon from '@public/src/images/GDGoC_icon.png';
import studyList from './mock/studyData';

export default function Study() {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const [isLoading, setIsLoading] = useState(true);
    const [studyInfo, setStudyInfo] = useState([]);
    const [creatorType, setCreatorType] = useState('PERSONAL');

    // Call API
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setStudyInfo(studyList.data.studyList);
                    setIsLoading(false);
                } else {
                    const response = await apiClient.get('/studyData');
                    setStudyInfo(response.data.studyList);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching study data');
            }
        };

        fetchData();
    }, []);

    // GDGOC or PERSONAL
    const handleCreatorTypeChange = (creatorType) => {
        setCreatorType(creatorType);
    };

    // Filter study based on creatorType
    const filterStudy = creatorType
        ? studyInfo.filter((study) => study.creatorType === creatorType)
        : studyInfo;

    // Render study cards
    const renderStudyCard = (status, title, intro) => {
        const filteredStudies = filterStudy.filter(study => study.status === status);
        return (
            <>
                <div className="m-auto mt-5">
                    <h2 className="text-white text-[18px] font-bold text-left">{title}</h2>
                    <p className="text-white text-sm text-left">{intro}</p>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredStudies.map((study) => (
                        <div key={study.id}>
                            <StudyCard
                                title={study.title}
                                description={study.simpleIntroduce}
                                status={study.status}
                                reqEnd={study.recruitEndDate}
                                icon={study.imagePath}
                            />
                        </div>
                    ))}
                </div>
            </>
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
                    {/* Header */}
                    <Header />
                    <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:justify-self-center">
                        <h1 className="text-white text-xl text-left mobile:text-center">
                            GDSC Inha에서는 높은 수준의 멤버들과
                        </h1>
                        <h1 className="text-white text-xl text-left mobile:text-center">
                            다양한 스터디를 진행하고 있습니다.
                        </h1>
                    </header>

                    {/* creatorType Selection */}
                    <div className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:mt-14">
                        <p className="text-white text-right pt-[3px]">
                            <span
                                className={`cursor-pointer ${creatorType === 'GDGOC' ? 'font-bold' : ''}`}
                                onClick={() => handleCreatorTypeChange('GDGOC')}
                            >
                                정규
                            </span>
                            {" | "}
                            <span
                                className={`cursor-pointer ${creatorType === 'PERSONAL' ? 'font-bold' : ''}`}
                                onClick={() => handleCreatorTypeChange('PERSONAL')}
                            >
                                개인개설
                            </span>
                        </p>
                    </div>

                    <div className="relative flex justify-center items-center space-y-4 mobile:px-[24px]">
                        {/* GDGOC */}
                        {creatorType === 'GDGOC' && (
                            <div className="w-full max-w-4xl">
                                {renderStudyCard("RECRUITING", '현재 모집 중인 스터디', '마감일 확인하시고 원하시는 스터디에 지원하세요!')}
                                {renderStudyCard("RECRUITED", '지난 스터디 구경하기', 'GDGoC에서 진행했던 스터디들을 구경해보세요!')}
                            </div>
                        )}

                        {/* PERSONAL */}
                        {creatorType === 'PERSONAL' && (
                            <div className="w-full max-w-4xl">
                                {renderStudyCard("RECRUITING", '현재 모집 중인 스터디', '마감일 확인하시고 원하시는 스터디에 지원하세요!')}
                                {renderStudyCard("RECRUITED", '지난 스터디 구경하기', 'GDGoC에서 진행했던 스터디들을 구경해보세요!')}
                            </div>
                        )}
                    </div>

                    {/* Create New PERSONAL Study */}
                    <div className="fixed bottom-6 right-6">
                        <Button
                            color="danger"
                            onPress={() => router.push(`/study/createStudy`)}
                            className="rounded-full p-0 shadow-lg flex items-center justify-center w-14 h-14"
                            isIconOnly
                        >
                            <Image
                                alt="icon"
                                src={writeIcon}
                                width="14"
                                height="14"
                                className="w-8 h-8 object-contain"
                            />
                        </Button>
                    </div>
                </>
            )}
        </>
    );
}