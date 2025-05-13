//import { Suspense } from "react";
import MenuHeader from "@/components/ui/common/MenuHeader";

export const metadata = {
    title: "Home",
    description: "Home management and participation platform",
};

export default function HomeLayout({ children }) {
    return (
        <>
            <MenuHeader />
            {children}
        </>
    );
}