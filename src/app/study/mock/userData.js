const user = {
    data: [
        {
            studentId: 12243954,
            name: "이재아",
            major: "컴퓨터공학과",
            grade: 2,
            phoneNumber: "010-1234-5678"
        },
        {
            studentId: 12243955,
            name: "qwerty",
            major: "컴퓨터공학과",
            grade: 3,
            phoneNumber: "010-1234-5678"
        },
        { // this is test user
            studentId: 12253956,
            name: "TESTUSER",
            major: "TEST",
            grade: 1,
            phoneNumber: "010-1111-1111"
        }
    ]
};

const attendee = {
    "data": {
        applications: [
            {
                id: 1,
                studyId: 1,
                attendeeId: 12253954,
                status: "APPROVED",
                introduce: "저는 멋있는 사람입니다.",
                activityTime: "월 오후 9시~, 화욜 5시~",
                updatedAt: "2025-03-01T12:00:00"
            },
            {
                id: 2,
                studyId: 7,
                attendeeId: 12243954,
                status: "REQUESTED",
                introduce: "저는 그냥 사람입니다.",
                activityTime: "월 오후 5시~, 화욜 공강",
                updatedAt: "2025-03-23T12:00:00"
            },
            {
                id: 3,
                studyId: 7,
                attendeeId: 12253956,
                status: "APPROVED",
                introduce: "테스트 유저입니다. 열심히 하겠습니다.",
                activityTime: "수요일 오후, 금요일 오전",
                updatedAt: "2025-03-25T09:30:00"
            },
            {
                id: 4,
                studyId: 5,
                attendeeId: 12243955,
                status: "REQUESTED",
                introduce: "프론트엔드 관심 있습니다.",
                activityTime: "화요일 오후 2시~, 목요일 오후",
                updatedAt: "2025-03-28T14:10:00"
            },
            {
                id: 5,
                studyId: 3,
                attendeeId: 12253956,
                status: "REJECTED",
                introduce: "이전에 신청한 스터디입니다.",
                activityTime: "토요일 오전",
                updatedAt: "2025-03-15T10:00:00"
            }
        ]
    }
};

export {
    user,
    attendee
};