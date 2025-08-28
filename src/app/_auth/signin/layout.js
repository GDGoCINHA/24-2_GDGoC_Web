//import { Suspense } from "react";
import Header2 from '@/components/ui/common/Header2';

export const metadata = {
    title: "SignIn",
    description: "SignIn to your account",
};

export default function SignInLayout({ children }) {
    return (
        <div className='min-h-screen flex flex-col overflow-hidden relative'>
            <Header2 />
            {children}
        </div>
    );
}