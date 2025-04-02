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
    statusCode: 200,
    data: [
        {
            id: 1,
            studyId: 1,
            attendeeId: 12253956, // change this
            status: "REQUESTED",
            introduce: "안녕하세요, 이번 스터디에 지원한 이재아입니다. 잘 부탁드립니다.",
            activityTime: "오후 7시 이후",
            createdAt: "2023-10-01T12:00:00",
        }
    ],
    message: "요청이 성공적으로 처리되었습니다.",
    success: true
};

export {
    user,
    attendee
};