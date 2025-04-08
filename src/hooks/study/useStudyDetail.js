import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import studyList from '@/mock/studyData';
import { attendee, user } from "@/mock/userData";

export const useStudyDetail = () => {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const urlParams = useSearchParams();
    const studyTitle = decodeURIComponent(urlParams.get('title'));
    const [studyInfo, setStudyInfo] = useState(null);
    const [studyLeadInfo, setStudyLeadInfo] = useState(null);
    const [isApplied, setIsApplied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Call API
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
                    const leadData = user.data.find(usr => usr.studentId === studyData.creatorId);
                    const userApplication = attendee.data.applications.find(usr => usr.attendeeId === 12253956 && usr.studyId === studyData.id);
                    setStudyInfo(studyData);
                    setStudyLeadInfo(leadData);
                    if (userApplication) setIsApplied(true);
                } else {
                    // Fetch study info
                    const { data: studyDataRes } = await apiClient.get('/studyData?page=1');
                    const studyData = studyDataRes.studyList.find(study => study.title === studyTitle);
                    setStudyInfo(studyData);

                    // Fetch study lead info
                    const { data: studyLeadData } = await apiClient.get(`/user?id=${studyData.creatorId}`);
                    setStudyLeadInfo(studyLeadData);

                    // Fetch user's application status
                    const thisUserId = 12253956;
                    const { data: userApplications } = await apiClient.get(`/attendee?studyId=${studyData.id}`);
                    if (userApplications.applications.filter((application) => application.attendeeId === thisUserId).length > 0) {
                        setIsApplied(true);
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

    return { studyInfo, studyLeadInfo, isApplied, isLoading, error };
};