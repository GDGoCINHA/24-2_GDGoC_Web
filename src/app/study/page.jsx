'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';

import { useStudyList } from '@/hooks/study/useStudyList';

import StudyHeader from '@/components/study/StudyHeader';
import CreatorTypeSelector from '@/components/study/CreatorTypeSelector';
import StudySection from '@/components/study/StudySection';
import RoundImageButton from '@/components/ui/button/RoundImageButton';
import MarginBottom from '@/components/MarginBottom';
import SubmitButton from "@/components/ui/button/SubmitButton";

import gdgocIcon from '@public/src/images/GDGoC_icon.png';

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
                            GDGoC Inha에서는 높은 수준의 멤버들과
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
                    <RoundImageButton imageLink={gdgocIcon} color={"danger"} isDisabled={false} type={"submit"} handleClick={() => router.push(`/study/create`)} />

                    {/* Margin Bottom to prevent Bottom touch */}
                    <MarginBottom />
                </>
            )}
        </>
    );
}