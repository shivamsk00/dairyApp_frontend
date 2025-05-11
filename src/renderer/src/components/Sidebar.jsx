import React from 'react'
import useToggleStore from '../zustand/useToggleStore'
import { loginBg, sideBarMenuList } from '../constant/constant'
import { MdOutlineDashboard } from "react-icons/md";
import { FaChartBar, FaDatabase, FaFileAlt, FaRupeeSign, FaUser } from 'react-icons/fa';
import { GiHeavyCollar } from 'react-icons/gi';
import { FaArrowRightFromBracket, FaArrowTrendUp, FaGear, FaMoneyBillTrendUp } from 'react-icons/fa6';
import { PiFarm, PiFarmFill } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import dairyLogo from "../assets/dairyLogo.png"



const Sidbar = () => {
  const isMenu = useToggleStore(state => state.isMenu)
  return (
    <div className={'sidebarContainer '}>
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

          <NavLink
            to="/customer"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaUser /> <span>Customers</span>
          </NavLink>

          <NavLink
            to="/milkcollection"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <GiHeavyCollar /> <span>Milk Collection</span>
          </NavLink>

          <NavLink
            to="/milksales"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaMoneyBillTrendUp /> <span>Milk Sales</span>
          </NavLink>

          <NavLink
            to="/suppliers"
            className={({ isActive }) =>
              isActive ? 'sidebarListItem active' : 'sidebarListItem'
            }
          >
            <FaArrowTrendUp /> <span>Suppliers / Customer</span>
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