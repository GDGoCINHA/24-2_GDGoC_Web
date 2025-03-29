'use client';

import React, { useEffect, useState } from 'react';
import {
    Spinner,
    Button
} from '@nextui-org/react';
import Header from './Header';
import StudyCard from './StudyPanel';
import { IoAdd } from 'react-icons/io5';
import studyData from './studyData'; // Import the studyData.js

export default function Page() {
    const [isLoading, setIsLoading] = useState(true); // Start with loading state
    const [studyContent, setStudyContent] = useState([]); // Empty state for studyContent
    const [courseType, setCourseType] = useState('official'); // Default to 'official' for "정규"

    useEffect(() => {
        // Mimic loading delay
        setTimeout(() => {
            setStudyContent(studyData.studyCards); // Set the studyData after the delay
            setIsLoading(false); // Stop the loading spinner
        }, 1000); // Simulate delay
    }, []);

    // Function to handle course type selection
    const handleCourseTypeChange = (type) => {
        setCourseType(type);
    };

    // Function to filter study content based on course type
    const filteredStudyContent = courseType
        ? studyContent.filter((study) => study.course === courseType)
        : studyContent;

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen'>
                    <Spinner />
                </div>
            ) : (
                <div>
                    {/* Header */}
                    <Header />
                    <header className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px]">
                        <h1 className="text-white text-left">
                            GDSC Inha에서는 높은 수준의 멤버들과
                        </h1>
                        <h1 className="text-white text-left">
                            다양한 스터디를 진행하고 있습니다(예시)
                        </h1>
                    </header>

                    {/* Course Type Selection */}
                    <div className="relative flex flex-col select-none pt-[35px] px-[96px] mobile:px-[24px]">
                        <p className="text-white text-right pt-[3px]">
                            <span
                                className={courseType === 'official' ? 'font-bold' : ''}
                                onClick={() => handleCourseTypeChange('official')}
                                style={{ cursor: 'pointer' }}
                            >
                                정규
                            </span>
                            {" | "}
                            <span
                                className={courseType === 'personal' ? 'font-bold' : ''}
                                onClick={() => handleCourseTypeChange('personal')}
                                style={{ cursor: 'pointer' }}
                            >
                                개인개설
                            </span>
                        </p>
                    </div>

                    <div className="relative flex justify-center items-center space-y-4 mobile:px-[24px]">
                        {/* Study Cards */}
                        <div className="w-full max-w-4xl">
                            {filteredStudyContent.map((study, index) => (
                                <div key={index} className="m-auto mt-5">
                                    <h2 className="text-white font-bold text-left">{study.title}</h2>
                                    <p className="text-white text-left">{study.description}</p>

                                    {/* Study Card Area */}
                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {study.studyCards.map((card, cardIndex) => (
                                            <StudyCard
                                                key={cardIndex}
                                                title={card.title}
                                                description={card.description}
                                                status={card.status}
                                                icon={card.icon}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Create New Study */}
                    <div className="fixed bottom-6 right-6">
                        <Button
                            auto
                            color="danger"
                            iconRight={<IoAdd size={24} />}
                            className="rounded-full p-0 shadow-lg flex items-center justify-center w-14 h-14"
                        >
                            <img
                                src="/src/images/google_icon.png"
                                alt="icon"
                                className="w-8 h-8 object-contain"
                            />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}