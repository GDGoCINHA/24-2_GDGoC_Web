import { useEffect, useState } from 'react';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { getStudiesGDGOC, getStudiesPERSONAL } from "@/mock/studyMock";

export const useStudyList = () => {
    const { apiClient } = useAuthenticatedApi();

    const [studyListGDGOC, setStudyListGDGOC] = useState([]);
    const [studyListPERSONAL, setStudyListPERSONAL] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudyListData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setStudyListGDGOC(getStudiesGDGOC.data.studyList);
                    setStudyListPERSONAL(getStudiesPERSONAL.data.studyList);
                } else {
                    const resGDGOC = await apiClient.get('/studies?page=1?creatorType=GDGOC');
                    const resPERSONAL = await apiClient.get('/studies?page=1?creatorType=PERSONAL');
                    setStudyListGDGOC(resGDGOC.data.studyList);
                    setStudyListPERSONAL(resPERSONAL.data.studyList);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyListData();
    }, [apiClient]);

    return { studyListGDGOC, studyListPERSONAL, isLoading, error };
};