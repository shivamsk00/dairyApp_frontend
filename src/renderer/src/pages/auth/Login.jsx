import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import CustomToast from '../../helper/costomeToast';
import loginImg from "../../assets/login_img.png"

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (type !== 'checkbox') {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLogin = async () => {
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
        if (res.status_code === 200) {
            CustomToast.success(res.message);
            nav('/');
        } else {
            CustomToast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-100 to-orange-400 flex items-center justify-center px-4">
            <form className="w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
                {/* Left Illustration Section */}
                <div className="bg-gray-900 text-white flex flex-col justify-center items-center p-8">
                    <img
                        src={loginImg}
                        alt="Login Illustration"
                        className="w-4/5 max-w-xs mb-6"
                    />
                    <h3 className="text-xl font-semibold text-center">Turn your projects into reality.</h3>
                </div>

                {/* Right Login Form */}
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hi, Welcome to Dairy Software!</h2>

                    {/* Email */}
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            name="email"
                            value={loginState.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="mb-4 relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            name="password"
                            value={loginState.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </span>
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                        <div className="text-right mt-1">
                            <Link to="/forgot_password" className="text-sm text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center mb-4">
                        <input
                            id="rememberMe"
                            type="checkbox"
                            name="rememberMe"
                            checked={loginState.rememberMe}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="rememberMe" className="text-gray-700">Remember me</label>
                    </div>

                    {/* Login Button */}
                    <button
                        disabled={loading}
                        onClick={handleLogin}
                        className="w-full bg-yellow-400 text-white font-semibold py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50 "
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>

                    {/* Register Link */}
                    <div className="text-center mt-4">
                        <span className="text-gray-600">Not registered yet?</span>{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium">
                            Create an Account
                        </Link>
                    </div>

                    <footer className="text-center text-xs text-gray-500 mt-6">@Production House All rights reserved.</footer>
                </div>
            </form>
        </div>
    );
};

export default Login;
