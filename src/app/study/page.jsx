'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Spinner,
    Button
} from '@nextui-org/react';
import axios from 'axios';
import Header from './Header';
import StudyCard from './StudyCard';
import { studyList } from './mock/StudyData';

export default function Study() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [studyInfo, setStudyInfo] = useState([]);
    const [estType, setEstType] = useState('PERSONAL');

    // API 호출
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://temp.gdgocinha.site/studyData?page=1');
                setStudyInfo(response.data.studyList);
                setIsLoading(false);
            } catch (error) {
                //console.error('Error fetching study data');
                setStudyInfo(studyList.data.studyList); // remove when deploy
                setIsLoading(false); // remove when deploy
            }
        };

        fetchData();
    }, []);

    // GDGOC or PERSONAL
    const handleEstChange = (type) => {
        setEstType(type);
    };

    // Filter study based on estType
    const filterStudy = estType
        ? studyInfo.filter((study) => study.type === estType)
        : studyInfo;

    const formatDate = (dateString) => {
        if (!dateString) return "정보 없음";
        const date = new Date(dateString);
        const year = String(date.getFullYear());
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    const renderStudySection = (status, title, intro) => {
        return (
            <>
                <div className="m-auto mt-5">
                    <h2 className="text-white text-[18px] font-bold text-left">{title}</h2>
                    <p className="text-white text-sm text-left">{intro}</p>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filterStudy.map((study, index) => {
                        if (study.status === status) {
                            return (
                                <div key={index}>
                                    {/* Check study API doc before deploy*/}
                                    <StudyCard
                                        key={study.id}
                                        title={study.title}
                                        description={study.simpleIntroduce}
                                        status={study.status}
                                        reqEnd={study.recruitEndDate ? formatDate(study.recruitEndDate) : '정보 없음'}
                                        icon={study.imagePath}
                                    />
                                </div>
                            );
                        }
                        return null;
                    })}
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

                    {/* Est Type Selection */}
                    <div className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:mt-14">
                        <p className="text-white text-right pt-[3px]">
                            <span
                                className={`cursor-pointer ${estType === 'GDGOC' ? 'font-bold' : ''}`}
                                onClick={() => handleEstChange('GDGOC')}
                            >
                                정규
                            </span>
                            {" | "}
                            <span
                                className={`cursor-pointer ${estType === 'PERSONAL' ? 'font-bold' : ''}`}
                                onClick={() => handleEstChange('PERSONAL')}
                            >
                                개인개설
                            </span>
                        </p>
                    </div>

                    <div className="relative flex justify-center items-center space-y-4 mobile:px-[24px]">
                        {/* 정규 카테고리 */}
                        {estType === 'GDGOC' && (
                            <div className="w-full max-w-4xl">
                                {renderStudySection("RECRUITING", '현재 모집 중인 스터디', '마감일 확인하시고 원하시는 스터디에 지원하세요!')}
                                {renderStudySection("RECRUITED", '지난 스터디 구경하기', 'GDGoC에서 진행했던 스터디들을 구경해보세요!')}
                            </div>
                        )}

                        {/* 개인개설 카테고리 */}
                        {estType === 'PERSONAL' && (
                            <div className="w-full max-w-4xl">
                                {renderStudySection("RECRUITING", '현재 모집 중인 스터디', '마감일 확인하시고 원하시는 스터디에 지원하세요!')}
                                {renderStudySection("RECRUITED", '지난 스터디 구경하기', 'GDGoC에서 진행했던 스터디들을 구경해보세요!')}
                            </div>
                        )}
                    </div>

                    {/* Create New Study */}
                    <div className="fixed bottom-6 right-6">
                        <Button
                            color="danger"
                            onPress={() => router.push(`/study/createStudy`)}
                            className="rounded-full p-0 shadow-lg flex items-center justify-center w-14 h-14"
                            isIconOnly
                        >
                            <Image
                                alt="icon"
                                src="/src/images/google_icon.png"
                                className="w-8 h-8 object-contain"
                            />
                        </Button>
                    </div>
                </>
            )}
        </>
    );
}