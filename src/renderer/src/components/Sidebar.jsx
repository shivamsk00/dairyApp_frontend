import React, { useEffect, useState } from 'react'
import useToggleStore from '../zustand/useToggleStore'
import { loginBg, sideBarMenuList } from '../constant/constant'
import { MdOutlineDashboard } from "react-icons/md";
import { FaChartBar, FaDatabase, FaFileAlt, FaRupeeSign, FaUser } from 'react-icons/fa';
import { GiHeavyCollar } from 'react-icons/gi';
import { FaArrowRightFromBracket, FaArrowTrendUp, FaGear, FaMoneyBillTrendUp } from 'react-icons/fa6';
import { PiFarm, PiFarmFill } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import dairyLogo from "../assets/dairyLogo.png"
import { useLocation } from 'react-router-dom'


const Sidbar = () => {
  const [isSecondWindowOpen, setIsSecondWindowOpen] = useState(false)
  const [isCustomerCollectionOpen, setIsCustomerCollectionOpen] = useState(false)
  const isMenu = useToggleStore(state => state.isMenu)
  const [activeItem, setActiveItem] = useState(null)

  const location = useLocation()

  useEffect(() => {
    window.api?.onSecondWindowClosed?.(() => {
      setIsSecondWindowOpen(false)
      setActiveItem(null)
    })
  }, [])


  useEffect(() => {
    window.api?.onCutomerWindowClosed?.(() => {
      setIsCustomerCollectionOpen(false)
      setActiveItem(null)
    })
  }, [])


  const handleClick = () => {
    window.api.openChildWindow() // 👈 yaha se call karega
  }
  return (
    <div className={'sidebarContainer'}>
      <div className='sideBarProfileBox'>
        <img src={dairyLogo} />
      </div>
      <div className="sidebarListBox">
        <ul className="sidebarList">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <MdOutlineDashboard /><span>Dashboard</span>
          </NavLink>
          {/* <NavLink
            to="/category"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <MdOutlineDashboard /><span>Categories</span>
          </NavLink> */}

          {/* <button className='text-white' onClick={handleClick}>Open child win</button> */}
          {/* <button className='text-white' onClick={() => window.api.openSecondWindow()}>Open Second Window</button> */}

          {/* <NavLink
            // to="/milk-collection"
            onClick={() => window.api.openSecondWindow()}
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >

          </NavLink> */}


          <NavLink
            to="/customer"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaUser /> <span>Customers</span>
          </NavLink>


          <li
            className={activeItem === 'milk-collection' ? 'sidebarListItem active cursor-not-allowed' : 'sidebarListItem cursor-pointer'}
            onClick={() => {
              if (isSecondWindowOpen) return
              window.api.openSecondWindow()
              setIsSecondWindowOpen(true)
              setActiveItem('milk-collection')
            }}
            style={{
              opacity: isSecondWindowOpen ? 0.5 : 1
            }}
          >
            <GiHeavyCollar /> <span>Milk Collection</span>
          </li>
          <li
            className={activeItem === 'customer-collection' ? 'sidebarListItem active cursor-not-allowed' : 'sidebarListItem cursor-pointer'}
            onClick={() => {
              if (isCustomerCollectionOpen) return
              window.api.openCusomerWindow()
              setIsCustomerCollectionOpen(true)
              setActiveItem('customer-collection')
            }}
            style={{
              pointerEvents: isCustomerCollectionOpen ? 'none' : 'cursor',
              opacity: isCustomerCollectionOpen ? 0.5 : 1
            }}
          >
            <GiHeavyCollar /> <span>Customer Collection</span>
          </li>

          <NavLink
            to="/milksales"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaMoneyBillTrendUp /> <span>Milk Dispatch</span>
          </NavLink>

          <NavLink
            to="/suppliers"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaArrowTrendUp /> <span>Open Milk Sale</span>
          </NavLink>

          <NavLink
            to="/ratechart"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaChartBar /> <span>Rate Chart</span>
          </NavLink>

          <NavLink
            to="/snfchart"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaChartBar /> <span>SNF Chart</span>
          </NavLink>

          <NavLink
            to="/ledger"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaRupeeSign /> <span>Payments / Ledger</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaFileAlt /> <span>Reports</span>
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaDatabase /> <span>Inventory</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaGear /> <span>Settings</span>
          </NavLink>

          {/* <NavLink
            to="#"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaArrowRightFromBracket /> <span>Logout</span>
          </NavLink> */}
        </ul>
      </div>





    </div>
  )
}

export default Sidbar