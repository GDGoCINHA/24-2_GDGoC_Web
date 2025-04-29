'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';

import { useStudyList } from '@/hooks/study/useStudyList';

import StudyHeader from '@/components/study/StudyHeader';
import CreatorTypeSelector from '@/components/study/CreatorTypeSelector';
import StudySection from '@/components/study/StudySection';
import CreateStudyButton from '@/components/ui/button/CreateStudyButton';
import MarginBottom from '@/components/MarginBottom';

export default function Study() {
    const router = useRouter();
    const [creatorType, setCreatorType] = useState('PERSONAL');

    // API: useStudyList
    const { studyInfo, isLoading, error: studyError } = useStudyList();

    // GDGOC or PERSONAL
    const handleCreatorTypeChange = (type) => {
        if (type !== creatorType) {
            setCreatorType(type);
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
                    <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:justify-self-center">
                        <h1 className="text-white text-xl text-left mobile:text-center mobile:text-lg">
                            GDSC Inha에서는 높은 수준의 멤버들과
                        </h1>
                        <h1 className="text-white text-xl text-left mobile:text-center mobile:text-lg">
                            다양한 스터디를 진행하고 있습니다.
                        </h1>
                    </header>

                    {/* creatorType Selection */}
                    <CreatorTypeSelector
                        creatorType={creatorType}
                        onChange={handleCreatorTypeChange}
                    />

                    {/* Study List by creatorType*/}
                    <StudySection creatorType={creatorType} studyInfo={studyInfo} />

                    {/* Create New PERSONAL Study */}
                    <CreateStudyButton />

                    {/* Margin Bottom to prevent Bottom touch */}
                    <MarginBottom />
                </>
            )}
        </>
    );
}