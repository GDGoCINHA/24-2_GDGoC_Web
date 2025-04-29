import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import { getStudyList, getStudyAttendee1 } from '@/mock/studyMock';

export const useStudyCreatePreCheck = (studyId) => {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const [studyInfo, setStudyInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    const studyData = getStudyList.data.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);
                } else {
                    const { data: studyDataRes } = await apiClient.get('/study?page=1');
                    const studyData = studyDataRes.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);
                }
            } catch (error) {
                console.error('error fetching study data');
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studyId]);

    return { studyInfo, isLoading, error };
};