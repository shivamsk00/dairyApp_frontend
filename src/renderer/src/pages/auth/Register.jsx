import React, { useState, useEffect } from 'react';
import { IoEyeOffSharp, IoEyeSharp } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { toast } from 'react-toastify';

const Register = () => {
    const nav = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const register_sendOtp = useAuthStore(state => state.register_sendOtp)
    const register_otpVerify = useAuthStore(state => state.register_otpVerify)
    const loading = useAuthStore(state => state.loading)

    useEffect(() => {
        let interval;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}m ${sec < 10 ? '0' : ''}${sec}s`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        const { name, phone, email, password, confirmPassword, otp } = formData;

        if (!name.trim()) newErrors.name = 'Name is required.';
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required.';
        } else if (!/^\d{10}$/.test(phone)) {
            newErrors.phone = 'Phone number must be 10 digits.';
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        if (otpSent && !otp.trim()) {
            newErrors.otp = 'Please enter the OTP sent to your phone.';
        }

        return newErrors;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const otpGetData = {
            "name": formData.name,
            "email": formData.email,
            "mobile": formData.phone,
            "password": formData.confirmPassword
        }

        const res = await register_sendOtp(otpGetData);
        console.log("otp data response", res)



        // Simulate OTP sent
        console.log('OTP sent to:', formData.phone);
        setOtpSent(true);
        setTimer(600);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const createAdminData = {
            "name": formData.name,
            "email": formData.email,
            "mobile": formData.phone,
            "password": formData.confirmPassword,
            "otp": formData.otp
        }
        try {
            const res = await register_otpVerify(createAdminData)
            console.log("create admin successfully", res)
            if (res.status_code == 200) {
                toast(res.message, {
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
            toast(error, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'error'

            });
        }

        // TODO: API call to register
    };







    return (
        <div className="authContainer">
            <div className="w-full sm:w-1/2 lg:w-2/5 xl:w-1/3 p-6 bg-white shadow-md rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

                <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            maxLength={10}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
                        </span>
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                        >
                            {showConfirmPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
                        </span>
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {otpSent && (
                        <div>
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                value={formData.otp}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp}</p>}
                            <p className="text-sm text-gray-600 mt-1">
                                {timer > 0 ? `OTP valid for: ${formatTime(timer)}` : 'OTP expired, please resend.'}
                            </p>
                        </div>
                    )}


                    { }
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full  text-white py-2 px-4 rounded-md  transition duration-200"
                    >
                        {
                            loading ? "Please wait..." : (
                                otpSent ? 'Register' : 'Send OTP'
                            )
                        }

                    </button>
                </form>

                <div className="mt-4 text-center">
                    <span className="text-gray-600">Already have an account?</span>{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
