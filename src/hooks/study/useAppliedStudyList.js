import { useEffect, useState } from 'react';

import { getMyStudyApplyResult } from "@/mock/studyMock";

export const useAppliedStudyList = (apiClient) => {
    const [recruitingAppliedStudyList, setRecruitingAppliedStudyList] = useState([]);
    const [recruitedAppliedStudyList, setRecruitedAppliedStudyList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppliedStudyListData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setRecruitingAppliedStudyList(getMyStudyApplyResult.data.recruiting);
                    setRecruitedAppliedStudyList(getMyStudyApplyResult.data.recruited);
                } else {
                    const resCreatedStudy = await apiClient.get('/study/attendee/result');
                    setRecruitingAppliedStudyList(resCreatedStudy.data.recruiting);
                    setRecruitedAppliedStudyList(resCreatedStudy.data.recruited);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppliedStudyListData();
    }, []);

    return { recruitingAppliedStudyList, recruitedAppliedStudyList, isLoading, error };
};