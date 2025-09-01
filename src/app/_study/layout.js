import { Suspense } from "react";

import Loading from "./loading";
import MenuHeader from "@/components/ui/common/MenuHeader";

export const metadata = {
    title: "Study",
    description: "Study group management and participation platform",
};

export default function StudyLayout({ children }) {
    return (
        <Suspense fallback={ <Loading /> }>
            <MenuHeader />
            {children}
        </Suspense>
    );
}