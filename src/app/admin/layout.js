import MenuHeader from '@/components/ui/common/MenuHeader';
import ApiCodeGuard from '@/components/auth/ApiCodeGuard.jsx';

export const metadata = {
    title: "Admin", description: "Admin management and participation platform",
};

export default function AdminLayout({children}) {
    return (<ApiCodeGuard requiredRole="ADMIN" nextOverride="/admin">
            <>
                <MenuHeader/>
                {children}
            </>
        </ApiCodeGuard>);
}