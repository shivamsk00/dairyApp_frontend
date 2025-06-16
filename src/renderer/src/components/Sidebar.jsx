import React, { useEffect, useState } from 'react';
import useToggleStore from '../zustand/useToggleStore';
import { MdOutlineDashboard } from 'react-icons/md';
import { FaChartBar, FaDatabase, FaFileAlt, FaRupeeSign, FaUser } from 'react-icons/fa';
import { GiHeavyCollar } from 'react-icons/gi';
import { FaArrowTrendUp, FaGear, FaMoneyBillTrendUp } from 'react-icons/fa6';
import { NavLink, useLocation } from 'react-router-dom';
import dairyLogo from "../assets/dairyLogo.png";

const Sidbar = () => {
  const [isSecondWindowOpen, setIsSecondWindowOpen] = useState(false);
  const [isCustomerCollectionOpen, setIsCustomerCollectionOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const isMenu = useToggleStore(state => state.isMenu);
  const location = useLocation();

  useEffect(() => {
    window.api?.onSecondWindowClosed?.(() => {
      setIsSecondWindowOpen(false);
      setActiveItem(null);
    });
    window.api?.onCutomerWindowClosed?.(() => {
      setIsCustomerCollectionOpen(false);
      setActiveItem(null);
    });
  }, []);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 rounded-md transition-colors 
     ${isActive ? 'bg-indigo-100 text-black' : 'text-gray-200 hover:bg-indigo-100 hover:text-black'}`;

  return (
    <div className="bg-slate-800 text-white w-64 min-h-screen flex flex-col shadow-lg">
      <div className="p-4 bg-slate-800 flex justify-center">
        {/* <img src={dairyLogo} alt="Logo" className="h-14 object-contain" /> */}
        <h1 className='text-xl font-bold'>सरस डेयरी </h1>
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
              ? 'bg-indigo-100 text-black cursor-not-allowed opacity-50'
              : 'text-gray-200 hover:bg-indigo-100 hover:text-black'
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
              ? 'bg-indigo-100 text-black cursor-not-allowed opacity-50'
              : 'text-gray-200 hover:bg-indigo-100 hover:text-black'
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

        <NavLink to="/settings" className={linkClasses}>
          <FaGear /> <span>Settings</span>
        </NavLink>
      </ul>

      <div className="p-4 bg-slate-800 text-center text-sm">
        <p>Version 1.0.0</p>
        <p>© 2025 | Powered by Production House </p>

      </div>
    </div>
  );
};

export default Sidbar;
