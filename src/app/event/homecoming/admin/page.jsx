import Link from "next/link";

export default function HomecomingAdminPage() {
    const sections = [
        {
            title: "방명록",
            description: "입장 등록 및 워드클라우드 화면",
            href: "/event/homecoming/admin/guestbook",
        },
        {
            title: "럭키드로우",
            description: "당첨자 추첨 및 초기화",
            href: "/event/homecoming/admin/luckydraw",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#ECF4FF] via-white to-[#FDF7FF] text-slate-900 px-4 py-14">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-3 text-center md:text-left">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Homecoming Admin</p>
                    <h1 className="text-3xl font-semibold">GDGoC 홈커밍 운영 콘솔</h1>
                    <p className="text-slate-600">방명록과 럭키드로우를 빠르게 전환해 사용할 수 있습니다.</p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    {sections.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <h2 className="text-2xl font-semibold mb-3 text-slate-900 group-hover:text-cblue transition">{section.title}</h2>
                            <p className="text-slate-600 text-sm mb-6">{section.description}</p>
                            <span className="inline-flex items-center gap-2 text-sm text-cblue group-hover:gap-3">
                                바로가기 →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
