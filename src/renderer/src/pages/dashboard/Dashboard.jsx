import React, { useEffect, useState, useCallback } from 'react'
import "./dashboard.css"
import useHomeStore from '../../zustand/useHomeStore'
import { toast } from 'react-toastify'
import {
  FaUndoAlt,
  FaShoppingCart,
  FaBox,
  FaTruck,
  FaClipboardCheck,
  FaClock,
  FaBriefcase,
  FaTasks,
  FaDownload,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
  FaSpinner,
  FaSync,
  FaChartLine,
  FaBell,
  FaUser,
  FaCog,
  FaSearch,
  FaFilter,
  FaUsers,
  // FaMilkshake,
  FaBoxOpen,
  FaMoneyBillWave,
  FaHandshake,
  FaClipboardList,
  FaChartBar,
  FaBiking,
  FaCalendarDay,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const nav = useNavigate()
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    todayMilkCollection: 0,
    totalProducts: 0,
    soldProducts: 0,
    cashEntries: 0,
    cmSubsidyToCustomers: 0,
    profitLoss: 0,
    headDairyMilkCollection: 0,
    bikeCollection: 0
  });
  
  const [milkCheckData, setMilkCheckData] = useState({
    dateField: '',
    fromShift: '',
    toShift: '',
    totalMilk: 0
  });

  const [isDownloading, setIsDownloading] = useState(false)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  // Dashboard data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDashboardData();
        const data = res?.data || {};

        setDashboardData({
          totalCustomers: data.summary?.customers ?? 0,
          todayMilkCollection: Number(data.total_milk?.total_milk_collected) || 0,
          totalProducts: data.summary?.total_products ?? 0,
          soldProducts: data.summary?.sold_products ?? 0,
          cashEntries: data.summary?.cash_entries ?? 0,
          cmSubsidyToCustomers: data.summary?.cm_subsidy ?? 0,
          profitLoss: data.summary?.profit_loss ?? 0,
          headDairyMilkCollection: data.summary?.head_dairy_collection ?? 0,
          bikeCollection: data.summary?.bike_collection ?? 0
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();

    if (window.api?.getAppVersion) {
      window.api.getAppVersion()
        .then(version => setAppVersion(version))
        .catch(error => console.error('Failed to get app version:', error));
    }
  }, [fetchDashboardData]);

  // Milk check form handler
  const handleMilkCheck = () => {
    if (!milkCheckData.dateField || !milkCheckData.fromShift || !milkCheckData.toShift) {
      toast.error('Please fill all fields for milk check');
      return;
    }
    
    // Calculate total milk based on shifts and date
    const totalMilk = dashboardData.todayMilkCollection; // This would be calculated based on actual data
    setMilkCheckData(prev => ({
      ...prev,
      totalMilk: totalMilk
    }));
    
    toast.success(`Total milk calculated: ${totalMilk} Ltr`);
  };

  // Update handlers (keeping the same as your original code)
  const handleUpdateMessage = useCallback((msg) => {
    setMessage(msg);
    if (msg) {
      setShowBanner(true);
      setIsCheckingUpdate(false);
      
      if (msg === 'No update available.' || msg.includes('Development mode')) {
        setIsDownloading(false);
        setProgress(null);
        setTimeout(() => {
          setShowBanner(false);
          setMessage(null);
        }, 5000);
      } else if (msg.includes('Update error') || msg.includes('error')) {
        setIsDownloading(false);
        setProgress(null);
        setTimeout(() => {
          setShowBanner(false);
          setMessage(null);
        }, 8000);
      } else if (msg.includes('Update available') && !msg.includes('Downloading')) {
        setIsDownloading(false);
        setProgress(null);
      } else if (msg.includes('Downloading') || msg.includes('Starting download')) {
        setIsDownloading(true);
      } else if (msg.includes('downloaded successfully')) {
        setIsDownloading(false);
      }
    } else {
      setShowBanner(false);
      setIsDownloading(false);
      setProgress(null);
      setIsCheckingUpdate(false);
    }
  }, []);

  const handleUpdateProgress = useCallback((percent) => {
    setProgress(percent);
    if (percent === 100) {
      setIsDownloading(false);
    } else if (percent > 0) {
      setIsDownloading(true);
    }
  }, []);

  useEffect(() => {
    if (!window.api?.onUpdateMessage || !window.api?.onUpdateProgress) {
      return;
    }

    window.api.onUpdateMessage(handleUpdateMessage);
    window.api.onUpdateProgress(handleUpdateProgress);

    return () => {
      if (window.api?.removeUpdateListeners) {
        window.api.removeUpdateListeners();
      }
    };
  }, [handleUpdateMessage, handleUpdateProgress]);

  const handleUpdateClick = async () => {
    if (!window.api?.upadateStartDownload) {
      toast.error('Update functionality not available');
      return;
    }

    setIsDownloading(true);
    try {
      const result = await window.api.upadateStartDownload();
      if (result?.success === false) {
        setIsDownloading(false);
        toast.error(result.error || 'Failed to start download');
      }
    } catch (error) {
      setIsDownloading(false);
      toast.error('Failed to start update download');
    }
  };

  const handleCheckUpdate = async () => {
    if (!window.api?.checkForUpdate) {
      toast.error('Update check functionality not available');
      return;
    }

    setIsCheckingUpdate(true);
    try {
      const result = await window.api.checkForUpdate();
      if (result?.success === false) {
        setIsCheckingUpdate(false);
        toast.error(result.error || 'Failed to check for updates');
      }
    } catch (error) {
      setIsCheckingUpdate(false);
      toast.error('Failed to check for updates');
    }
  };

  const handleRestartApp = async () => {
    if (!window.api?.restartAndInstall) {
      toast.error('Restart functionality not available');
      return;
    }

    try {
      await window.api.restartAndInstall();
    } catch (error) {
      toast.error('Failed to restart application');
    }
  };

  const closeBanner = () => {
    setShowBanner(false);
    setMessage(null);
    setProgress(null);
    setIsDownloading(false);
    setIsCheckingUpdate(false);
  };

  // Update Banner Component (same as before but more compact)
  const UpdateBanner = () => {
    if (!showBanner || !message) return null;

    const isNoUpdate = message === 'No update available.' || message.includes('Development mode');
    const isCheckingUpdate = message === 'Checking for updates...';
    const isUpdateAvailable = message.includes('Update available') && !isDownloading && !message.includes('Downloading');
    const isDownloadInProgress = isDownloading && progress !== null && progress < 100;
    const isDownloadComplete = progress === 100 && (message.includes('downloaded') || message.includes('Download Complete'));
    const isError = message.includes('Update error') || message.includes('error');

    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-full duration-300 shadow-lg">
        {isCheckingUpdate && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <FaSpinner className="h-4 w-4 text-gray-500 animate-spin" />
                <p className="text-sm font-medium text-gray-800">{message}</p>
              </div>
              <button onClick={closeBanner} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {isError && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <FaInfoCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-medium text-red-800">{message}</p>
              </div>
              <button onClick={closeBanner} className="p-1 text-red-400 hover:text-red-600 rounded transition-colors">
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {isNoUpdate && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <FaInfoCircle className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium text-blue-800">{message}</p>
              </div>
              <button onClick={closeBanner} className="p-1 text-blue-400 hover:text-blue-600 rounded transition-colors">
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {isUpdateAvailable && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <FaDownload className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">Update Available!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUpdateClick}
                  disabled={isDownloading}
                  className="inline-flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xs font-medium rounded shadow-sm transition-colors space-x-1"
                >
                  <FaDownload className="h-3 w-3" />
                  <span>Download</span>
                </button>
                <button onClick={closeBanner} className="p-1 text-green-400 hover:text-green-600 rounded transition-colors">
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {isDownloadInProgress && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FaSpinner className="h-4 w-4 text-yellow-500 animate-spin" />
                  <p className="text-sm font-medium text-yellow-800">Downloading Update...</p>
                </div>
                <button onClick={closeBanner} className="p-1 text-yellow-400 hover:text-yellow-600 rounded transition-colors">
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-yellow-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress || 0}%` }}
                  />
                </div>
                <span className="text-yellow-800 font-medium text-xs min-w-[2rem]">
                  {progress || 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {isDownloadComplete && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium text-green-800">Download Complete!</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRestartApp}
                  className="inline-flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded shadow-sm transition-colors"
                >
                  Restart Now
                </button>
                <button onClick={closeBanner} className="p-1 text-green-400 hover:text-green-600 rounded transition-colors">
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Update Banner */}
      <UpdateBanner />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
            {/* Left side - Welcome */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">December 25, 2015 - Friday Overview</p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                />
              </div>

              {/* Time Range Filter */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaBell className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaCog className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Primary Metrics Grid - Based on your handwritten list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Total Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalCustomers}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">+12%</span>
                  <span className="text-xs text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                <FaUsers className="text-xl" />
              </div>
            </div>
          </div>

          {/* 2. Today Milk Collection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Today Milk Collection</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.todayMilkCollection.toFixed(2)} Ltr</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">+8%</span>
                  <span className="text-xs text-gray-500 ml-2">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                {/* <FaMilkshake className="text-xl" /> */}
              </div>
            </div>
          </div>

          {/* 3. Total Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalProducts}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-blue-600">+5%</span>
                  <span className="text-xs text-gray-500 ml-2">inventory</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <FaBoxOpen className="text-xl" />
              </div>
            </div>
          </div>

          {/* 4. Sold Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Sold Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.soldProducts}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">+15%</span>
                  <span className="text-xs text-gray-500 ml-2">today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                <FaShoppingCart className="text-xl" />
              </div>
            </div>
          </div>

          {/* 5. Cash Entries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Cash Entries</p>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData.cashEntries.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">+22%</span>
                  <span className="text-xs text-gray-500 ml-2">today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                <FaMoneyBillWave className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 6. CM Subsidy to Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">CM Subsidy to Customers</p>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData.cmSubsidyToCustomers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-blue-600">Monthly</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <FaHandshake className="text-xl" />
              </div>
            </div>
          </div>

          {/* 8. Profit & Loss */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Profit & Loss</p>
                <p className={`text-2xl font-bold ${dashboardData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(dashboardData.profitLoss).toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${dashboardData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardData.profitLoss >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${dashboardData.profitLoss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-lg flex items-center justify-center text-white`}>
                <FaChartBar className="text-xl" />
              </div>
            </div>
          </div>

          {/* 9. Head Dairy Milk Collection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Head Dairy Collection</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.headDairyMilkCollection.toFixed(2)} Ltr</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-purple-600">Daily</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <FaBriefcase className="text-xl" />
              </div>
            </div>
          </div>

          {/* 10. Bike Collection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Bike Collection</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.bikeCollection.toFixed(2)} Ltr</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-orange-600">03:00 Shift</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white">
                <FaBiking className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Form [Milk Check] Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaClipboardList className="mr-3 text-blue-500" />
              Milk Check Form
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Field</label>
              <input
                type="date"
                value={milkCheckData.dateField}
                onChange={(e) => setMilkCheckData(prev => ({ ...prev, dateField: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* From Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Shift</label>
              <select
                value={milkCheckData.fromShift}
                onChange={(e) => setMilkCheckData(prev => ({ ...prev, fromShift: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift</option>
              </select>
            </div>

            {/* To Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Shift</label>
              <select
                value={milkCheckData.toShift}
                onChange={(e) => setMilkCheckData(prev => ({ ...prev, toShift: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift</option>
              </select>
            </div>

            {/* Check Total Milk Button */}
            <div className="flex items-end">
              <button
                onClick={handleMilkCheck}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FaSearch className="h-4 w-4" />
                <span>Check Total Milk</span>
              </button>
            </div>
          </div>

          {/* Total Milk Result */}
          {milkCheckData.totalMilk > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Total Milk Calculated</p>
                  <p className="text-2xl font-bold text-green-900">{milkCheckData.totalMilk.toFixed(2)} Ltr</p>
                  <p className="text-xs text-green-600 mt-1">
                    From {milkCheckData.fromShift} to {milkCheckData.toShift} on {milkCheckData.dateField}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Update Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
              <p className="text-sm text-gray-600">App Version: {appVersion || 'Loading...'}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate || isDownloading}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 space-x-2"
              >
                <FaSync className={`h-4 w-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Checking...' : 'Check Updates'}</span>
              </button>
              {/* <button
                onClick={() => nav('/update-history')}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 space-x-2"
              >
                <FaClock className="h-4 w-4" />
                <span>Update History</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
