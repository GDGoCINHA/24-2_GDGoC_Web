import React from 'react';

// components
import CreatedStudies from "@/components/study/dashboard/admin/view/CreatedStudies";

export default function AdminViewArea({ currentMenu }) {
    const renderContent = () => {
        switch(currentMenu) {
            case 'createdStudies':
                return <CreatedStudies />;
            default:
                return <CreatedStudies />;
        }
    };

    return (<>{ renderContent() }</>);
}