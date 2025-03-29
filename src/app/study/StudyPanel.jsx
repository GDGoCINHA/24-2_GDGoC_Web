import React from 'react';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const StudyCard = ({ title, description, status = 'unknown', icon }) => {
    const router = useRouter();

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-red-500 text-white';
            case 'in-progress':
                return 'bg-green-500 text-white';
            case 'pending':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-blue-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '종료됌';
            case 'in-progress':
                return '진행중';
            case 'pending':
                return '대기중';
            default:
                return '모집중';
        }
    };

    const handleClick = () => {
        router.push(`./studyDetail?title=${encodeURIComponent(title)}`);
    };

    return (
        <div
            onClick={handleClick}
            className="bg-[#1f1f1f] p-5 rounded-lg flex justify-between items-center w-full max-w-md cursor-pointer"
        >
            <div className="max-w-[250px] mobile:w-[45vw]">
                <h3 className="text-white font-bold">{title}</h3>
                <p className="text-white text-sm w-100 text-wrap">{description}</p>
            </div>
            <div className="flex items-center space-x-4">
                <Chip className={`capitalize ${getStatusStyle(status)} `} size="sm" variant="flat">
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