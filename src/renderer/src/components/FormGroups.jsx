// Example usage with classic Windows form styling
import React, { useState } from 'react';
import CustomInput from './CustomInput';
import { FaUser, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';

const ClassicWindowsForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        company: ''
    });

    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    return (
        <div className="p-4 bg-gray-200 min-h-screen font-mono">
            {/* Classic Windows Title Bar [web:263] */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-2 mb-4 
                            border-2 border-t-blue-400 border-l-blue-400 border-r-blue-900 border-b-blue-900">
                <h1 className="text-sm font-bold">User Registration - DairyApp v1.1.2</h1>
            </div>

            {/* Classic Windows Panel [web:247] */}
            <div className="bg-gray-200 border-2 border-t-gray-400 border-l-gray-400 
                            border-r-gray-600 border-b-gray-600 p-6 max-w-2xl">

                <h2 className="text-lg font-bold text-black mb-6 font-mono">Enter User Information:</h2>

                <div className="space-y-6">
                    {/* Username Field */}
                    <CustomInput
                        label="User Name:"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange('username')}
                        icon={<FaUser />}
                        required
                        clearable
                        variant="default"
                        size="md"
                        maxLength={20}
                    />

                    {/* Email Field */}
                    <CustomInput
                        label="E-mail Address:"
                        type="email"
                        placeholder="user@company.com"
                        value={formData.email}
                        onChange={handleChange('email')}
                        icon={<FaEnvelope />}
                        required
                        variant="sunken"
                        helperText="Enter a valid email address for notifications"
                    />

                    {/* Password Field */}
                    <CustomInput
                        label="Password:"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange('password')}
                        icon={<FaLock />}
                        required
                        variant="default"
                        maxLength={16}
                        helperText="Password must be 8-16 characters"
                    />

                    {/* Company Field */}
                    <CustomInput
                        label="Company Name:"
                        placeholder="Enter company name"
                        value={formData.company}
                        onChange={handleChange('company')}
                        icon={<FaBuilding />}
                        variant="raised"
                        clearable
                    />
                </div>

                {/* Classic Windows Buttons [web:263] */}
                <div className="flex space-x-4 mt-8">
                    <button className="px-6 py-2 bg-gray-200 border-2 border-t-gray-200 border-l-gray-200 
                                     border-r-gray-600 border-b-gray-600 hover:bg-gray-300 
                                     active:border-t-gray-600 active:border-l-gray-600 
                                     active:border-r-gray-200 active:border-b-gray-200 
                                     font-mono text-black text-sm">
                        OK
                    </button>

                    <button className="px-6 py-2 bg-gray-200 border-2 border-t-gray-200 border-l-gray-200 
                                     border-r-gray-600 border-b-gray-600 hover:bg-gray-300 
                                     active:border-t-gray-600 active:border-l-gray-600 
                                     active:border-r-gray-200 active:border-b-gray-200 
                                     font-mono text-black text-sm">
                        Cancel
                    </button>

                    <button className="px-6 py-2 bg-gray-200 border-2 border-t-gray-200 border-l-gray-200 
                                     border-r-gray-600 border-b-gray-600 hover:bg-gray-300 
                                     active:border-t-gray-600 active:border-l-gray-600 
                                     active:border-r-gray-200 active:border-b-gray-200 
                                     font-mono text-black text-sm">
                        Help
                    </button>
                </div>
            </div>

            {/* Status Bar [web:247] */}
            <div className="mt-4 bg-gray-200 border-2 border-t-gray-600 border-l-gray-600 
                            border-r-gray-200 border-b-gray-200 p-2 text-xs font-mono text-black">
                Ready | Caps Lock | Num Lock | 9:18 PM
            </div>
        </div>
    );
};

export default ClassicWindowsForm;
