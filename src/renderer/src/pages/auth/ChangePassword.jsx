import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/useAuthStore';
import { toast } from 'react-toastify';

const ChangePassword = () => {
    const nav = useNavigate();
      const saveEmail = localStorage.getItem('rememberEmail')
    const passChange = useAuthStore(state => state.changePassword)

    const [formData, setFormData] = useState({
        email: '',
        old_password: '',
        new_password: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.old_password.trim()) newErrors.old_password = 'Old password is required';
        if (!formData.new_password.trim()) newErrors.new_password = 'New password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 🛠️ Here you'd call your API to change password
        console.log('Change Password Request:', formData);
        const res = await passChange(formData)
        console.log("response======>", res)

        if (res.status_code == 200) {

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
            setFormData({ email: '', old_password: '', new_password: '' });
            nav("/")
        } else if (res.status_code == 400) {
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


    };

    return (
        <div className="changePasswordContainer">
            <div className="flex justify-start items-center mb-4 gap-3">
                <button onClick={() => nav("/")} className="addUserBackBtn">
                    <FaArrowLeft />
                </button>
                <h2 className="text-2xl font-bold">Change Password</h2>
            </div>

            <form className="shadow-md rounded-md p-8" onSubmit={handleSubmit}>
                <div className="changePasswordInputBox">
                    <label>Enter Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="errorText">{errors.email}</p>}
                </div>

                <div className="changePasswordInputBox">
                    <label>Enter Old Password</label>
                    <input
                        type="password"
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                    />
                    {errors.old_password && <p className="errorText">{errors.old_password}</p>}
                </div>

                <div className="changePasswordInputBox">
                    <label>Enter New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                    />
                    {errors.new_password && <p className="errorText">{errors.new_password}</p>}
                </div>

                <div className="changePasswordBtnBox">
                    <button type="submit" className="p-2 rounded-md text-white text-sm">
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
