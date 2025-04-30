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
                    setIsStudyApplicant(getMyStudyApplyResult.data.attendees.some(applicant => applicant.id === Number(studyId) && applicant.status === "RECRUITED"));
                    setIsStudyLead(getCreatedStudiesByStatus.data.recruiting.some(study => study.id === Number(studyId)) || getCreatedStudiesByStatus.data.recruited.some(study => study.id === Number(studyId)));
                } else {
                    const resAppliedStudy = await apiClient.get(`/studies/applicated`);
                    setIsStudyApplicant(resAppliedStudy.data.recruiting.some(study => study.studyId === Number(studyId)) || resAppliedStudy.data.recruited.some(study => study.studyId === Number(studyId)));
                    const resCreatedStudy = await apiClient.get('/studies/created');
                    setIsStudyLead(resCreatedStudy.data.recruiting.some(study => study.id === Number(studyId)) || resCreatedStudy.data.recruited.some(study => study.id === Number(studyId)));
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPermissionData();
        // 여기 apiClient 포함하면 infinite loop 발생 왜지?
        // 왜 여기만 난리지????????? 로직이 이상한건가?
    }, [studyId]);

    // 이 스터디가 네놈의 것이 맞느냐?
    // 홀홀 그대는 정직한 유저구나 true를 반환하여주겠다
    return { isStudyApplicant, isStudyLead, isLoading, error };
};