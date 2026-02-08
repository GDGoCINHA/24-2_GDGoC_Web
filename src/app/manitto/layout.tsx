export const metadata = {
    title: '마니또 확인',
    description: '마니또 매칭 결과를 확인합니다.',
};

export default function ManitoLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col overflow-hidden relative">
            {children}
        </div>
    );
}