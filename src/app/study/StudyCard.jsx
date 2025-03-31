import React from 'react';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const StudyCard = ({ title, description, status, reqEnd, icon }) => {
    const router = useRouter();

    const getStatusStyle = (status) => {
        switch (status.toUpperCase()) {
            case 'RECRUITED':
                return 'bg-red-500 text-white';
            case 'CANCELLED':
                return 'bg-green-500 text-white';
            case 'RECRUITING':
                return 'bg-blue-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status.toUpperCase()) {
            case 'RECRUITED':
                return '종료됨';
            case 'CANCELLED':
                return '취소됌';
            case 'RECRUITING':
                return '모집 중';
        }
    };

    console.log(status);

    const handleClick = () => {
        router.push(`/study/detail?title=${title}`);
    };

    return (
        <div
            onClick={handleClick}
            className="bg-[#1f1f1f] p-5 rounded-lg flex justify-between items-center w-full h-[150px] cursor-pointer"
        >
            <div className="w-72 mobile:w-[65vw]">
                <h3 className="text-white text-xl font-bold">{title}</h3>
                <p className="text-white text-sm text-wrap">{description}</p>
                <p className="text-yellow-500 text-[12px] text-wrap">마감: {reqEnd}</p>
            </div>
            <div className="flex items-center space-x-2">
                <Chip className={`capitalize ${getStatusStyle(status)}`} size="sm" variant="flat">
                    {getStatusText(status)}
                </Chip>
                {icon && (
                    <Image src={icon} alt="Study Icon" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                )}
            </div>
        </div>
    );
};

export default StudyCard;