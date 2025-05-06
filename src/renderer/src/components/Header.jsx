import React, { useState } from 'react'
import useToggleStore from '../zustand/useToggleStore'
import { FaSearch } from 'react-icons/fa'

import profile from "../assets/profile.png"
import useAuthStore from '../zustand/useAuthStore'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const [isToggleMenu, setIsToggleMenu] = useState(false)
    const logout = useAuthStore(state => state.logout)
    const loading = useAuthStore(state => state.loading)
    const nav = useNavigate()


    const handleLogout = async () => {
        const res = await logout()
        console.log("------>", res)

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
        }
    }


    return (
        <div className='headerContainer'>
            <div className="searchBox">
                <FaSearch />
                <input type='search' placeholder='search..' />
            </div>
            <div className="userProfile" >
                <div className="headerProfileBox" onClick={() => setIsToggleMenu(!isToggleMenu)}>
                    <img src={profile} alt="" />
                </div>
                <div className={isToggleMenu ? `profileCard active flex flex-col  p-5 bg-white shadow-lg gap-3 border` : `profileCard flex flex-col  p-5 bg-white shadow-lg gap-3 border`}>
                    <button onClick={() => {
                        nav("/changePassword")
                        setIsToggleMenu(false)
                    }} className='px-2 py-2 text-white rounded-md text-sm'>Change password</button>
                    <button onClick={handleLogout} className='bg-red-600 text-white px-2 py-1 rounded-md text-sm'>{
                        loading ? "Please wait..." : "Log out"
                    } </button>
                </div>


            </div>
        </div>
    )
}

export default Header