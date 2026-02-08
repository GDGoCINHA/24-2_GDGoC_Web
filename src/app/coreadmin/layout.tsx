import MenuHeader from '@/components/ui/common/MenuHeader';
import ApiCodeGuard from '@/components/auth/ApiCodeGuard';

export const metadata = {
    title: 'CoreAdmin', description: 'Core member application management',
};

export default function CoreAdminLayout({children}) {
    return (<ApiCodeGuard requiredRole="LEAD" nextOverride="/coreadmin">
            <>
                <MenuHeader/>
                {children}
            </>
        </ApiCodeGuard>);
}
