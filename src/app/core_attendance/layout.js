import { Suspense } from "react";
import Loader from "@/components/ui/common/Loader.jsx";

export const metadata = {
    title: "Core Attendance",
    description: "GDGoC INHA Core Attendance Management",
};

export default function CoreAttendanceLayout({ children }) {
    return <Suspense fallback={<Loader />}>{children}</Suspense>;
}