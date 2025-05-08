import { useEffect, useState } from 'react';

import { getStudiesGDGOC, getStudiesPERSONAL } from "@/mock/studyMock";

export const useStudyList = (apiClient) => {
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
                    //const resGDGOC = await apiClient.get('/study?page=1&creatorType=GDGOC');
                    const resPERSONAL = await apiClient.get('/study?page=1&creatorType=PERSONAL');
                    //setStudyListGDGOC(resGDGOC?.data?.data?.studyList);
                    setStudyListPERSONAL(resPERSONAL?.data?.data?.studyList);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyListData();
    }, []);

    return { studyListGDGOC, studyListPERSONAL, isLoading, error };
};