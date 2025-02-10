export const formatRecruitData = (mainRecruitData) => {
    const mainRecruitDataObject = Object.fromEntries(mainRecruitData);

    return {
        member: {
            name: mainRecruitDataObject[2]?.name || "",
            grade: parseInt(mainRecruitDataObject[3]?.grade) || 0,
            studentId: mainRecruitDataObject[2]?.studentId || "",
            enrolledClassification: mainRecruitDataObject[2]?.enrolledClassification || "",
            phoneNumber: mainRecruitDataObject[3]?.phoneNumber || "",
            nationality: mainRecruitDataObject[3]?.nationality || "",
            email: mainRecruitDataObject[4]?.email || "",
            gender: mainRecruitDataObject[4]?.gender || "",
            birth: mainRecruitDataObject[4]?.birth || "",
            major: mainRecruitDataObject[5]?.major || "",
            doubleMajor: mainRecruitDataObject[5]?.doubleMajor || "",
            isPayed: mainRecruitDataObject[11]?.isPayed || false
        },
        answers: {
            gdgUserMotive: mainRecruitDataObject[6]?.gdgUserMotive || "",
            gdgUserStory: mainRecruitDataObject[7]?.gdgUserStory || "",
            gdgInterest: mainRecruitDataObject[8]?.gdgInterest || [],
            gdgPeriod: mainRecruitDataObject[8]?.gdgPeriod || [],
            gdgRoute: mainRecruitDataObject[8]?.gdgRoute || "",
            gdgExpect: mainRecruitDataObject[9]?.gdgExpect || [],
            gdgWish: mainRecruitDataObject[9]?.gdgWish || [],
            gdgFeedback: mainRecruitDataObject[10]?.gdgFeedback || ""
        }
    };
};