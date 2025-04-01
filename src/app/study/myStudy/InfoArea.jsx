import ResultView from "./components/view/ApplyResult";
import AttendanceView from "./components/view/Attendance";
import WeeklyView from "./components/view/WeeklyInfo";

export default function InfoArea({ currentMenu }) {
    const renderContent = () => {
        switch(currentMenu) {
            case 'applyResult':
                return <ResultView />;
            case 'attendance':
                return <AttendanceView />;
            case 'weakly':
                return <WeeklyView />;
            default:
                return <ResultView />;
        }
    };

    return (
        <div className="w-full md:w-3/4 bg-black text-white p-4 md:p-6 rounded-lg">
            {renderContent()}
        </div>
    );
}