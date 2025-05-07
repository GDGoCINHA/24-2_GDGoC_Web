import { useEffect, useState } from 'react';

import { getCreatedStudiesByStatus, getMyStudyApplyResult} from "@/mock/studyMock";

export const useStudyAccessCheck = (apiClient, studyId) => {
    const [isStudyApplicant, setIsStudyApplicant] = useState(false);
    const [isStudyLead, setIsStudyLead] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPermissionData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setIsStudyApplicant(getMyStudyApplyResult.data.recruiting.some(applicant => applicant.studyId === Number(studyId)) || getMyStudyApplyResult.data.recruited.some(applicant => applicant.studyId === Number(studyId)));
                    setIsStudyLead(getCreatedStudiesByStatus.data.recruiting.some(study => study.id === Number(studyId)) || getCreatedStudiesByStatus.data.recruited.some(study => study.id === Number(studyId)));
                } else {
                    const resAppliedStudy = await apiClient.get(`/study/attendee/result`);
                    // 얘는 recruited가 없는데? 버근가? -> 아무것도 지원 안한 상태긴함 ㅇㅇ
                    setIsStudyApplicant(resAppliedStudy?.data?.data?.recruiting?.some(study => study?.studyId === Number(studyId)) || resAppliedStudy?.data?.data?.recruited?.some(study => study?.studyId === Number(studyId)));
                    const resCreatedStudy = await apiClient.get('/study/me');
                    setIsStudyLead(resCreatedStudy?.data?.data?.recruiting?.some(study => study?.id === Number(studyId)) || resCreatedStudy?.data?.data?.recruited?.some(study => study?.id === Number(studyId)));
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPermissionData();
    }, [studyId]);

    // 이 스터디가 네놈의 것이 맞느냐?
    // 홀홀 그대는 정직한 유저구나 true를 반환하여주겠다
    return { isStudyApplicant, isStudyLead, isLoading, error };
};