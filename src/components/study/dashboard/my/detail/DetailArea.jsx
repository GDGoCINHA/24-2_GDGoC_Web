// components
import StudyDetail from "@/components/study/dashboard/my/detail/StudyDetail";
// import Attendance from "@/components/study/dashboard/my/detail/Attendance";
// import Weekly from "@/components/study/dashboard/my/detail/Weekly";

export default function MyDetailArea({ studyId, currentMenu }) {
    const renderContent = () => {
        switch(currentMenu) {
            case 'studyDetail':
                return <StudyDetail studyId={studyId} />;
            case 'attendance':
                alert("현재 기능 준비 중입니다.");
                return;
            //return <Attendance studyId={studyId} />;
            case 'weakly':
                alert("현재 기능 준비 중입니다.");
                return;
            //return <Weekly studyId={studyId} />;
            default:
                return <StudyDetail studyId={studyId} />;
        }
    };

    return (<>{ renderContent() }</>);
}