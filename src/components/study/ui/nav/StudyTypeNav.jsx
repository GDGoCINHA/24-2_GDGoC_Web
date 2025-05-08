export default function StudyTypeNav({ creatorType, onChange }) {
    return (
        <div className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:mt-14">
            <p className="text-white text-right pt-[3px]">
                <span
                    className={`cursor-pointer ${creatorType === 'GDGOC' ? 'font-bold' : ''}`}
                    //onClick={() => onChange('GDGOC')}
                    onClick={() => alert("현재 정규 스터디 신청은 비활성화 되어 있습니다.")}
                >
                    정규
                </span>
                {" | "}
                <span
                    className={`cursor-pointer ${creatorType === 'PERSONAL' ? 'font-bold' : ''}`}
                    onClick={() => onChange('PERSONAL')}
                >
                    개인개설
                </span>
            </p>
        </div>
    );
}