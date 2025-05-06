import { useEffect, useState } from 'react';

import { getAttendeesByStudyId } from "@/mock/studyMock";

export const useApplicantList = (apiClient, studyId) => {
    const [applicantList, setApplicantList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplicantListData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    setApplicantList(getAttendeesByStudyId.data.attendees);
                } else {
                    const resApplicant = await apiClient.get(`/study/${studyId}/attendee?page=1`);
                    setApplicantList(resApplicant.data.attendees);
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicantListData();
    }, []);

    return { applicantList, isLoading, error };
};