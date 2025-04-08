import React, { useEffect, useState, useCallback } from 'react';

import StudyCard from './StudyCard';

export default function StudySection({ creatorType, studyInfo }) {
    // Filter study based on creatorType
    const filterStudy = creatorType
        ? studyInfo.filter((study) => study.creatorType === creatorType)
        : studyInfo;

    // Render study cards
    const renderStudyCard = useCallback((status, title, intro) => {
        const filteredStudies = filterStudy.filter(study => study.status === status);
        return (
            <>
                <div className="m-auto mt-5">
                    <h2 className="text-white text-lg font-bold text-left">{title}</h2>
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
    }, [filterStudy]);


    return (
        <div className="relative flex justify-center items-center space-y-4 mobile:px-[24px]">
            {(creatorType === 'GDGOC' || creatorType === 'PERSONAL') && (
                <div className="w-full max-w-4xl">
                    {renderStudyCard("RECRUITING", '현재 모집 중인 스터디', '마감일 확인하시고 원하시는 스터디에 지원하세요!')}
                    {renderStudyCard("RECRUITED", '지난 스터디 구경하기', 'GDGoC에서 진행했던 스터디들을 구경해보세요!')}
                </div>
            )}
        </div>
    );
};