'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../Header';

const StudyDetailPage = () => {
    const router = useRouter();
    const [studyTitle, setStudyTitle] = useState('');
    const [studyDetails, setStudyDetails] = useState(null); // You can replace this with the actual data fetching logic

    useEffect(() => {
        // Check if query parameters are available
        const { searchParams } = router.query || {};

        console.log(searchParams);

        if (searchParams?.title) {
            setStudyTitle(decodeURIComponent(searchParams.title));
            // Fetch details based on the title or use static data for now
            // For example: fetchStudyDetails(searchParams.title);
        }
    }, [router.query]); // Listen to changes in router.query

    const fetchStudyDetails = async (title) => {
        // Example of a fetch request to get study details
        // Replace with your API logic
        const response = await fetch(`/api/studyDetails?title=${title}`);
        const data = await response.json();
        setStudyDetails(data);
    };

    return (
        <div>
            <Header />
            <div className="pt-20 px-24 mobile:px-6">
                <h1 className="text-white text-3xl font-bold">{studyTitle}</h1>

                {studyDetails ? (
                    <div className="mt-6 text-white">
                        <p>{studyDetails.description}</p>
                        <p>Status: {studyDetails.status}</p>
                        <p>Start Date: {studyDetails.startDate}</p>
                        <p>End Date: {studyDetails.endDate}</p>
                    </div>
                ) : (
                    <div className="mt-6 text-white">Loading study details...</div>
                )}
            </div>
        </div>
    );
};

export default StudyDetailPage;