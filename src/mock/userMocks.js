/**
 * Get User Data
 *
 * @url URL/
 * @method GET
 *
 * @param
 * */
const getUser = {
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
        { // this is TESTUSER
            studentId: 12253956,
            name: "TESTUSER",
            major: "TEST",
            grade: 1,
            phoneNumber: "010-1111-1111"
        }
    ]
};

export {
    getUser
};