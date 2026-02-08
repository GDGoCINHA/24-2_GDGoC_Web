import MenuHeader from "@/components/ui/common/MenuHeader";
import ApiCodeGuard from "@/components/auth/ApiCodeGuard";

export const metadata = {
    title: "Manitto Admin", description: "GDGoC INHA Manitto Management",
};

export default function ManittoAdminLayout({children}) {
    return (<ApiCodeGuard requiredRole="CORE" requiredTeam="HR" nextOverride="/manitto/admin">
        <>
            <MenuHeader/>
            {children}
        </>
    </ApiCodeGuard>);
}
