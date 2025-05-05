import { useEffect, useState } from 'react';

import { getCreatedStudiesByStatus } from "@/mock/studyMock";

export const useCreatedStudyList = (apiClient) => {
    const [recruitingCreatedStudyList, setRecruitingCreatedStudyList] = useState([]);
    const [recruitedCreatedStudyList, setRecruitedCreatedStudyList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCreatedStudyListData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setRecruitingCreatedStudyList(getCreatedStudiesByStatus.data.recruiting);
                    setRecruitedCreatedStudyList(getCreatedStudiesByStatus.data.recruited);
                } else {
                    const resCreatedStudy = await apiClient.get('/study/me');
                    setRecruitingCreatedStudyList(resCreatedStudy.data.recruiting);
                    setRecruitedCreatedStudyList(resCreatedStudy.data.recruited);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCreatedStudyListData();
    }, [apiClient]);

    return { recruitingCreatedStudyList, recruitedCreatedStudyList, isLoading, error };
};