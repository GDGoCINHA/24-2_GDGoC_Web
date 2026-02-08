import { useCallback } from 'react';

// components
import StudyCard from '@/components/study/ui/card/StudyCard';

export default function StudySection({ creatorType, studyList }) {
    // Filter study based on creatorType
    const filterStudy = creatorType
        ? studyList.filter((study) => study.creatorType === creatorType)
        : studyList;

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
                    {filteredStudies.length > 0 ? (
                        filteredStudies.map((study) => (
                            <div key={study.id}>
                                <StudyCard
                                    id={study.id}
                                    title={study.title}
                                    description={study.simpleIntroduce}
                                    status={study.status}
                                    reqEnd={study.recruitEndDate}
                                    icon={study.imagePath}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-red-200 text-sm">아직 존재하는 스터디가 없습니다ㅠㅠ</p>
                    )}
                </div>
            </>
        );
    }, [filterStudy]);

    return (
        <div className="relative flex justify-center items-center space-y-4 mobile:px-[24px]">
            {(creatorType === 'GDGOC' || creatorType === 'PERSONAL') && (
                <div className="w-full max-w-4xl">
                    {renderStudyCard("RECRUITING", '현재 모집 중인 스터디', '모집 마감일 확인하시고 원하시는 스터디에 지원하세요!')}
                    {renderStudyCard("RECRUITED", '지난 스터디 구경하기', '과거에 진행했던 스터디들을 구경해보세요!')}
                </div>
            )}
        </div>
    );
};