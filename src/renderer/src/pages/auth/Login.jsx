import React, { useState } from 'react';
import "./auth.css";
import { userInfo } from '../../constant/constant';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';

const Login = () => {
    const navigation = useNavigate()

    const loginToStore = useAuthStore((state) => state.login);
    const [loginState, setLoginState] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginState((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clear error on typing
        setErrors((prev) => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleLogin = () => {
        let newErrors = {};

        if (!loginState.email.trim()) {
            newErrors.email = 'email is required';
        }

        if (!loginState.password.trim()) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }



        // ✅ Proceed to API call or store logic here
        console.log("Logging in with:", loginState);

        if (loginState.email !== userInfo.email || loginState.password !== userInfo.password) return alert("Email or Password is Wrong!!")

        // ✅ Set to Zustand store + localStorage
        loginToStore({ email: loginState.email }, "fakeToken123");

        // ✅ Redirect to home/dashboard
        navigation("/Dashboard", { replace: true });



    };









    return (
        <div className="authContainer">
            <div className="formContainer">
                <h2 className="loginText">Admin Login</h2>

                <div className="inputBox">
                    <input
                        type="email"
                        placeholder="Enter your name"
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

                <div className="buttonBox">
                    <button onClick={handleLogin}>Login</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
