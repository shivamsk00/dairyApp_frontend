import React from 'react';

const ToggleButton = ({ label, enabled, onToggle }) => {
    return (
        <div className="flex items-center gap-2">
            <div
                onClick={() => onToggle(!enabled)}
                className={`relative inline-flex cursor-pointer items-center h-6 rounded-full w-11 transition-colors duration-300 ${enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </div>
            {label && <span className='text-white'>{label}</span>}
        </div>
    );
};

export default ToggleButton;