import { useEffect, useState } from 'react';
import {useRouter, useSearchParams} from "next/navigation";

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import studyList from '@/mock/studyData';
import { user, attendee } from "@/mock/userData";

export const useStudyCreatePreCheck = () => {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const urlParams = useSearchParams();
    const studyTitle = urlParams.get('title');
    const [studyInfo, setStudyInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    const studyData = studyList.data.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);
                } else {
                    const { data: studyDataRes } = await apiClient.get('/studyData?page=1');
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
    }, [studyTitle]);

    return { studyInfo, isLoading, error };
};