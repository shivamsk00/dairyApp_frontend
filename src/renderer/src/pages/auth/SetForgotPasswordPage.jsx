import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './auth.css';
import { useLocation, useNavigate } from 'react-router-dom';

const SetForgotPasswordPage = () => {
    const location = useLocation();
    const email = location.state?.email;
    console.log("email", email)
    const [otp, setOtp] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleVerifyOtp = (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            setErrors({ otp: 'OTP is required' });
            return;
        }

        // Simulate verification (replace with API call)
        if (otp) {
            setIsOtpVerified(true);
            setErrors({});
        } else {
            toast.error('Invalid OTP');
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!passwords.newPassword.trim()) newErrors.newPassword = 'New password is required';
        if (!passwords.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
        if (passwords.newPassword !== passwords.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Simulate password reset (replace with API call)
        toast.success('Password has been successfully updated');
    };

    return (
        <div className="authContainer">
            <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>

                {!isOtpVerified ? (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value);
                                    setErrors({});
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
                        >
                            Verify OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSetPassword}>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, newPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition duration-200"
                        >
                            Set New Password
                        </button>
                    </form>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-blue-600 hover:underline text-sm">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SetForgotPasswordPage;
