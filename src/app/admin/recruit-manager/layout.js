import MenuHeader from '@/components/ui/common/MenuHeader';
import ApiCodeGuard from '@/components/auth/ApiCodeGuard.jsx';

export const metadata = {
    title: "Recruit Manager", description: "Admin management and participation platform",
};

export default function AdminLayout({children}) {
    return (<ApiCodeGuard requiredRole="LEAD" requiredTeam="HR" nextOverride="/admin/recruit-manager">
            <>
                <MenuHeader/>
                {children}
            </>
        </ApiCodeGuard>);
}