//import { Suspense } from "react";
import Header from "@/components/ui/common/Header";

export const metadata = {
    title: "SignUp",
    description: "SignUp to your account",
};

export default function SignUpLayout({ children }) {
    return (
        <>
            <Header />
            {children}
        </>
    );
}