import React, { useEffect, useRef, useState } from 'react';
import useAuthStore from '../zustand/useAuthStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';

const Header = () => {
    const [isToggleMenu, setIsToggleMenu] = useState(false);
    const dropdownRef = useRef(null);
    const logout = useAuthStore(state => state.logout);
    const loading = useAuthStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const nav = useNavigate();

    const handleLogout = async () => {
        const res = await logout();
        if (res.status_code == 200) {
            toast(res.message, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
                type: 'success',
            });
            window.api.logoutCloseAll();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsToggleMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full flex justify-between items-center px-4 sm:px-6 py-3 bg-slate-800 shadow-md relative z-50">
            {/* Search Box - hidden for now */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-md">
                {/* Placeholder for search if needed later */}
            </div>

            {/* Profile Section */}
            <div className="relative" ref={dropdownRef}>
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsToggleMenu(!isToggleMenu)}
                >
                    {/* Hide email on small screens */}
                    <h2 className="hidden sm:flex items-center gap-1 text-sm font-medium text-white">
                        <MdEmail className="text-blue-400" size={20} />
                        {user.email}
                    </h2>

                    {/* Profile Icon */}
                    <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-orange-600 text-white text-lg uppercase">
                        {user?.email?.slice(0, 1) || 'U'}
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isToggleMenu && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-52 bg-white shadow-lg rounded-xl p-3 sm:p-4 border z-50 flex flex-col gap-2">
                        <button
                            onClick={() => {
                                nav('/changePassword');
                                setIsToggleMenu(false);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs sm:text-sm transition"
                        >
                            Change Password
                        </button>

                        <button
                            onClick={() => {
                                localStorage.clear();
                                toast.success('Cleared previous data', {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    theme: 'dark',
                                });
                                setIsToggleMenu(false);
                                nav('login');
                            }}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-xs sm:text-sm transition"
                        >
                            Login Again
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-xs sm:text-sm transition"
                        >
                            {loading ? 'Please wait...' : 'Log out'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
