import React, { useEffect, useState } from 'react'

const CommonHeader = ({ heading }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // updates every second

        return () => clearInterval(timer); // cleanup on unmount
    }, []);





    const formattedDateTime = currentTime.toLocaleString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
    return (
        <div className="w-full flex items-center justify-between border-b border-gray-200 px-4 py-3 mb-4 bg-blue-950 shadow-sm">
            <h1 className="text-lg sm:text-xl font-semibold text-white">
                {heading}
            </h1>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                <div className="inline-block bg-blue-50 border border-blue-300 text-blue-700 px-4 py-1 rounded-lg shadow-lg text-lg sm:text-sm font-medium tracking-wide">
                    {formattedDateTime}
                </div>
            </div>
        </div>
    )
}

export default CommonHeader