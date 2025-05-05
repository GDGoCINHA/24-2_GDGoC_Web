import React, { useEffect, useState } from 'react';

// components
import ReviewApplication from "@/components/study/dashboard/admin/detail/ReviewApplication";
// import Attendance from "@/components/study/dashboard/my/detail/Attendance";
// import Weekly from "@/components/study/dashboard/my/detail/Weekly";

export default function AdminDetailArea({ studyId, currentMenu }) {
    const renderContent = () => {
        switch(currentMenu) {
            case 'reviewApplication':
                return <ReviewApplication studyId={studyId} />;
            case 'attendance':
                alert("현재 기능 준비 중입니다.");
                return;
            //return <Attendance studyId={studyId} />;
            case 'weakly':
                alert("현재 기능 준비 중입니다.");
                return;
            //return <Weekly studyId={studyId} />;
            default:
                return <ReviewApplication studyId={studyId} />;
        }
    };

    return (<>{ renderContent() }</>);
}