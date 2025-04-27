import { useEffect, useState } from 'react';
import {useRouter, useSearchParams} from "next/navigation";

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import studyList from '@/mock/studyData';
import {attendee} from "@/mock/userData";

export const useStudyApplyPreCheck = () => {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const urlParams = useSearchParams();
    const studyTitle = decodeURIComponent(urlParams.get('title'));
    const [studyInfo, setStudyInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if studyTitle is provided
                if (!studyTitle || studyTitle === "null") { // 타이틀이 없는 자, 너는 여길 지나갈수 없다!
                    router.push(`/study`);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    const studyData = studyList.data.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);

                    const userApplication = attendee.data.applications.find(usr => usr.attendeeId === 12253956 && usr.studyId === studyData.id);
                    if (userApplication) { // 당신은 이미 지원을 했다!
                        router.push(`/study/detail?title=${encodeURIComponent(studyTitle)}`);
                    }
                } else {
                    const { data: studyDataRes } = await apiClient.get('/study?page=1');
                    const studyData = studyDataRes.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);

                    const thisUserId = 12253956;
                    const { data: userApplications } = await apiClient.get('/study/${studyData.id}/attendee');
                    if (userApplications.applications.filter((application) => application.attendeeId === thisUserId).length > 0) {
                        router.push(`/study/detail?title=${encodeURIComponent(studyTitle)}`);
                    }
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