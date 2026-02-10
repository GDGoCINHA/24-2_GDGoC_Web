'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from "@nextui-org/react";

// hooks
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

// API services
import { useStudyDetail } from "@/services/study/useStudyDetail";
import { useApplicantList } from "@/services/study/useApplicantList";
import { useStudyAccessCheck } from "@/services/study/useStudyAccessCheck";

// components
import ApplicantInfoList from "@/components/study/ui/card/ApplicantInfoList";
import ApplicantDetailModal from "@/components/study/ui/modal/ApplicantDetailModal";

// utils
import { loadFromStorage, removeFromStorage, saveToStorage } from "@/utils/localStorageManager";

export default function ReviewApplication({ studyId }) {



    /**
     *
     *
     *
     *
     * 여기 인원 확정 처리하는 부분 로직 뭔가 조금 수상하다...?
     * 백엔드 단에서 마감일자 지나면 자동으로 처리해주면 좋을거 같은데.......ㅠ
     * 인원 확정 이후 버튼 비활성화 및 메시지 처리 필요
     * 수정?????????? 확인 필요할듯
     *
     * == 현재 로직 ==
     * 1. applicantList API로 지원자 목록을 불러온다.
     * 2. 지원자 목록 중 이미 승인(“APPROVED”) 또는 거절(“REJECTED”) 상태인 지원자가 있는지 확인한다.
     * 3. 이미 처리된 지원자가 있다면 hasProcessedApplicants를 true로 설정하고, 이후 지원자 선택(토글)은 비활성화된다.
     * 4. 로컬스토리지에서 이전에 선택했던 지원자 선택 상태를 불러와서 applicantList와 매칭하여 applications state에 반영한다.
     * 5. 마감일이 지났고, 아직 처리되지 않은 지원자 중 상태가 “REQUESTED”인 경우, 자동으로 handleAutomaticApproval()을 호출하여 지원자들의 승인/거절을 확정 처리한다.
     * 6. 마감일 이후거나 이미 처리된 지원자가 있으면 승인 버튼을 비활성화한다(isApprovalButtonDisabled = true).
     * 7. 수동 승인 처리 시(handleApproval), 현재 applications 상태(선택된 지원자)를 기반으로 승인/거절 payload를 생성하고, API로 일괄 PATCH 요청을 보낸다.
     * 8. 승인/거절 처리 후 로컬스토리지에 저장된 선택 상태를 삭제한다.
     * 9. 처리 후 router.reload()로 페이지 전체를 새로고침하여 최신 상태를 반영한다.
     * 10. 처리 후 버튼을 비활성화하고 hasProcessedApplicants를 true로 갱신한다.
     *
     *
     */


    const { apiClient } = useAuthenticatedApi();
    const router = useRouter();

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
                const selectionId = `${studyId}${app.id}`;
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
            id: `${studyId}${app.id}`,
            status: !!app.selected
        }));

        saveToStorage(`sAL${studyId}Hambugi`, selections);
    };

    // 이벤트 핸들러
    const handleToggleEvent = useCallback((e) => {
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
                    const selectionId = `${studyId}${app.id}`;
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

            // 데이터 업데이트를 위한 페이지 리로딩
            router.reload();

        } catch (e) {
            console.error('자동 승인 처리 중 오류 발생');
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

                // 로컬스토리지 데이터 삭제
                removeFromStorage(`sAL${studyId}Hambugi`);

                // 버튼 비활성화 및 상태 업데이트
                setHasProcessedApplicants(true);
                setIsApprovalButtonDisabled(true);

                // 데이터 업데이트를 위한 페이지 리로딩
                router.reload();
                return;
            }

            await apiClient.patch(`/study/${studyId}/attendee`, payload);

            // 로컬스토리지 데이터 삭제
            removeFromStorage(`sAL${studyId}Hambugi`);

            // 나중에 삭제 처리 필요할 듯?
            alert(`${approved.length}명 합격, ${rejected.length}명 불합격 처리되었습니다.`);

            // 버튼 비활성화 및 상태 업데이트
            setHasProcessedApplicants(true);
            setIsApprovalButtonDisabled(true);

            // 데이터 업데이트를 위한 페이지 리로딩
            router.reload();
        } catch (e) {
            console.error('승인 처리 중 오류 발생');
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