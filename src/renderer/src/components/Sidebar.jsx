import React, { useEffect, useState } from 'react';
import useToggleStore from '../zustand/useToggleStore';
import { MdOutlineDashboard } from 'react-icons/md';
import { FaChartBar, FaDatabase, FaFileAlt, FaRupeeSign, FaUser, FaChevronDown } from 'react-icons/fa';
import { GiHeavyCollar } from 'react-icons/gi';
import { FaArrowTrendUp, FaGear, FaMoneyBillTrendUp } from 'react-icons/fa6';
import { NavLink, useLocation } from 'react-router-dom';
import dairyLogo from "../assets/dairyLogo.png";
import { TbReceiptRupee } from 'react-icons/tb';

const Sidbar = () => {
  const [isSecondWindowOpen, setIsSecondWindowOpen] = useState(false);
  const [isCustomerCollectionOpen, setIsCustomerCollectionOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const isMenu = useToggleStore(state => state.isMenu);
  const location = useLocation();

  const [version, setVersion] = useState('')

  useEffect(() => {
    window.api.getAppVersion().then(setVersion)
    console.log("App Version:", version);
  }, [version]);

  useEffect(() => {
    window.api?.onSecondWindowClosed?.(() => {
      setIsSecondWindowOpen(false);
      setActiveItem(null);
    });
    window.api?.onCutomerWindowClosed?.(() => {
      setIsCustomerCollectionOpen(false);
      setActiveItem(null);
    });

    // Auto open submenu if route matches
    if (
      location.pathname.startsWith('/subscribe') ||
      location.pathname.startsWith('/subscribe-history')
    ) {
      setIsSubMenuOpen(true);
    }
  }, [location.pathname]);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 rounded-md transition-colors 
     ${isActive ? 'bg-slate-700 text-white' : 'text-gray-200 hover:bg-slate-700 hover:text-white'}`;

  return (
    <div className="bg-slate-800 text-white w-72 h-screen flex flex-col shadow-lg overflow-y-auto">
      <div className="p-4 bg-slate-800 flex justify-center">
        {/* <img src={dairyLogo} alt="Logo" className="h-14 object-contain" /> */}
        <h1 className='text-xl font-bold'>सरस डेयरी</h1>
      </div>

      <ul className="flex-1 overflow-y-auto p-2 space-y-1">
        <NavLink to="/" className={linkClasses}>
          <MdOutlineDashboard /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/customer" className={linkClasses}>
          <FaUser /> <span>Customers</span>
        </NavLink>

        <li
          className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all cursor-pointer ${activeItem === 'milk-collection'
            ? 'bg-slate-700 text-white cursor-not-allowed opacity-50'
            : 'text-gray-200 hover:bg-slate-700 hover:text-white'
            }`}
          onClick={() => {
            if (isSecondWindowOpen) return;
            window.api.openSecondWindow();
            setIsSecondWindowOpen(true);
            setActiveItem('milk-collection');
          }}
        >
          <GiHeavyCollar /> <span>Milk Collection</span>
        </li>

        <NavLink to="/alldairymaster" className={linkClasses}>
          <FaMoneyBillTrendUp /> <span>Head Dairy Master</span>
        </NavLink>

        <NavLink to="/milkDispatch" className={linkClasses}>
          <FaMoneyBillTrendUp /> <span>Milk Dispatch</span>
        </NavLink>

        <NavLink to="/dailyMilkSale" className={linkClasses}>
          <FaArrowTrendUp /> <span>Open Milk Sale</span>
        </NavLink>

        <NavLink to="/ratechart" className={linkClasses}>
          <FaChartBar /> <span>Rate Chart</span>
        </NavLink>

        <NavLink to="/snfchart" className={linkClasses}>
          <FaChartBar /> <span>SNF Chart</span>
        </NavLink>

        <NavLink to="/paymentregister" className={linkClasses}>
          <FaRupeeSign /> <span>Payments Register</span>
        </NavLink>

        <NavLink to="/reports" className={linkClasses}>
          <FaFileAlt /> <span>Reports</span>
        </NavLink>

        <NavLink to="/inventory" className={linkClasses}>
          <FaDatabase /> <span>Inventory</span>
        </NavLink>

        <li
          className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all cursor-pointer ${activeItem === 'customer-collection'
            ? 'bg-slate-700 text-white cursor-not-allowed opacity-50'
            : 'text-gray-200 hover:bg-slate-700 hover:text-white'
            }`}
          onClick={() => {
            if (isCustomerCollectionOpen) return;
            window.api.openCusomerWindow();
            setIsCustomerCollectionOpen(true);
            setActiveItem('customer-collection');
          }}
        >
          <GiHeavyCollar /> <span>Products Sold</span>
        </li>

        {/* Subscription Dropdown */}
        {/* <li>
          <div
            onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            className={`flex items-center justify-between px-4 py-3 rounded-md cursor-pointer transition-colors ${
              location.pathname.startsWith('/subscribe') || location.pathname.startsWith('/subscribe-history')
                ? 'bg-slate-700 text-white'
                : 'text-gray-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <TbReceiptRupee /> <span>Subscription</span>
            </span>
            <FaChevronDown
              className={`transition-transform duration-300 ${
                isSubMenuOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>

          {isSubMenuOpen && (
            <ul className="ml-8 mt-1 space-y-1 text-sm">
              <NavLink
                to="/subscribe"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                Subscription Plans
              </NavLink>
              <NavLink
                to="/subscribe-history"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                Subscription History
              </NavLink>
            </ul>
          )}
        </li> */}

        <NavLink to="/settings" className={linkClasses}>
          <FaGear /> <span>Settings</span>
        </NavLink>
      </ul>

      <div className="p-4 bg-slate-800 text-center text-sm">
        <p>Version {version}</p>
        <p>© 2025 | Powered by Production House </p>
      </div>
    </div>
  );
};

export default Sidbar;
