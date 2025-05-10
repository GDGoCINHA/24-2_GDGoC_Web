import { Suspense } from "react";
import SimpleLoading from "@/components/common/SimpleLoading";

export const metadata = {
    title: "Study",
    description: "Study group management and participation page",
};

export default function StudyLayout({ children }) {
    return (
        <Suspense fallback={ <SimpleLoading /> }>
            {children}
        </Suspense>
    );
}