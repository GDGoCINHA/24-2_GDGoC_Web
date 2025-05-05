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

// utils
import { loadFromStorage, removeFromStorage, saveToStorage } from "@/utils/localStorageManager";

export default function ReviewApplication({ studyId }) {
    const router = useRouter();
    const { apiClient } = useAuthenticatedApi();
    const [applications, setApplications] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApprovalButtonDisabled, setIsApprovalButtonDisabled] = useState(false);
    const [hasProcessedApplicants, setHasProcessedApplicants] = useState(false);

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

    // 마감일 이후인지 확인
    const isAfterDeadline = () => {
        if (!studyDetail || !studyDetail.recruitEndDate) return false;

        const recruitEndDate = new Date(studyDetail.recruitEndDate);
        const endDatePlusOneDay = new Date(recruitEndDate);
        endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

        return new Date() > endDatePlusOneDay;
    };

    // applicantList를 기반으로 applications state 업데이트
    useEffect(() => {
        if (applicantList && Array.isArray(applicantList)) {
            // API에서 이미 승인/거절된 지원자가 있는지 확인
            const processed = applicantList.some(app =>
                app.status === "APPROVED" || app.status === "REJECTED"
            );
            setHasProcessedApplicants(processed);

            // 로컬스토리지에서 선택 상태 불러오기
            const storageKey = `sAL${studyId}Hambugi`;
            const storedSelections = localStorage.getItem(storageKey)
                ? JSON.parse(localStorage.getItem(storageKey))
                : [];

            // 지원자 목록 설정 (기존 상태 유지하면서 새 지원자 추가)
            setApplications(applicantList.map(app => {
                // 로컬스토리지에서 해당 지원자의 선택 상태 찾기
                const selectionId = `${studyId}${studyId}${app.id}`;
                const storedSelection = storedSelections.find(item => item.id === selectionId);

                return {
                    ...app,
                    selected: storedSelection ? Boolean(storedSelection.status) : false,
                    // API에서 이미 처리된 상태가 있으면 그대로 유지
                    status: app.status
                };
            }));

            // 마감일 이후 & 아직 API 처리 안된 경우 자동 처리
            if (isAfterDeadline() && !processed && applicantList.some(app => app.status === "REQUESTED")) {
                handleAutomaticApproval();
            }

            // 승인 버튼 비활성화 결정
            setIsApprovalButtonDisabled(processed || isAfterDeadline());
        }
    }, [applicantList, studyDetail]);

    // toggleSelection: 지원자 선택 상태 변경
    const toggleSelection = (id) => {
        if (hasProcessedApplicants) return; // 이미 처리된 지원자가 있으면 선택 불가

        const updatedApplications = applications.map(app =>
            app.id === id ? { ...app, selected: !app.selected } : app
        );

        setApplications(updatedApplications);

        // 로컬스토리지에 업데이트
        saveSelectionToStorage(updatedApplications);
    };

    // 로컬스토리지에 선택 상태 저장
    const saveSelectionToStorage = (apps) => {
        const selections = apps.map(app => ({
            id: `${studyId}${studyId}${app.id}`,
            status: !!app.selected
        }));

        saveToStorage(`sAL${studyId}Hambugi`, selections);
    };

    // 이벤트 핸들러
    const handleToggleEvent = React.useCallback((e) => {
        const { applicantId } = e.detail;
        toggleSelection(applicantId);
    }, []);

    useEffect(() => {
        window.addEventListener("toggle-applicant-selection", handleToggleEvent);

        return () => {
            window.removeEventListener("toggle-applicant-selection", handleToggleEvent);
        };
    }, [handleToggleEvent]);

    // 지원자 상세 정보 팝업
    const handleApplicantDetailPopup = (applicantId) => {
        const applicant = applications.find(app => app.id === applicantId);
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    };

    // 자동 승인 처리 (마감일 이후)
    const handleAutomaticApproval = async () => {
        try {
            // 로컬스토리지에서 선택 상태 불러오기
            const storageKey = `sAL${studyId}Hambugi`;
            const storedSelections = localStorage.getItem(storageKey)
                ? JSON.parse(localStorage.getItem(storageKey))
                : [];

            const payload = {
                attendees: applications.map(app => {
                    // 로컬스토리지에 있는 지원자는 해당 상태로, 없는 지원자는 기본 불합격
                    const selectionId = `${studyId}${studyId}${app.id}`;
                    const storedSelection = storedSelections.find(item => item.id === selectionId);
                    const isSelected = storedSelection ? storedSelection.status : false;

                    return {
                        attendeeId: app.id,
                        status: isSelected ? "APPROVED" : "REJECTED"
                    };
                })
            };

            if (process.env.NODE_ENV === 'development') {
                console.log("자동 승인 처리:", JSON.stringify(payload, null, 2));
                removeFromStorage(`sAL${studyId}Hambugi`);
                return;
            }

            await apiClient.patch(`/study/${studyId}/attendee`, payload);

            // 로컬스토리지 데이터 삭제
            removeFromStorage(`sAL${studyId}Hambugi`);

        } catch (e) {
            console.error('자동 승인 처리 중 오류 발생:', e);
        }
    };

    // 수동 승인 처리
    const handleApproval = async () => {
        if (!isStudyLead) {
            alert('승인 권한이 없습니다.');
            return;
        }

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
                removeFromStorage(`sAL${studyId}Hambugi`);
                return;
            }

            await apiClient.patch(`/study/${studyId}/attendee`, payload);

            // 로컬스토리지 데이터 삭제
            removeFromStorage(`sAL${studyId}Hambugi`);

            alert(`${approved.length}명 합격, ${rejected.length}명 불합격 처리되었습니다.`);

            // 버튼 비활성화 및 상태 업데이트
            setHasProcessedApplicants(true);
            setIsApprovalButtonDisabled(true);
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
                        disableSelection={hasProcessedApplicants || isAfterDeadline()}
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
                            isApprovalButtonDisabled={isApprovalButtonDisabled}
                            hasProcessedApplicants={hasProcessedApplicants}
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