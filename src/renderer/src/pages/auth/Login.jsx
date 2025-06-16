import React, { useState, useEffect } from 'react';
import "./auth.css";
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import CustomToast from '../../helper/costomeToast';

const Login = () => {
    const nav = useNavigate();
    const loginToStore = useAuthStore(state => state.login);
    const loading = useAuthStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const token = useAuthStore(state => state.token);
    const [showPassword, setShowPassword] = useState(false);


    const [loginState, setLoginState] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    // Load saved email from localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberEmail');
        if (savedEmail) {
            setLoginState(prev => ({
                ...prev,
                email: savedEmail,
                rememberMe: true
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginState((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (type !== 'checkbox') {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
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

        const res = await loginToStore({
            email: loginState.email,
            password: loginState.password
        });

        if (res.status_code == 200) {
            CustomToast.success(res.message)
            nav('/');
        } else {
            CustomToast.error(res.message)
        }
    };

    return (
        // <div className="authContainer">
        //     <div className="formContainer">
        //         <h2 className="loginText">Admin Login</h2>

        //         <div className="inputBox">
        //             <input
        //                 type="email"
        //                 placeholder="Enter your email"
        //                 name="email"
        //                 value={loginState.email}
        //                 onChange={handleChange}
        //             />
        //             {errors.email && <p className="errorText">{errors.email}</p>}
        //         </div>

        //         <div className="inputBox">
        //             <div className="passwordInputWrapper" style={{ position: 'relative' }}>
        //                 <input
        //                     type={showPassword ? 'text' : 'password'}
        //                     placeholder="Enter your password"
        //                     name="password"
        //                     value={loginState.password}
        //                     onChange={handleChange}
        //                     style={{ paddingRight: '40px' }}
        //                 />
        //                 <span
        //                     onClick={() => setShowPassword(!showPassword)}
        //                     style={{
        //                         position: 'absolute',
        //                         right: '10px',
        //                         top: '50%',
        //                         transform: 'translateY(-50%)',
        //                         cursor: 'pointer',
        //                         color: '#999'
        //                     }}
        //                 >
        //                     {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        //                 </span>
        //             </div>
        //             {errors.password && <p className="errorText">{errors.password}</p>}
        //             <div style={{ textAlign: 'right', marginTop: '4px' }}>
        //                 <Link to="/forgot_password" className="text-blue-600 hover:underline text-sm">
        //                     Forgot password?
        //                 </Link>
        //             </div>
        //         </div>

        //         <div className="checkBox">
        //             <input
        //                 type="checkbox"
        //                 name="rememberMe"
        //                 checked={loginState.rememberMe}
        //                 onChange={handleChange}
        //             />
        //             <label>Remember me</label>
        //         </div>

        //         <div className="buttonBox">
        //             <button disabled={loading} onClick={handleLogin}>
        //                 {loading ? "Loading..." : "Login"}
        //             </button>
        //         </div>
        //         <div className="mt-4 text-center">
        //             <span className="text-gray-600">Don't have an account?</span>{' '}
        //             <Link to="/register" className="text-blue-600 hover:underline font-medium">
        //                 Register
        //             </Link>
        //         </div>
        //     </div>
        // </div>
<div className="">
 <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 authContainer">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>

                {/* Email Input */}
                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={loginState.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            name="password"
                            value={loginState.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </span>
                    </div>
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
                        type="checkbox"
                        name="rememberMe"
                        checked={loginState.rememberMe}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label className="text-gray-700">Remember me</label>
                </div>

                {/* Login Button */}
                <div className="mb-4">
                    <button
                        disabled={loading}
                        onClick={handleLogin}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>
                </div>

                {/* Register Redirect */}
                <div className="text-center">
                    <span className="text-gray-600">Don't have an account?</span>{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Register
                    </Link>
                </div>
            </div>
        </div>
</div>
       
    );
};

export default Login;
