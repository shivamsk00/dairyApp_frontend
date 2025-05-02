import React, { useState } from 'react'
import useToggleStore from '../zustand/useToggleStore'


const Header = () => {
    const { menuToggle} = useToggleStore()
    const [isToggleMenu, setIsToggleMenu] = useState(false)
    const handleToggleMenu = () => {
        setIsToggleMenu(!isToggleMenu)
        menuToggle(isToggleMenu)
    }
    return (
        <div className='headerContainer'>
            <div className="menu">
                <button onClick={handleToggleMenu}>Menu</button>
            </div>
        </div>
    )
}

export default Header