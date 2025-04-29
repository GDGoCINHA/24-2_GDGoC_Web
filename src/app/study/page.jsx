'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';

// Hooks
import { useStudyList } from '@/hooks/study/useStudyList';

// Components
import StudyHeader from '@/components/study/StudyHeader';
import StudyTypeNav from '@/components/study/ui/nav/StudyTypeNav';
import StudySection from '@/components/study/StudySection';
import RoundImageButton from '@/components/ui/button/RoundImageButton';
import MarginBottom from '@/components/MarginBottom';

// Images
import writeIcon from '@public/ui/pencil.png';

export default function Study() {
    const router = useRouter();
    const [creatorType, setCreatorType] = useState('PERSONAL');

    /**
     * @warning 현재 studyListGDGOC는 비활성화 되어 있습니다. 필요시 useStudyList에서 활성화 해주세요.
     * @warning 또한, 현제 StudyTypeNav는 "PERSONAL" 선택지만 지원합니다. 필요시 StudyTypeNav에서 활성화 해주세요.
     */

    // API: useStudyList
    const { studyListGDGOC, studyListPERSONAL, isLoading, error } = useStudyList();

    // Set the studyList based on creatorType
    const studyList = creatorType === 'GDGOC' ? (studyListGDGOC || []) : (studyListPERSONAL || []);

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

                    {/* Study Type Nav */}
                    <StudyTypeNav
                        creatorType={creatorType}
                        onChange={handleCreatorTypeChange}
                    />

                    {/* StudyList by creatorType*/}
                    <StudySection creatorType={creatorType} studyList={studyList} />

                    {/* Create New PERSONAL Study */}
                    <RoundImageButton imageLink={writeIcon} color={"danger"} isDisabled={false} type={"submit"} handleClick={() => router.push(`/study/create`)} />

                    {/* Margin Bottom to prevent Bottom touch */}
                    <MarginBottom />
                </>
            )}
        </>
    );
}