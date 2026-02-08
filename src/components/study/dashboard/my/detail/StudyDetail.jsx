'use client';

import { Spinner } from "@nextui-org/react";

// hooks
import {useAuthenticatedApi} from "@/hooks/useAuthenticatedApi";

// API Services
import { useStudyDetail } from "@/services/study/useStudyDetail";
import {useAppliedStudyList} from "@/services/study/useAppliedStudyList";

export default function StudyDetail({ studyId }) {
    const { apiClient } = useAuthenticatedApi();

    // API: useAppliedStudyList
    const { recruitingAppliedStudyList, recruitedAppliedStudyList, isLoading: isAppliedLoading, error: appliedError } = useAppliedStudyList(apiClient, studyId);

    // API: useStudyDetail
    const { studyDetail, studyLead, isRecruiting, isApplied, isLoading: isDetailLoading, error: detailError } = useStudyDetail(apiClient, studyId);

    const isLoading = isAppliedLoading || isDetailLoading;
    const error = appliedError || detailError;

    return (<>
        {isLoading ? (
            <div className='flex justify-center items-center h-screen'>
                <Spinner />
            </div>
        ) : (
            <div className="mb-10">
                {(studyDetail &&
                    (recruitingAppliedStudyList?.some(study => study.studyId === Number(studyId)) ||
                     recruitedAppliedStudyList?.some(study => study.studyId === Number(studyId)))) ? (
                         <>
                            <h2 className="text-xl md:text-2xl font-bold mb-6">{studyDetail.title}</h2>
                            <p>현재 기능 준비 중인 페이지입니다.</p>
                        </>
                ) : (
                    <div className="text-xl md:text-2xl font-bold mb-6 text-red-500 font-semibold">
                        접근 권한이 없는 스터디입니다.
                    </div>
                )}
            </div>
        )}
    </>);
}