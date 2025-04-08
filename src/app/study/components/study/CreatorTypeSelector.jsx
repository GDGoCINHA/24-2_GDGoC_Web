import React from 'react';

export default function CreatorTypeSelector({ creatorType, onChange }) {
    return (
        <div className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px] mobile:mt-14">
            <p className="text-white text-right pt-[3px]">
                <span
                    className={`cursor-pointer ${creatorType === 'GDGOC' ? 'font-bold' : ''}`}
                    onClick={() => onChange('GDGOC')}
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