import React from 'react';
import { useRouter } from 'next/navigation';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';

export default function StudyCard({ title, description, status, reqEnd, icon }) {
    const router = useRouter();

    const getStatusStyle = (status) => {
        switch (status.toUpperCase()) {
            case 'RECRUITED':
                return 'bg-red-500 text-white';
            case 'RECRUITING':
                return 'bg-green-500 text-white';
            case 'CANCELLED':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-blue-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status.toUpperCase()) {
            case 'RECRUITED':
                return '종료됨';
            case 'RECRUITING':
                return '모집 중';
            case 'CANCELLED':
                return '취소됨';
            default:
                return '준비 중';
        }
    };

    function formatDate(dateString) {
        if (!dateString) return "정보없음";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "정보없음";
        const year = String(date.getFullYear());
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    const handleClick = () => {
        router.push(`/study/detail?title=${encodeURIComponent(title)}`);
    };

    return (
        <div
            onClick={handleClick}
            className="bg-[#1f1f1f] p-5 rounded-lg flex justify-between items-center w-full h-[150px] cursor-pointer"
        >
            <div className="w-72 mobile:w-[65vw]">
                <h3 className="text-white text-xl font-bold">{title}</h3>
                <p className="text-white text-sm text-wrap">{description}</p>
                <p className="text-yellow-500 text-[12px] mt-4 text-wrap">모집마감: {reqEnd ? formatDate(reqEnd) : '정보없음'}</p>
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