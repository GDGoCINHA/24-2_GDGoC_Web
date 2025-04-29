/****
 * Retrieve all study entries in a list.
 *
 * @url URL/study?page=1
 * @method GET
 *
 * @param {number} page - Page number (required)
 * @param {string} [status] - Recruitment status (optional)
 * @param {string} [creatorType] - Creator type (optional)
 *
 * @returns {Object} List of studies and pagination info
 */
const getStudyList = {
    "data": {
        studyList: [
            {
                id: 1, // Auto-generated ID
                creatorId: 12243954, // Study lead ID
                title: "블록체인 보안 스터디", // Study title
                simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.", // Brief introduction to the study
                activityIntroduce: "활동에 대한 소개.", // Introduction to the activity
                status: "RECRUITING", // Recruitment status
                recruitStartDate: "2025-04-01T00:00:00Z", // Recruitment start date (time set to 00:00:00)
                recruitEndDate: "2025-04-06T00:00:00Z", // Recruitment end date (time set to 00:00:00)
                activityStartDate: "2025-06-01T00:00:00Z", // Activity start date (time set to 00:00:00)
                activityEndDate: "2025-04-10T00:00:00Z", // Activity end date (time set to 00:00:00)
                expectedTime: "매일 오후 7시", // Expected meeting time
                expectedPlace: "정석 1층", // Expected meeting location
                creatorType: "PERSONAL", // Creator type (GDGOC or PERSONAL)
                imagePath: "https://example.com/thumbnail.jpg" // S3 path for image thumbnail
            },
            {
                id: 2,
                creatorId: 12245000,
                title: "인공지능 기초 스터디",
                simpleIntroduce: "머신러닝과 딥러닝의 기본 개념을 함께 공부합니다.",
                activityIntroduce: "주 2회 온라인 미팅과 과제 수행을 중심으로 진행합니다.",
                status: "RECRUITING",
                recruitStartDate: "2025-05-01T00:00:00Z",
                recruitEndDate: "2025-05-15T00:00:00Z",
                activityStartDate: "2025-05-20T00:00:00Z",
                activityEndDate: "2025-07-20T00:00:00Z",
                expectedTime: "화요일, 목요일 오후 8시",
                expectedPlace: "온라인(Zoom)",
                creatorType: "PERSONAL",
                imagePath: "https://example.com/thumbnail.jpg"
            },
            {
                id: 3,
                creatorId: 12246000,
                title: "영어 회화 집중 스터디",
                simpleIntroduce: "매주 영어 원어민과 함께 회화 연습을 합니다.",
                activityIntroduce: "소규모 그룹으로 매주 1회 오프라인 모임과 매일 챗 연습을 병행합니다.",
                status: "CLOSED",
                recruitStartDate: "2024-12-01T00:00:00Z",
                recruitEndDate: "2024-12-10T00:00:00Z",
                activityStartDate: "2025-01-05T00:00:00Z",
                activityEndDate: "2025-03-30T00:00:00Z",
                expectedTime: "매주 토요일 오전 10시",
                expectedPlace: "강남역 카페",
                creatorType: "GDGOC",
                imagePath: "https://example.com/thumbnail.jpg"
            },
            {
                id: 4,
                creatorId: 12247001,
                title: "데이터 사이언스 입문 스터디",
                simpleIntroduce: "데이터 분석과 시각화 기초를 배우고 실습합니다.",
                activityIntroduce: "주 1회 오프라인 모임과 과제 중심의 진행.",
                status: "RECRUITING",
                recruitStartDate: "2025-03-15T00:00:00Z",
                recruitEndDate: "2025-03-30T00:00:00Z",
                activityStartDate: "2025-04-05T00:00:00Z",
                activityEndDate: "2025-06-05T00:00:00Z",
                expectedTime: "목요일 오후 6시",
                expectedPlace: "서울대 공학관 201호",
                creatorType: "PERSONAL",
                imagePath: "https://example.com/datascience.jpg"
            },
            {
                id: 5,
                creatorId: 12248000,
                title: "웹 개발 집중 스터디",
                simpleIntroduce: "React와 Node.js를 활용한 웹 개발 프로젝트 진행.",
                activityIntroduce: "팀 프로젝트와 코드 리뷰 중심의 활동.",
                status: "CLOSED",
                recruitStartDate: "2024-11-01T00:00:00Z",
                recruitEndDate: "2024-11-15T00:00:00Z",
                activityStartDate: "2024-11-20T00:00:00Z",
                activityEndDate: "2025-01-20T00:00:00Z",
                expectedTime: "주말 오후 2시",
                expectedPlace: "홍대 코워킹 스페이스",
                creatorType: "GDGOC",
                imagePath: "https://example.com/webdev.jpg"
            },
            {
                id: 6,
                creatorId: 12249000,
                title: "자바 프로그래밍 스터디",
                simpleIntroduce: "기초부터 고급까지 자바 프로그래밍을 함께 학습합니다.",
                activityIntroduce: "온라인 강의와 주간 코드 실습 병행.",
                status: "RECRUITING",
                recruitStartDate: "2025-02-01T00:00:00Z",
                recruitEndDate: "2025-02-10T00:00:00Z",
                activityStartDate: "2025-02-15T00:00:00Z",
                activityEndDate: "2025-04-15T00:00:00Z",
                expectedTime: "월, 수요일 저녁 7시",
                expectedPlace: "온라인(Zoom)",
                creatorType: "PERSONAL",
                imagePath: "https://example.com/java.jpg"
            }
        ]
    },
    "meta": {
        page: 1, // Current page number
        pageCount: 10 // Total number of pages
    }
};

/**
 * Retrieve study details by study ID.
 *
 * @url URL/study/{studyId}
 * @method GET
 *
 * @param {number} studyId - Study ID to fetch (included in URL)
 *
 * @returns {Object} Study detail object
 */
const getStudyDetails = {
    "statusCode": 200, // removed
    "message": "Request processed successfully", // removed
    "success": true, // removed
    "data": {
        id: 1,
        creatorId: 12243954,
        title: "블록체인 보안 스터디",
        simpleIntroduce: "블록체인의 보안 측면을 이해하고, 암호화와 데이터 무결성에 대해 알아봅니다.",
        activityIntroduce: "활동에 대한 소개.",
        status: "RECRUITING",
        recruitStartDate: "2025-04-01T00:00:00Z",
        recruitEndDate: "2025-04-06T00:00:00Z",
        activityStartDate: "2025-04-06T00:00:00Z",
        activityEndDate: "2025-04-10T00:00:00Z",
        expectedTime: "메일 오후 7시",
        expectedPlace: "정석 1층",
        creatorType: "PERSONAL",
        imagePath: "https://example.com/thumbnail.jpg"
    }
};

/**
 * Create a new study.
 *
 * @url URL/study
 * @method POST
 *
 * @body
 * {
 *   "title": {string} (required),
 *   "simpleIntroduce": {string} (required),
 *   "activityIntroduce": {string} (required),
 *   "creatorType": {string} (required),
 *   "status": {string} (needs confirmation),
 *   "recruitStartDate": {string} ISO date (required),
 *   "recruitEndDate": {string} ISO date (required),
 *   "activityStartDate": {string} ISO date (required),
 *   "activityEndDate": {string} ISO date (required),
 *   "expectedTime": {string} (required),
 *   "expectedPlace": {string} (required),
 *   "imagePath": {string} (required)
 * }
 *
 * @returns {Object} Created study data (mocked)
 */
const createStudy = {
    createdBy: 12243954, // (Handled by backend, no need to include)
    title: "정석 공부팟", // (required)
    simpleIntroduce: "정석에서 같이 열공할 사람들 구합니다.", // (required)
    activityIntroduce: "정석에서 모여 각자 공부", // (required)
    creatorType: "PERSONAL", // (required)
    status: "RECRUITING", // (needs confirmation)
    recruitStartDate: "2025-04-01T00:00:00Z", // (required) time defaults to 00:00:00
    recruitEndDate: "2025-04-15T00:00:00Z", // (required) time defaults to 00:00:00
    activityStartDate: "2025-04-01T00:00:00Z", // (required) time defaults to 00:00:00
    activityEndDate: "2025-04-15T00:00:00Z", // (required) time defaults to 00:00:00
    expectedTime: "매주 목요일 오후 7시 - 9시", // (required)
    expectedPlace: "정석학술정보도서관 지하1층", // (required)
    imagePath: "이미지첨부파일" // (required) original file send method
};

/**
 * Retrieve study attendees.
 *
 * @url URL/study/{studyId}/attendee
 * @method GET
 *
 * @param {number} [studyId] - Study ID (optional)
 * @param {number} [attendeeId] - Applicant ID (optional)
 *
 * @returns {Object} List of study applications
 */
// call by studyId
const getStudyAttendee1 = {
    "data": {
        applications: [
            {
                id: 1,
                studyId: 1,
                attendeeId: 12243954,
                status: "APPROVED",
                introduce: "저는 멋있는 사람입니다.", // Self introduction
                activityTime: "월 오후 9시~, 화욜 5시~", // Available activity time
                updatedAt: "2025-03-01T00:00:00"
            },
            {
                id: 2,
                studyId: 2,
                attendeeId: 12240000,
                status: "REQUESTED",
                introduce: "저는 그냥 사람입니다.", // Self introduction
                activityTime: "월 오후 5시~, 화욜 공강", // Available activity time
                updatedAt: "2025-03-23T00:00:00"
            },
            {
                id: 4,
                studyId: 1,
                attendeeId: 12247000,
                status: "REJECTED",
                introduce: "열심히 참여하고 싶었지만, 일정이 맞지 않아 아쉽습니다.",
                activityTime: "주말 오후 가능",
                updatedAt: "2025-03-25T00:00:00"
            },
            {
                id: 6,
                studyId: 4,
                attendeeId: 12248001,
                status: "APPROVED",
                introduce: "데이터 분석에 관심이 많아 참여했습니다.",
                activityTime: "목요일 오후 6시 이후 가능",
                updatedAt: "2025-03-10T00:00:00"
            },
            {
                id: 7,
                studyId: 5,
                attendeeId: 12247000,
                status: "REJECTED",
                introduce: "웹 개발 경험을 쌓고 싶었지만, 일정이 겹쳐서 아쉽습니다.",
                activityTime: "주말 오후 2시 가능",
                updatedAt: "2025-02-28T00:00:00"
            },
            {
                id: 8,
                studyId: 6,
                attendeeId: 12243954,
                status: "REQUESTED",
                introduce: "자바 기초부터 차근차근 배우고 싶습니다.",
                activityTime: "월, 수요일 저녁 7시 가능",
                updatedAt: "2025-01-15T00:00:00"
            }
        ]
    }
};

// call by attendeeId
const getStudyAttendee2 = {
    "data": {
        applications: [
            {
                id: 1,
                studyId: 1,
                attendeeId: 12243954,
                status: "APPROVED",
                introduce: "저는 멋있는 사람입니다.", // Self introduction
                activityTime: "월 오후 9시~, 화욜 5시~", // Available activity time
                updatedAt: "2025-03-01T00:00:00"
            },
            {
                id: 3,
                studyId: 2,
                attendeeId: 12243954,
                status: "REQUESTED",
                introduce: "저는 그냥 사람입니다.", // Self introduction
                activityTime: "월 오후 5시~, 화욜 공강", // Available activity time
                updatedAt: "2025-03-20T00:00:00"
            },
            {
                id: 5,
                studyId: 3,
                attendeeId: 12243954,
                status: "APPROVED",
                introduce: "영어 회화 실력을 늘리고 싶습니다.",
                activityTime: "주말 오전 시간 가능",
                updatedAt: "2025-03-28T00:00:00"
            },
            {
                id: 9,
                studyId: 4,
                attendeeId: 12243954,
                status: "REQUESTED",
                introduce: "데이터 과학에 입문하고 싶습니다.",
                activityTime: "목요일 오후 6시 이후 가능",
                updatedAt: "2025-03-15T00:00:00"
            },
            {
                id: 10,
                studyId: 6,
                attendeeId: 12243954,
                status: "APPROVED",
                introduce: "자바 스터디를 통해 실력을 향상시키고 싶습니다.",
                activityTime: "월, 수요일 저녁 7시 가능",
                updatedAt: "2025-02-10T00:00:00"
            },
            {
                id: 11,
                studyId: 5,
                attendeeId: 12243954,
                status: "REJECTED",
                introduce: "웹 개발에 관심이 많지만 일정이 맞지 않아 아쉽습니다.",
                activityTime: "주말 오후 2시 가능",
                updatedAt: "2025-01-30T00:00:00"
            }
        ]
    }
}

/**
 * Create a study application.
 *
 * @url URL/study/{studyId}/attendee
 * @method POST
 *
 * @body
 * {
 *   "studyId": {number} (required),
 *   "attendeeId": {number} (required),
 *   "status": {string} (needs confirmation, likely handled by backend),
 *   "introduce": {string} (required),
 *   "activityTime": {string} (required)
 * }
 *
 * @returns {Object} Created application data
 */
const createStudyAttendee = {
    studyId: 20, // (required) Study ID
    attendeeId: 12243954, // (required) Applicant ID
    status: "REQUESTED", // (needs confirmation, likely handled by backend)
    introduce: "저는 사실 엄청 멋있는 사람입니다!", // Self introduction (required)
    activityTime: "수요일만 아니면 다 5시 이후로 가능!" // Available activity time (required)
};

/**
 * Update the status of a study applicant.
 *
 * @url URL/study/{studyId}/attendee
 * @method POST
 *
 * @body
 * {
 *   "studyId": {number} (required),
 *   "attendeeId": {number} (required),
 *   "status": {string} (required)
 * }
 *
 * @returns {Object} Updated application status
 */
const updateStudyAttendee = {
    studyId: 1, // (required) Study ID
    attendeeId: 12243954, // (required) Applicant ID
    status: "APPROVED" // (required) Application status
};

export {
    getStudyList,
    getStudyDetails,
    createStudy,
    getStudyAttendee1,
    getStudyAttendee2,
    createStudyAttendee,
    updateStudyAttendee
}