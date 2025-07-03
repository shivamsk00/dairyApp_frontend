import React, { useState, useEffect } from 'react';
import { IoEyeOffSharp, IoEyeSharp } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { toast } from 'react-toastify';
import loginImg from "../../assets/login_img.png"
const Register = () => {
    const nav = useNavigate();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', password: '', confirmPassword: '', otp: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(600);

    const register_sendOtp = useAuthStore(state => state.register_sendOtp);
    const register_otpVerify = useAuthStore(state => state.register_otpVerify);
    const loading = useAuthStore(state => state.loading);

    useEffect(() => {
        let interval;
        if (otpSent && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const formatTime = (seconds) => `${Math.floor(seconds / 60)}m ${seconds % 60 < 10 ? '0' : ''}${seconds % 60}s`;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        const { name, phone, email, password, confirmPassword, otp } = formData;

        if (!name.trim()) newErrors.name = 'Name is required.';
        if (!/^[0-9]{10}$/.test(phone)) newErrors.phone = 'Phone must be 10 digits.';
        if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email.';
        if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 chars.';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        if (otpSent && !otp.trim()) newErrors.otp = 'OTP is required.';

        return newErrors;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) return setErrors(formErrors);

        const otpPayload = {
            name: formData.name,
            email: formData.email,
            mobile: formData.phone,
            password: formData.confirmPassword
        };
        const res = await register_sendOtp(otpPayload);
        if (res?.status_code === 200) {
            setOtpSent(true);
            setTimer(600);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length > 0) return setErrors(formErrors);

        const registerPayload = {
            ...formData,
            mobile: formData.phone
        };
        const res = await register_otpVerify(registerPayload);
        if (res?.status_code === 200) {
            toast.success(res.message);
            nav('/login');
        } else {
            toast.error(res?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col gap-6 items-center justify-center bg-gradient-to-r from-orange-100 to-orange-400 px-4 py-8">
            <h1 className='font-bold text-3xl text-orange-500'>Welcome Dairy Software</h1>
            <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden flex flex-col lg:flex-row">
                {/* Left Side Illustration */}
                <div className="hidden lg:flex w-full lg:w-1/2 bg-slate-900 justify-center items-center p-6 relative">
                    <div className="text-white text-center">
                        <img src={loginImg} alt="illustration" className="w-4/5 mx-auto" />
                        <p className="mt-4 text-lg">Start your journey with us today!</p>
                    </div>
                </div>

                {/* Right Side Register Form */}
                <div className="w-full lg:w-1/2 p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
                    <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="space-y-4">
                        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}

                        <input type="text" name="phone" placeholder="Phone" maxLength={10} value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}

                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}

                        <div className="relative">
                            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
                            </span>
                        </div>
                        {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}

                        {otpSent && (
                            <>
                                <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.otp && <p className="text-red-600 text-sm">{errors.otp}</p>}
                                <p className="text-sm text-gray-600">{timer > 0 ? `OTP valid for: ${formatTime(timer)}` : 'OTP expired, please resend.'}</p>
                            </>
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-200">
                            {loading ? 'Please wait...' : (otpSent ? 'Register' : 'Send OTP')}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <span className="text-gray-600">Already have an account?</span>{' '}
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
