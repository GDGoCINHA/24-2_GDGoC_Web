'use client';

export default function NoticeBanner() {
    return (
        <div className="bg-gray-900 p-6 rounded-md mb-6">
            <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                    <h3 className="font-medium mb-2">모집 관련 주의사항</h3>
                    <ul className="space-y-1 text-sm">
                        <li>• 모집 마감일 다음 날까지는 자유롭게 합/불 체크가 가능합니다.</li>
                        <li>• 마감일 이전에는 최종 결정 및 마감 버튼으로 조기 마감이 가능합니다.</li>
                        <li>• 모집 마감일 하루 뒤 자정에는 자동으로 마지막으로 체크한 합/불 결과가 반영됩니다.</li>
                        <li>• 지원자는 MY 스터디 참여 현황에서 모집 마감 시간 하루 뒤 합격여부 조회가 가능합니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}