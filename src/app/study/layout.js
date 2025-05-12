import { Suspense } from "react";
import Loading from "./loading";

export const metadata = {
    title: "Study | GDGoC",
    description: "Study group management and participation platform",
};

export default function StudyLayout({ children }) {
    return (
        <Suspense fallback={ <Loading /> }>
            {children}
        </Suspense>
    );
}