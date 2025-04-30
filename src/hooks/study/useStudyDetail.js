import React, { useEffect, useState } from "react";

import { getStudyDetails, getMyStudyApplyResult } from '@/mock/studyMock';

export const useStudyDetail = (apiClient, studyId) => {
    const [studyDetail, setStudyDetail] = useState(null);
    const [studyLead, setStudyLead] = useState(null);
    const [isRecruiting, setIsRecruiting] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!studyId) return;

        const fetchStudyDetailData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    if (studyId === "1") {
                        setStudyDetail(getStudyDetails.data);
                        setStudyLead(getStudyDetails.data.creator);
                        setIsRecruiting(getStudyDetails.data.status === "RECRUITING");
                        if (getMyStudyApplyResult.data.recruiting.some(application => application.studyId === Number(studyId))) {
                            setIsApplied(true);
                        }
                    }
                } else {
                    const resStudyDetail = await apiClient.get(`/studies/${studyId}`);
                    setStudyDetail(resStudyDetail.data);
                    setStudyLead(resStudyDetail.data.creator);
                    setIsRecruiting(resStudyDetail.data.status === "RECRUITING");

                    const resApplications = await apiClient.get('/studies/applicated');
                    if (resApplications.data.recruiting.some((application) => application.studyId === Number(studyId))) {
                        setIsApplied(true);
                    }
                }
            } catch (error) {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyDetailData();
    }, [apiClient, studyId]);

    return { studyDetail, studyLead, isRecruiting, isApplied, isLoading, error };
};