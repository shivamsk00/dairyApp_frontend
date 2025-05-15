import React, { useState, useEffect } from 'react';
import "./auth.css";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { toast } from 'react-toastify';

const Login = () => {
    const nav = useNavigate();
    const loginToStore = useAuthStore(state => state.login);
    const loading = useAuthStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const token = useAuthStore(state => state.token);


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

        if (res.status == true) {
            toast(res.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'success'

            });
            nav('/');
        }else if(res.status == false){
            toast(res.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'error'

            });
        }


        console.log("in login page =====>", res)
    };

    return (
        <div className="authContainer">
            <div className="formContainer">
                <h2 className="loginText">Admin Login</h2>

                <div className="inputBox">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={loginState.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="errorText">{errors.email}</p>}
                </div>

                <div className="inputBox">
                    <input
                        type="password"
                        placeholder="Enter your password"
                        name="password"
                        value={loginState.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p className="errorText">{errors.password}</p>}
                </div>

                <div className="checkBox">
                    <input
                        type="checkbox"
                        name="rememberMe"
                        checked={loginState.rememberMe}
                        onChange={handleChange}
                    />
                    <label>Remember me</label>
                </div>

                <div className="buttonBox">
                    <button disabled={loading} onClick={handleLogin}>
                        {loading ? "Loading..." : "Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
