import React, { useEffect, useState } from 'react';
import useToggleStore from '../zustand/useToggleStore';
import { MdOutlineDashboard, MdMenu, MdClose } from 'react-icons/md';
import { FaChartBar, FaDatabase, FaFileAlt, FaRupeeSign, FaUser, FaChevronDown } from 'react-icons/fa';
import { GiCash, GiHeavyCollar } from 'react-icons/gi';
import { FaArrowTrendUp, FaGear, FaListCheck, FaMoneyBillTrendUp } from 'react-icons/fa6';
import { NavLink, useLocation } from 'react-router-dom';
import dairyLogo from "../assets/dairyLogo.png";
import { TbReceiptRupee } from 'react-icons/tb';

const Sidebar = () => {
  const [isSecondWindowOpen, setIsSecondWindowOpen] = useState(false);
  const [isCustomerCollectionOpen, setIsCustomerCollectionOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMenu = useToggleStore(state => state.isMenu);
  const location = useLocation();
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.api?.getAppVersion?.().then(setVersion);
  }, []);

  useEffect(() => {
    window.api?.onSecondWindowClosed?.(() => {
      setIsSecondWindowOpen(false);
      setActiveItem(null);
    });
    window.api?.onCutomerWindowClosed?.(() => {
      setIsCustomerCollectionOpen(false);
      setActiveItem(null);
    });

    if (
      location.pathname.startsWith('/subscribe') ||
      location.pathname.startsWith('/subscribe-history')
    ) {
      setIsSubMenuOpen(true);
    }
  }, [location.pathname]);

  // Close mobile menu when route changes (mobile navigation)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const linkClasses = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-medium
     ${isActive 
       ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
       : 'text-gray-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
     }
     ${isCollapsed ? 'justify-center px-2' : ''}`;

  // Function to handle special button clicks
  const handleMilkCollectionClick = () => {
    if (isSecondWindowOpen) return;
    window.api?.openSecondWindow?.();
    setIsSecondWindowOpen(true);
    setActiveItem('milk-collection');
  };

  const handleProductsSoldClick = () => {
    if (isCustomerCollectionOpen) return;
    window.api?.openCusomerWindow?.();
    setIsCustomerCollectionOpen(true);
    setActiveItem('customer-collection');
  };

  // Combined menu items with special items included
  const menuItems = [
    { path: '/', icon: <MdOutlineDashboard size={20} />, label: 'Dashboard', type: 'link' },
    { 
      id: 'milk-collection',
      icon: <GiHeavyCollar size={18} />, 
      label: 'Milk Collection', 
      type: 'button',
      onClick: handleMilkCollectionClick,
      isDisabled: isSecondWindowOpen,
      isActive: activeItem === 'milk-collection'
    },
    { path: '/milkCorrection', icon: <FaListCheck size={18} />, label: 'All Milk Correction', type: 'link' },
    { path: '/customer', icon: <FaUser size={18} />, label: 'Customers', type: 'link' },
    { path: '/alldairymaster', icon: <FaMoneyBillTrendUp size={18} />, label: 'Head Dairy Master', type: 'link' },
    { path: '/milkDispatch', icon: <FaMoneyBillTrendUp size={18} />, label: 'Milk Dispatch', type: 'link' },
    { path: '/dailyMilkSale', icon: <FaArrowTrendUp size={18} />, label: 'Open Milk Sale', type: 'link' },
    { 
      id: 'customer-collection',
      icon: <GiHeavyCollar size={18} />, 
      label: 'Products Sold', 
      type: 'button',
      onClick: handleProductsSoldClick,
      isDisabled: isCustomerCollectionOpen,
      isActive: activeItem === 'customer-collection'
    },
    { path: '/ratechart', icon: <FaChartBar size={18} />, label: 'Rate Chart', type: 'link' },
    { path: '/snfchart', icon: <FaChartBar size={18} />, label: 'SNF Chart', type: 'link' },
    { path: '/paymentregister', icon: <FaRupeeSign size={18} />, label: 'Payments Register', type: 'link' },
    { path: '/reports', icon: <FaFileAlt size={18} />, label: 'Reports', type: 'link' },
    { path: '/inventory', icon: <FaDatabase size={18} />, label: 'Inventory', type: 'link' },
    { path: '/cashentry', icon: <GiCash size={18} />, label: 'Cash Entries', type: 'link' },
    { path: '/settings', icon: <FaGear size={18} />, label: 'Settings', type: 'link' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40 flex flex-col
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-white shadow-2xl transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-72'}
          border-r border-slate-700/50
        `}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                {/* <img src={dairyLogo} alt="Logo" className="h-10 w-10 object-contain" /> */}
                <div>
                  <h1 className="text-xl font-bold text-white">सरस डेयरी</h1>
                  <p className="text-blue-100 text-xs opacity-90">Dairy Management</p>
                </div>
              </div>
            )}
            
            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <MdMenu size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="space-y-2">
            {/* Combined Menu Items - Both Links and Buttons */}
            {menuItems.map((item) => {
              // Regular NavLink items
              if (item.type === 'link') {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={linkClasses}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="truncate transition-opacity duration-300">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              }

              // Special button items (Milk Collection, Products Sold)
              if (item.type === 'button') {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    disabled={item.isDisabled}
                    className={`
                      w-full group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl 
                      transition-all duration-300 font-medium
                      ${item.isDisabled
                        ? 'bg-slate-700/50 text-gray-400 cursor-not-allowed opacity-50'
                        : item.isActive
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                        : 'text-gray-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate transition-opacity duration-300">
                        {item.label}
                      </span>
                    )}
                    {/* Loading indicator for disabled buttons */}
                    {!isCollapsed && item.isDisabled && (
                      <div className="ml-auto">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                );
              }

              return null;
            })}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400">Version {version}</p>
              <p className="text-xs text-gray-500">
                © 2025 | Powered by Production House
              </p>
            </div>
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div className="p-2 bg-slate-900/50 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold">{version}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
