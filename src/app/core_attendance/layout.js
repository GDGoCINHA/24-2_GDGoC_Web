import MenuHeader from "@/components/ui/common/MenuHeader";
import ApiCodeGuard from "@/components/auth/ApiCodeGuard.jsx";

export const metadata = {
    title: "Core Attendance", description: "GDGoC INHA Core Attendance Management",
};

export default function CoreAttendanceLayout({children}) {
    return (<ApiCodeGuard>
            <>
                <MenuHeader/>
                {children}
            </>
        </ApiCodeGuard>);
}