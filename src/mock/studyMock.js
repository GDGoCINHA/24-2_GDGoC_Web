/**
 * 스터디 리스트 정보를 불러옵니다.
 * @url URL/studies?page=1
 * @method GET
 * @param {number} page - 페이지 번호. (필수)
 * @param {string} status - 스터디 상태, 예: "RECRUITING". (선택)
 * @param {string} creatorType - 생성자 유형, 예: "GDGOC". (선택)
 * @returns {object} studyList 배열과 meta 정보(page, pageCount)를 반환.
 */
// GDGOC
const getStudiesGDGOC = {
    data: {
        studyList: [
            {
                id: 1,
                creatorId: 102,
                title: "블록체인 GDGOC 스터디",
                simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
                status: "RECRUITING",
                recruitStartDate: "모집 시작일 (ISO 8601 datetime 포맷, 예: 2025-04-01T00:00:00Z).",
                recruitEndDate: "모집 마감일 (ISO 8601 datetime 포맷, 예: 2025-04-15T23:59:59Z).",
                creatorType: "GDGOC",
                imagePath: "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            },
            {
                id: 2,
                creatorId: 103,
                title: "블록체인 보안 GDGOC 스터디",
                simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
                status: "RECRUITING",
                recruitStartDate: "모집 시작일 (ISO 8601 datetime 포맷, 예: 2025-04-01T00:00:00Z).",
                recruitEndDate: "2025-04-15T23:59:59Z",
                creatorType: "GDGOC",
                imagePath: "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            }
        ]
    },
    meta: {
        page: 1, // 현재 페이지 번호.
        pageCount: 10 // 전체 페이지 수.
    }
}

// PERSONAL
const getStudiesPERSONAL = {
    data: {
        studyList: [
            {
                id: 3,
                creatorId: 12243954,
                title: "블록체인 보안 PERSONAL 스터디",
                simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
                status: "RECRUITING",
                recruitStartDate: "모집 시작일 (ISO 8601 datetime 포맷, 예: 2025-04-01T00:00:00Z).",
                recruitEndDate: "모집 마감일 (ISO 8601 datetime 포맷, 예: 2025-04-15T23:59:59Z).",
                creatorType: "PERSONAL",
                imagePath: "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            },
            {
                id: 4,
                creatorId: 12243954,
                title: "블록체인 보안 PERSONAL 스터디",
                simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
                status: "RECRUITING",
                recruitStartDate: "모집 시작일 (ISO 8601 datetime 포맷, 예: 2025-04-01T00:00:00Z).",
                recruitEndDate: "모집 마감일 (ISO 8601 datetime 포맷, 예: 2025-04-15T23:59:59Z).",
                creatorType: "PERSONAL",
                imagePath: "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            }
        ]
    },
    meta: {
        page: 1, // 현재 페이지 번호.
        pageCount: 10 // 전체 페이지 수.
    }
}

/**
 * 스터디 상세 정보를 불러옵니다.
 * @url URL/studies/{studyId}
 * @method GET
 * @param {number} studyId - 스터디 ID. (필수)
 * @returns {object} 스터디 상세 정보와 meta 데이터를 반환.
 */
const getStudyDetails = {
    data: {
        id: 20,
        creator: {
            id: 1,
            name: "김소연",
            major: "컴퓨터공학과",
            studentId: "12211234",
            phoneNumber: "010-1234-1234"
        },
        title: "블록체인 보안 스터디",
        simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
        activityIntroduce: "활동에 대한 소개입니다.",
        status: "RECRUITING",
        recruitStartDate: "모집 시작일 (ISO 8601 datetime 포맷, 예: 2025-04-01T00:00:00Z).",
        recruitEndDate: "2025-05-15T00:00:00Z",
        activityStartDate: "활동 시작일 (ISO 8601 datetime 포맷).",
        activityEndDate: "활동 마감일 (ISO 8601 datetime 포맷).",
        expectedTime: "예상 활동 시간입니다.",
        expectedPlace: "예상 활동 장소입니다.",
        creatorType: "PERSONAL",
        imagePath: "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
    },
    meta: null
}

/**
 * 스터디를 등록합니다.
 * @url URL/studies
 * @method POST
 * @body {
 *    title: "정석 공부팟", (필수)
 *    simpleIntroduce: "정석에서 같이 열공할 사람들 구합니다.", (필수)
 *    activityIntroduce: "정석에서 모여 각자 공부", (필수)
 *    creatorType: "PERSONAL", (필수)
 *    recruitStartDate: "2025-04-01T00:00:00Z", (ISO 8601 datetime 포맷, 필수)
 *    recruitEndDate: "2025-04-15T23:59:59Z", (ISO 8601 datetime 포맷, 필수)
 *    activityStartDate: "2025-04-01T00:00:00Z", (ISO 8601 datetime 포맷, 필수)
 *    activityEndDate: "2025-04-15T23:59:59Z", (ISO 8601 datetime 포맷, 필수)
 *    expectedTime: "매주 목요일 오후 7시 - 9시", (필수)
 *    expectedPlace: "정석학술정보도서관 지하1층" (선택)
 *    image: {object} (필수)
 * }
 * @returns {object} 등록 결과 데이터와 meta 정보를 반환.
 */
const createStudyResult = {
    data: null,
    meta: null
}

/**
 * 스터디 지원자 정보를 등록합니다 (스터디 신청).
 * @url URL/study/{studyId}/applications
 * @method POST
 * @body {
 *    introduce: "저는 사실 엄청 멋있는 사람입니다!", (필수)
 *    activityTime: "수요일만 아니면 다 5시 이후로 가능!" (필수)
 * }
 * @returns {object} 신청 결과 데이터와 meta 정보를 반환.
 */
const applyStudyResult = {
    data: null,
    meta: null
}

/**
 * [스터디 관리] 모집 중인 스터디와 모집 완료된 스터디를 나누어 조회합니다.
 * @url URL/studies/created
 * @method GET
 * @returns {object} recruiting과 recruited 배열 및 meta 정보를 반환.
 */
const getCreatedStudiesByStatus = {
    data: {
        recruiting: [
            {
                id: 20,
                title: "AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디",
                activityStartDate: "2025-05-01T00:00:00Z",
                activityEndDate: "2025-06-30T00:00:00Z"
            }
        ],
        recruited: [
            {
                id: 2,
                title: "웹 백엔드 심화 스터디",
                activityStartDate: "2025-04-20T00:00:00Z",
                activityEndDate: "2025-06-01T00:00:00Z"
            }
        ]
    },
    meta: null
}

/**
 * [스터디 관리] 특정 스터디의 지원자 목록을 조회합니다.
 * @url /studies/{studyId}/applicants?page=1
 * @method GET
 * @param {number} studyId - 스터디 ID. (필수)
 * @param {number} page - 페이지 번호. (선택)
 * @returns {object} attendees 배열과 meta 정보(page, pageCount)를 반환.
 */
const getAttendeesByStudyId = {
    data: {
        attendees: [
            {
                id: 1,
                name: "김소연",
                major: "컴퓨터공학과컴퓨터공학과",
                studentId: "12211234",
                status: "REQEUSTED"
            },
            {
                id: 2,
                name: "김ㅇㅇ",
                major: "컴퓨터공학과",
                studentId: "12211235",
                status: "REQEUSTED"
            }
        ]
    },
    meta: {
        page: 0, // 현재 페이지 번호.
        pageCount: 2 // 전체 페이지 수.
    }
}

/**
 * [스터디 관리] 특정 스터디의 특정 지원자 지원서 상세 정보를 조회합니다.
 * @url /studies/{studyId}/applicants/{attendeeId}
 * @method GET
 * @param {number} studyId - 스터디 ID. (필수)
 * @param {number} attendeeId - 지원자 ID. (필수)
 * @returns {object} 지원자 상세 정보를 반환.
 */
const getAttendeeDetailsByStudyId = {
    data: {
        name: "김소연",
        phone: "010-1234-5678",
        major: "컴퓨터공학과",
        studentId: "12212444",
        introduce: "저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!저는 사실 엄청 멋있는 사람입니다!",
        activityTime: "수요일만 아니면 다 5시 이후로 가능!"
    },
    meta: null
}

/**
 * [스터디 관리] 지원자 상태를 업데이트합니다.
 * @url /studies/{studyId}/applicants/status
 * @method PATCH
 * @body {
 *    attendees: [
 *        {
 *            attendeeId: 1, // 지원자 고유 ID (studentId 아님).
 *            status: "APPROVED"
 *        },
 *        {
 *            attendeeId: 2,
 *            status: "REJECTED"
 *        }
 *    ]
 * }
 * @returns {object} 상태 업데이트 결과와 meta 정보를 반환.
 */
const updateAttendeeStatusResult = {
    data: null,
    meta: null
}

/**
 * [스터디 관리] 내가 신청한 스터디 지원 결과를 조회합니다.
 * @url /studies/applicated
 * @method GET
 * @returns {object} recruiting과 recruited 배열 및 meta 정보를 반환.
 */
const getMyStudyApplyResult = {
    data: {
        recruiting: [
            {
                studyId: 20,
                title: "AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI 스터디AI ",
                recruitEndDate: "2025-05-10T23:59:59Z",
                myStatus: "REQUESTED"
            },
            {
                studyId: 27,
                title: "프론트엔드 스터디",
                recruitEndDate: "2025-05-10T23:59:59Z",
                myStatus: "REJECTED"
            }
        ],
        recruited: [
            {
                studyId: 21,
                title: "블록체인 보안 스터디",
                recruitEndDate: "2025-05-07T23:59:59Z",
                myStatus: "APPROVED"
            }
        ]
    },
    meta: null
}

// 모듈 export
export {
    getStudiesGDGOC,
    getStudiesPERSONAL,
    getStudyDetails,
    getCreatedStudiesByStatus,
    getAttendeesByStudyId,
    getAttendeeDetailsByStudyId,
    getMyStudyApplyResult
};