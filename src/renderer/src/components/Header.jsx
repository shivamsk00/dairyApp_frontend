import React, { useEffect, useRef, useState } from 'react';
import useAuthStore from '../zustand/useAuthStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import profile from "../assets/profile.png";

const Header = () => {
    const [isToggleMenu, setIsToggleMenu] = useState(false);
    const dropdownRef = useRef(null);
    const logout = useAuthStore(state => state.logout);
    const loading = useAuthStore(state => state.loading);
    const user = useAuthStore(state => state.user);
    const nav = useNavigate();

    const handleLogout = async () => {
        const res = await logout();
        if (res.status_code === 200) {
            toast(res.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                type: 'success'
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsToggleMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md relative z-50">
            {/* Search Box */}
            <div className="flex items-center gap-2 border px-3 py-1 rounded-md">
                <FaSearch className="text-gray-500" />
                <input
                    type="search"
                    placeholder="Search..."
                    className="outline-none text-sm w-48"
                />
            </div>

            {/* Profile Section */}
            <div className="relative" ref={dropdownRef}>
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsToggleMenu(!isToggleMenu)}
                >
                    <h2 className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <MdEmail className="text-blue-500" size={20} />
                        {user.email}
                    </h2>
                    <img src={profile} alt="Profile" className="w-10 h-10 rounded-full border" />
                </div>

                {/* Dropdown Modal */}
                {isToggleMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-xl p-4 border z-50 flex flex-col gap-3">
                        <button
                            onClick={() => {
                                nav("/changePassword");
                                setIsToggleMenu(false);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition"
                        >
                            Change Password
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm transition"
                        >
                            {loading ? "Please wait..." : "Log out"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
