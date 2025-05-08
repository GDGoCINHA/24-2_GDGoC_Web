'use client';

import { useState } from "react";
import { useParams } from 'next/navigation';

// components
import StudyHeader from '@/components/study/StudyHeader';
import StudyDashboardNav from "@/components/study/ui/nav/StudyDashboardNav";
import InfoArea from "@/components/study/dashboard/InfoArea";

export default function MyDetailDashboard() {
    const pathParams = useParams();
    const studyId =  decodeURIComponent(pathParams.id);

    const [activeMenu, setActiveMenu] = useState('studyDetail');

    // menu click handler
    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
    };

    return (
        <>
            <StudyHeader />
            {/* 추후 StudyDashboardNav는 고정, InfoArea는 스크롤되도록 변경 */}
            {/* 또한 모바일 버전에는 dropDown으로 StudyDashboardNav 표기하는게 나을듯? */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6 mt-6 md:mt-10">
                    <StudyDashboardNav
                        isAdminPage={ false }
                        studyId={ studyId }
                        currentMenu={activeMenu}
                        onMenuClick={handleMenuClick}
                    />
                    <InfoArea isAdminPage={false} studyId={ studyId } currentMenu={activeMenu} />
                </div>
            </div>
        </>
    );
};