import ApiCodeGuard from "@/components/auth/ApiCodeGuard";

export default function HomecomingAdminLayout({children}) {
    return (
        <ApiCodeGuard requiredRole="ORGANIZER" nextOverride="/event/homecoming/admin">
            {children}
        </ApiCodeGuard>
    );
}
