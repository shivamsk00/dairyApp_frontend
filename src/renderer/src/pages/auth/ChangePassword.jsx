import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { toast } from 'react-toastify';

const ChangePassword = () => {
    const nav = useNavigate();
    const passChange = useAuthStore(state => state.changePassword);

    const [formData, setFormData] = useState({
        email: '',
        old_password: '',
        new_password: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.old_password.trim()) newErrors.old_password = 'Old password is required';
        if (!formData.new_password.trim()) newErrors.new_password = 'New password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const res = await passChange(formData);
        if (res.status_code === 200) {
            toast.success(res.message, {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });
            setFormData({ email: '', old_password: '', new_password: '' });
            nav("/");
        } else if (res.status_code === 400) {
            toast.error(res.message, {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });
        }
    };

    return (
        <div className="p-6   bg-white rounded-lg shadow-md mt-6">
            {/* Back Button & Title */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => nav("/")} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <FaArrowLeft />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Old Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                    <input
                        type="password"
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.old_password && <p className="text-red-600 text-sm mt-1">{errors.old_password}</p>}
                </div>

                {/* New Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.new_password && <p className="text-red-600 text-sm mt-1">{errors.new_password}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition"
                    >
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
