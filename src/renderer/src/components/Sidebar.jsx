import React, { useEffect, useState } from 'react';
import useToggleStore from '../zustand/useToggleStore';
import { MdOutlineDashboard, MdMenu, MdClose } from 'react-icons/md';
import { FaChartBar, FaDatabase, FaFileAlt, FaRupeeSign, FaUser, FaChevronDown, FaUsers, FaCalculator, FaBox } from 'react-icons/fa';
import { GiCash, GiHeavyCollar } from 'react-icons/gi';
import { FaArrowTrendUp, FaGear, FaListCheck, FaMoneyBillTrendUp } from 'react-icons/fa6';
import { NavLink, useLocation } from 'react-router-dom';
import dairyLogo from "../assets/dairyLogo.png";
import { TbReceiptRupee } from 'react-icons/tb';
import { LuMilk } from 'react-icons/lu';
import { MdEditNote } from 'react-icons/md';

const Sidebar = () => {
  const [isSecondWindowOpen, setIsSecondWindowOpen] = useState(false);
  const [isCustomerCollectionOpen, setIsCustomerCollectionOpen] = useState(false);
  const [isCashEntryOpen, setIsCashEntryOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
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
    window.api?.onCashEntryWindowClosed?.(() => {
      setIsCashEntryOpen(false);
      setActiveItem(null);
    });

    const path = location.pathname;

    if (path.startsWith('/milkCorrection') || path.startsWith('/productCorrection') || path.startsWith('/cashCorrection')) {
      setOpenDropdownId('all-correction');
    } else if (path.startsWith('/milk-collection') || path.startsWith('/milkDispatch') || path.startsWith('/dailyMilkSale') || path === '/alldairymaster' || path.startsWith('/ratechart') || path.startsWith('/snfchart')) {
      setOpenDropdownId('milk-center');
    } else if (path.startsWith('/paymentregister') || path.startsWith('/cashentry')) {
      setOpenDropdownId('accounts');
    } else if (path.startsWith('/customer') || path.startsWith('/cmsubsidylist')) {
      setOpenDropdownId('customers');
    } else if (path.startsWith('/inventory')) {
      setOpenDropdownId('products');
    }
  }, [location.pathname]);

  const toggleDropdown = (id) => {
    setOpenDropdownId(prevId => prevId === id ? null : id);
  };

  // Close mobile menu when route changes (mobile navigation)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const linkClasses = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 font-medium text-[12px] 
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

  const handleCashEntryClick = () => {
    if (isCashEntryOpen) return;
    window.api?.openCashEntryWindow?.();
    setIsCashEntryOpen(true);
    setActiveItem('cashentry');
  };

  // Combined menu items with special items included
  const menuItems = [
    { path: '/', icon: <MdOutlineDashboard size={20} />, label: 'Dashboard', type: 'link' },
    { 
      id: 'milk-center',
      icon: <LuMilk size={18} />, 
      label: 'Milk Center', 
      type: 'dropdown',
      subItems: [
        { label: 'Milk Collection', onClick: handleMilkCollectionClick, isButton: true, id: 'milk-collection' },
        { path: '/milkDispatch', label: 'Milk Dispatch' },
        { path: '/dailyMilkSale', label: 'Daily Milk Sale' }, 
        { path: '/alldairymaster', label: 'Head Dairy Master' }, 
        { path: '/ratechart', label: 'Rate Chart' },
        { path: '/snfchart', label: 'SNF Chart' },
      ] 
    },
    { 
      id: 'all-correction',
      icon: <MdEditNote size={20} />, 
      label: 'All Correction', 
      type: 'dropdown',
      subItems: [
        { path: '/milkCorrection', label: 'Milk' },
        { path: '/productCorrection', label: 'Product' },
        { path: '/cashCorrection', label: 'Cash' },
      ]
    },
    { 
      id: 'accounts',
      icon: <FaCalculator size={16} />, 
      label: 'Accounts', 
      type: 'dropdown',
      subItems: [
        { path: '/paymentregister', label: 'Payment Register' },
        { label: 'Cash Entry', onClick: handleCashEntryClick, isButton: true, id: 'cashentry' },
      ]
    },
    { 
      id: 'customers',
      icon: <FaUsers size={18} />, 
      label: 'Customers', 
      type: 'dropdown',
      subItems: [
        { path: '/customer', label: 'Customer' },
        { path: '/cmsubsidylist', label: 'CM Subsidy List' },
      ]
    },
    { 
      id: 'products',
      icon: <FaBox size={16} />, 
      label: 'Products', 
      type: 'dropdown',
      subItems: [
        { path: '/inventory', label: 'Inventory' },
        {  label: 'Product Sell',onClick: handleProductsSoldClick, isButton: true, id: 'customer-collection' },
      ]
    },
    // { 
    //   id: 'customer-collection',
    //   icon: <GiHeavyCollar size={14} />, 
    //   label: 'Products Sold', 
    //   type: 'button',
    //   onClick: handleProductsSoldClick,
    //   isDisabled: isCustomerCollectionOpen,
    //   isActive: activeItem === 'customer-collection'
    // },
    { path: '/reports', icon: <FaFileAlt size={14} />, label: 'Reports', type: 'link' },
    { path: '/settings', icon: <FaGear size={14} />, label: 'Settings', type: 'link' },
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
          ${isCollapsed ? 'w-20' : 'w-60'}
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

              // Dropdown items
              if (item.type === 'dropdown') {
                const isOpen = openDropdownId === item.id;
                return (
                  <div key={item.id} className="flex flex-col">
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`
                        w-full group flex items-center justify-between px-4 py-3 mx-2 rounded-xl 
                        transition-all duration-300 font-medium text-[12px]
                        ${isOpen 
                          ? 'bg-slate-700/50 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
                        }
                        ${isCollapsed ? 'justify-center px-2' : ''}
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="truncate transition-opacity duration-300">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <FaChevronDown 
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                          size={12} 
                        />
                      )}
                    </button>

                    {/* Submenu Items */}
                    <div 
                      className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                        ${isCollapsed ? 'hidden' : 'block'}
                      `}
                    >
                      {item.subItems.map((subItem, index) => {
                        if (subItem.isButton) {
                          const isSubDisabled = 
                            subItem.id === 'milk-collection' ? isSecondWindowOpen : 
                            subItem.id === 'cashentry' ? isCashEntryOpen : false;
                          const isSubActive = activeItem === subItem.id;
                          return (
                            <button
                              key={index}
                              onClick={subItem.onClick}
                              disabled={isSubDisabled}
                              className={`w-[calc(100%-48px)] flex items-center gap-3 px-4 py-2 mx-6 my-1 rounded-lg transition-all duration-200 text-[12px] font-medium
                                ${isSubActive 
                                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                  : 'text-gray-400 hover:bg-slate-700/50 hover:text-gray-200'
                                } ${isSubDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-50 ${isSubDisabled ? 'animate-pulse' : ''}`}></span>
                              {subItem.label}
                            </button>
                          );
                        }
                        return (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 mx-6 my-1 rounded-lg transition-all duration-200 text-[12px] font-medium
                               ${isActive 
                                 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                 : 'text-gray-400 hover:bg-slate-700/50 hover:text-gray-200'
                               }`
                            }
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                            {subItem.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
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
                      transition-all duration-300 font-medium text-[12px]
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
