import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { Eye, EyeOff, Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import CustomToast from '../../helper/costomeToast';
import loginImg from "../../assets/login_img.png"

import { clearAllCustomersFromDB } from '../../helper/db';

const Login = () => {
    const nav = useNavigate();
    const loginToStore = useAuthStore(state => state.login);
    const loading = useAuthStore(state => state.loading);
    const [showPassword, setShowPassword] = useState(false);
    const [loginState, setLoginState] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({ email: '', password: '' });

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberEmail');
        if (savedEmail) {
            setLoginState(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
        }
    }, []);

    const [version, setVersion] = useState('');

    useEffect(() => {
        window.api?.getAppVersion?.().then(setVersion);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (type !== 'checkbox') {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!loginState.email.trim()) newErrors.email = 'Email is required';
        if (!loginState.password.trim()) newErrors.password = 'Password is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (loginState.rememberMe) {
            localStorage.setItem('rememberEmail', loginState.email);
        } else {
            localStorage.removeItem('rememberEmail');
        }

        const res = await loginToStore({ email: loginState.email, password: loginState.password });
        if (res.status_code == 200) {
            // Safety clear to ensure fresh sync for the new admin
            await clearAllCustomersFromDB();
            CustomToast.success(res.message);
            nav('/');
        } else {
            CustomToast.error(res.message);
        }
    };


    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
            
            <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white flex flex-col md:flex-row min-h-[600px] z-10">
                
                {/* Left Illustration Section */}
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <ShieldCheck className="text-white" size={24} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Apni Dairy</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                            Streamline Your <br />
                            <span className="text-blue-200">Dairy Operations</span>
                        </h1>
                        <p className="text-indigo-100 text-lg max-w-md">
                            Manage milk collection, payments, and inventory with the most advanced dairy management software.
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <img
                            src={loginImg}
                            alt="Login Illustration"
                            className="w-full max-w-[280px] mx-auto drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                </div>

                {/* Right Login Form */}
                <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                        <p className="text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    name="email"
                                    value={loginState.email}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 focus:bg-white text-gray-900 placeholder:text-gray-400`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
                                {/* <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                    Forgot password?
                                </button> */}
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    name="password"
                                    value={loginState.password}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 focus:bg-white text-gray-900 placeholder:text-gray-400`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Additional Options */}
                        <div className="flex items-center justify-between py-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        id="rememberMe"
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={loginState.rememberMe}
                                        onChange={handleChange}
                                        className="peer hidden"
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200"></div>
                                    <svg 
                                        className="absolute left-1 top-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor" 
                                        strokeWidth="4"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember this device</span>
                            </label>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2 group mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 flex flex-col items-center">
                        <p className="text-gray-400 text-xs tracking-wider uppercase font-bold mb-4">Powered by</p>
                        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-[10px] font-black text-gray-600">PH</span>
                            </div>
                            <span className="text-sm font-bold text-gray-600">Production House</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer rights */}
            <div className="absolute bottom-6 text-gray-400 text-[10px] font-medium tracking-widest uppercase">
                &copy; {new Date().getFullYear()} All rights reserved. Version {version}
            </div>

        </div>
    );
};

export default Login;

