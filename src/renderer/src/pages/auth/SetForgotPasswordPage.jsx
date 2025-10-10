import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './auth.css';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const SetForgotPasswordPage = () => {
    const nav = useNavigate()
    const location = useLocation();
    const { email, res_otp } = location.state;
    console.log("email", email)
    const changeForgotPassword = useAuthStore(state => state.changeForgotPassword)

    const [otp, setOtp] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleVerifyOtp = (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            setErrors({ otp: 'OTP is required' });
            return;
        }

        // Simulate verification (replace with API call)
        if (otp == res_otp) {
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
        const changePasswordData = {
            "email": email,
            "otp": otp,
            "password": passwords.newPassword,
            "confirm_password": passwords.confirmPassword
        }

        try {
            const res = await changeForgotPassword(changePasswordData);
            if (res.status_code == 200) {
                toast.success(res.message, {

                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'success'


                });
                nav("/login")
            }
        } catch (error) {
            console.log("ERROR IN CHANGE FORGOT PASSWORD ", error)
            toast.success(res.message, {

                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'success'


            });
        }

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

                        <div className="text-center mt-4">
                            <Link to="/forgot_password" className="text-blue-600 hover:underline text-sm block mb-1">
                                Back to Forgot Password
                            </Link>
                            <Link to="/login" className="text-blue-600 hover:underline text-sm">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSetPassword}>
                        {/* New Password */}
                        <div className="mb-4 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, newPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </span>
                            {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4 relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </span>
                            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition duration-200"
                        >
                            Set New Password
                        </button>
                        <div className="text-center mt-4">
                            <Link to="/forgot_password" className="text-blue-600 hover:underline text-sm block mb-1">
                                Back to Forgot Password
                            </Link>
                            <Link to="/login" className="text-blue-600 hover:underline text-sm">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SetForgotPasswordPage;
