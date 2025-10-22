import MenuHeader from '@/components/ui/common/MenuHeader';
import ApiCodeGuard from '@/components/auth/ApiCodeGuard.jsx';

export const metadata = {
    title: 'CoreAdmin', description: 'Core member application management',
};

export default function CoreAdminLayout({children}) {
    return (<ApiCodeGuard requiredRole="ORGANIZER" nextOverride="/coreadmin">
            <>
                <MenuHeader/>
                {children}
            </>
        </ApiCodeGuard>);
}