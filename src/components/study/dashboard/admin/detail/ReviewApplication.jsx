'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from "@nextui-org/react";

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useStudyDetail } from "@/hooks/study/useStudyDetail";
import { useApplicantList } from "@/hooks/study/useApplicantList";
import { useStudyAccessCheck } from "@/hooks/study/useStudyAccessCheck";

// components
import NoticeBanner from "@/components/study/ui/card/NoticeBanner";
import ApplicantInfoList from "@/components/study/ui/card/ApplicantInfoList";
import ApplicantDetailModal from "@/components/study/ui/modal/ApplicantDetailModal";

export default function ReviewApplication({ studyId }) {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const [applications, setApplications] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // API: useStudyAccessCheck
    const {
        isStudyApplicant,
        isStudyLead,
        isLoading: accessLoading,
        error: accessError,
    } = useStudyAccessCheck(apiClient, studyId);

    // API: useStudyDetail
    const {
        studyDetail,
        isLoading: detailLoading,
        error: detailError,
    } = useStudyDetail(apiClient, studyId);

    // API: useApplicantList
    const {
        applicantList,
        isLoading: listLoading,
        error: listError,
    } = useApplicantList(apiClient, studyId);

    const isLoading = accessLoading || detailLoading || listLoading;
    const error = accessError || detailError || listError;

    useEffect(() => {
        if (applicantList && Array.isArray(applicantList)) {
            setApplications(applicantList.map(app => ({ ...app, selected: false })));
        }
    }, [applicantList]);

    const toggleSelection = (id) => {
        setApplications(prev =>
            prev.map(app =>
                app.id === id ? { ...app, selected: !app.selected } : app
            )
        );
    };

    useEffect(() => {
        const handleToggleEvent = (e) => {
            const { applicantId } = e.detail;
            toggleSelection(applicantId);
        };
        window.addEventListener("toggle-applicant-selection", handleToggleEvent);
        return () => {
            window.removeEventListener("toggle-applicant-selection", handleToggleEvent);
        };
    }, []);

    const handleApplicantDetailPopup = (applicantId) => {
        const applicant = applications.find(app => app.id === applicantId);
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    };

    const handleApproval = async () => {
        if (!applications || applications.length === 0) {
            alert('지원자가 없습니다.');
            return;
        }

        try {
            const payload = {
                attendees: applications.map(app => ({
                    attendeeId: app.id,
                    status: app.selected ? "APPROVED" : "REJECTED",
                })),
            };

            const approved = applications.filter(app => app.selected);
            const rejected = applications.filter(app => !app.selected);

            if (process.env.NODE_ENV === 'development') {
                console.log("전송할 데이터:", JSON.stringify(payload, null, 2));
                console.log(`합격자: ${approved.length}명`);
                console.log(`불합격자: ${rejected.length}명`);
                alert(`${approved.length}명 합격, ${rejected.length}명 불합격 처리되었습니다.`);
                return;
            }

            await apiClient.patch(`/studies/${studyId}/applicants/status`, payload);

            alert(`${approved.length}명 합격, ${rejected.length}명 불합격 처리되었습니다.`);
        } catch (e) {
            console.error('승인 처리 중 오류 발생:', e);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    return (
        isLoading ? (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        ) : (
            <>
                {isModalOpen && (
                    <ApplicantDetailModal
                        apiClient={apiClient}
                        studyId={studyId}
                        selectedApplicant={selectedApplicant}
                        setIsModalOpen={setIsModalOpen}
                    />
                )}
                {isStudyLead ? (
                    <div className="max-w-6xl mx-auto p-4">
                        <NoticeBanner />
                        <ApplicantInfoList
                            applications={applications}
                            studyDetail={studyDetail}
                            error={error}
                            handleApplicantDetailPopup={handleApplicantDetailPopup}
                            toggleSelection={toggleSelection}
                            handleApproval={handleApproval}
                        />
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto p-4">
                        <h2 className="text-3xl font-bold mb-6">접근 권한이 없습니다.</h2>
                    </div>
                )}
            </>
        )
    );
}