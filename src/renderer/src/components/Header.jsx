import React, { useState } from 'react'
import useToggleStore from '../zustand/useToggleStore'
import { FaSearch } from 'react-icons/fa'


const Header = () => {
    const { menuToggle } = useToggleStore()
    const [isToggleMenu, setIsToggleMenu] = useState(false)
    const handleToggleMenu = () => {
        setIsToggleMenu(!isToggleMenu)
        menuToggle(isToggleMenu)
    }
    return (
        <div className='headerContainer'>
            <div className="searchBox">
                <FaSearch />
                <input type='search' placeholder='search..' />
            </div>
            <div className="userProfile">
                
            </div>
        </div>
    )
}

export default Header