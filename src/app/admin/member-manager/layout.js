import MenuHeader from '@/components/ui/common/MenuHeader';
import ApiCodeGuard from '@/components/auth/ApiCodeGuard';

export const metadata = {
    title: "Member Manager", description: "Admin management platform",
};

export default function AdminLayout({children}) {
    return (<ApiCodeGuard requiredRole="LEAD" requiredTeam="HR" nextOverride="/admin/member-manager">
        <>
            <MenuHeader/>
            {children}
        </>
    </ApiCodeGuard>);
}
