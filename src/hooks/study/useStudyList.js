import { useEffect, useState } from 'react';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import studyList from '@/mock/studyData';

export const useStudyList = () => {
    const { apiClient } = useAuthenticatedApi();
    const [studyInfo, setStudyInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setStudyInfo(studyList.data.studyList);
                } else {
                    const response = await apiClient.get('/studyData');
                    setStudyInfo(response.data.studyList);
                }
            } catch (err) {
                console.error('Error fetching study data:', err.message);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { studyInfo, isLoading, error };
};