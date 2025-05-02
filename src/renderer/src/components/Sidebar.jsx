import React from 'react'
import useToggleStore from '../zustand/useToggleStore'
import { loginBg, sideBarMenuList } from '../constant/constant'



const Sidbar = () => {
  const isMenu = useToggleStore(state => state.isMenu)
  return (
    <div className={isMenu ? 'sidebarContainer active' : 'sidebarContainer'}>
      <div className='sideBarProfileBox'>
        <div className="profileImgBox">
          <img src={loginBg} alt="" />
        </div>
        <div className="profileDetailsBox">
          <h4>Admin</h4>
          <p>admin@gmail.com </p>
        </div>
      </div>

      <ul className="menuContainer">
        {
          sideBarMenuList.map((list, idx) => {
            return (
              <li className='list' key={idx}>
                {list.icon}
                {list.title}
              </li>
            )
          })
        }
      </ul>



    </div>
  )
}

export default Sidbar