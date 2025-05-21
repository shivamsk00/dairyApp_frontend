import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './auth.css'; // keeps your background styling
import useAuthStore from '../../zustand/useAuthStore';

const ForgotPasswordPage = () => {
    const saveEmail = localStorage.getItem('rememberEmail')
    const nav = useNavigate()
    const [email, setEmail] = useState(saveEmail);
    const [error, setError] = useState('');
    const sendOtpForgotPassword = useAuthStore(state => state.sendOtpForgotPassword)
    const loading = useAuthStore(state => state.loading)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        try {
            const res = await sendOtpForgotPassword({ email });
            console.log("response forgot pass", res)
            if (res.status_code == 200) {
                // await axios.post('/forgot-password', { email });
                toast.success(res.message);
                setEmail('');
                nav("/set_forgot_password", { state: { email, res_otp: res.otp } });
            }

        } catch (err) {
            toast.error({
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
    };

    return (
        <div className="authContainer">
            <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="mb-4">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full  text-white font-medium py-3 rounded-lg transition duration-200"
                        >
                            {loading ? "Please wait..." : "Send OTP"}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
