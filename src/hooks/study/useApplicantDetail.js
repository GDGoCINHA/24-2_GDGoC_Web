import { useEffect, useState } from 'react';

import { getAttendeeDetailsByStudyId } from "@/mock/studyMock";

export const useApplicantDetail = (apiClient, studyId, applicantId) => {
    const [applicantDetail, setApplicantDetail] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplicantDetailData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setApplicantDetail(getAttendeeDetailsByStudyId.data);
                } else {
                    const resApplicantDetail = await apiClient.get(`/study/${studyId}/attendee/${applicantId}`);
                    setApplicantDetail(resApplicantDetail?.data?.data);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicantDetailData();
    }, [studyId, applicantId]);

    return { applicantDetail, isLoading, error };
};