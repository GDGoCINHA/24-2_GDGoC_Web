import React from 'react';

// components
import AppliedStudies from "@/components/study/dashboard/my/view/AppliedStudies";

export default function MyViewArea({ currentMenu }) {
    const renderContent = () => {
        switch(currentMenu) {
            case 'appliedStudies':
                return <AppliedStudies />;
            default:
            return <AppliedStudies />;
        }
    };

    return (<>{ renderContent() }</>);
}