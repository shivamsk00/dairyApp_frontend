import React, { useEffect, useState, useCallback } from 'react'
import "./dashboard.css"
import Card from '../../components/cards/Card'
import AreaChart from '../../components/charts/areaChart/AreaChart'
import BarChart from '../../components/charts/barChart/BarChart'
import PieChart from '../../components/charts/pieChar/PieChart'
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
} from 'react-icons/fa';
import StatusCardGrid from '../../components/StatusCardGrid'
import { useNavigate } from 'react-router-dom'
import CustomInput from '../../components/CustomInput'
import ClassicWindowsForm from '../../components/FormGroups'

const statusData = [
  { label: 'Payment Refund', count: 490, icon: <FaUndoAlt /> },
  { label: 'Order Cancel', count: 241, icon: <FaShoppingCart /> },
  { label: 'Order Shipped', count: 630, icon: <FaBox /> },
  { label: 'Order Delivering', count: 170, icon: <FaTruck /> },
  { label: 'Pending Review', count: 210, icon: <FaClipboardCheck /> },
  { label: 'Pending Payment', count: 608, icon: <FaClock /> },
  { label: 'Delivered', count: 200, icon: <FaBriefcase /> },
  { label: 'In Progress', count: 656, icon: <FaTasks /> },
];

const Dashboard = () => {
  const nav = useNavigate()
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [cardData, setCardData] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  // Dashboard data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDashboardData();
        console.log("response", res)
        const data = res?.data || {};

        const purchased = Number(data.total_milk?.total_milk_purchased) || 0;
        const collected = Number(data.total_milk?.total_milk_collected) || 0;

        const updatedCards = [
          {
            id: 1,
            title: 'Customer',
            total: data.summary?.customers ?? 0,
          },
          {
            id: 2,
            title: 'Today Milk Purchase',
            total: `${purchased.toFixed(2)} Ltr`,
          },
          {
            id: 3,
            title: 'Today Milk Sale',
            total: `${collected.toFixed(2)} Ltr`,
          },
          {
            id: 4,
            title: 'Inventory',
            total: data.summary?.inventory ?? 0,
          },
        ];

        setCardData(updatedCards);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();

    // Get app version
    if (window.api?.getAppVersion) {
      window.api.getAppVersion()
        .then(version => setAppVersion(version))
        .catch(error => console.error('Failed to get app version:', error));
    }
  }, [fetchDashboardData]);

  // Update message handler with proper state management [web:152]
  const handleUpdateMessage = useCallback((msg) => {
    console.log('Update message received:', msg);
    setMessage(msg);
    
    if (msg) {
      setShowBanner(true);
      setIsCheckingUpdate(false); // Stop checking state
      
      // Handle different message types
      if (msg === 'No update available.' || msg.includes('Development mode')) {
        setIsDownloading(false);
        setProgress(null);
        // Auto-hide "no update" message after 5 seconds
        setTimeout(() => {
          setShowBanner(false);
          setMessage(null);
        }, 5000);
      } else if (msg.includes('Update error') || msg.includes('error')) {
        setIsDownloading(false);
        setProgress(null);
        // Auto-hide error message after 8 seconds
        setTimeout(() => {
          setShowBanner(false);
          setMessage(null);
        }, 8000);
      } else if (msg.includes('Update available') && !msg.includes('Downloading')) {
        // Update is available but not yet downloading
        setIsDownloading(false);
        setProgress(null);
      } else if (msg.includes('Downloading') || msg.includes('Starting download')) {
        setIsDownloading(true);
      } else if (msg.includes('downloaded successfully')) {
        setIsDownloading(false);
        // Don't auto-hide download complete message
      }
    } else {
      // Message is null - hide banner
      setShowBanner(false);
      setIsDownloading(false);
      setProgress(null);
      setIsCheckingUpdate(false);
    }
  }, []);

  // Progress handler [web:152]
  const handleUpdateProgress = useCallback((percent) => {
    console.log('Update progress:', percent);
    setProgress(percent);
    
    if (percent === 100) {
      setIsDownloading(false);
    } else if (percent > 0) {
      setIsDownloading(true);
    }
  }, []);

  // Update listeners setup with proper cleanup [web:152][web:154]
  useEffect(() => {
    if (!window.api?.onUpdateMessage || !window.api?.onUpdateProgress) {
      console.warn('Update API methods not available');
      return;
    }

    // Setup listeners
    window.api.onUpdateMessage(handleUpdateMessage);
    window.api.onUpdateProgress(handleUpdateProgress);

    // Cleanup function to prevent memory leaks [web:152][web:154]
    return () => {
      console.log('Cleaning up update listeners');
      if (window.api?.removeUpdateListeners) {
        window.api.removeUpdateListeners();
      }
    };
  }, [handleUpdateMessage, handleUpdateProgress]);

  // Update action handlers
  const handleUpdateClick = async () => {
    if (!window.api?.upadateStartDownload) {
      toast.error('Update functionality not available');
      return;
    }

    setIsDownloading(true);
    try {
      const result = await window.api.upadateStartDownload();
      console.log('Update download started:', result);
      
      if (result?.success === false) {
        setIsDownloading(false);
        toast.error(result.error || 'Failed to start download');
      }
    } catch (error) {
      console.error('Update download failed:', error);
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
      console.log('Update check result:', result);
      
      if (result?.success === false) {
        setIsCheckingUpdate(false);
        toast.error(result.error || 'Failed to check for updates');
      }
      // Success state will be handled by update message listener
    } catch (error) {
      console.error('Update check failed:', error);
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
      console.error('Restart failed:', error);
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

  // Update Banner Component with improved state handling
  const UpdateBanner = () => {
    if (!showBanner || !message) return null;

    const isNoUpdate = message === 'No update available.' || message.includes('Development mode');
    const isCheckingUpdate = message === 'Checking for updates...';
    const isUpdateAvailable = message.includes('Update available') && !isDownloading && !message.includes('Downloading');
    const isDownloadInProgress = isDownloading && progress !== null && progress < 100;
    const isDownloadComplete = progress === 100 && (message.includes('downloaded') || message.includes('Download Complete'));
    const isError = message.includes('Update error') || message.includes('error');

    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-full duration-300">
        {/* Checking for Updates */}
        {isCheckingUpdate && (
          <div className="bg-gray-50 border-l-4 border-gray-400 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FaSpinner className="h-5 w-5 text-gray-500 animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{message}</p>
                  <p className="text-xs text-gray-600 mt-1">Please wait...</p>
                </div>
              </div>
              <button
                onClick={closeBanner}
                className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border-l-4 border-red-400 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{message}</p>
                  <p className="text-xs text-red-600 mt-1">Please try again later</p>
                </div>
              </div>
              <button
                onClick={closeBanner}
                className="flex-shrink-0 ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* No Update Available */}
        {isNoUpdate && (
          <div className="bg-blue-50 border-l-4 border-blue-400 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">{message}</p>
                  <p className="text-xs text-blue-600 mt-1">Your app is up to date!</p>
                </div>
              </div>
              <button
                onClick={closeBanner}
                className="flex-shrink-0 ml-4 p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors duration-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Update Available */}
        {isUpdateAvailable && (
          <div className="bg-green-50 border-l-4 border-green-400 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FaDownload className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Update Available!</p>
                  <p className="text-xs text-green-600 mt-1">A new version is ready to download</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUpdateClick}
                  disabled={isDownloading}
                  className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 space-x-2"
                >
                  <FaDownload className="h-3 w-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={closeBanner}
                  className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-md transition-colors duration-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download in Progress */}
        {isDownloadInProgress && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FaSpinner className="h-5 w-5 text-yellow-500 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Downloading Update...</p>
                    <p className="text-xs text-yellow-600">Please wait while we download the latest version</p>
                  </div>
                </div>
                <button
                  onClick={closeBanner}
                  className="p-2 text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors duration-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-yellow-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress || 0}%` }}
                  />
                </div>
                <span className="text-yellow-800 font-medium text-sm min-w-[2.5rem]">
                  {progress || 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Download Complete */}
        {isDownloadComplete && (
          <div className="bg-green-50 border-l-4 border-green-400 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Download Complete!</p>
                  <p className="text-xs text-green-600 mt-1">Restart the app to apply the update</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRestartApp}
                  className="inline-flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md shadow-sm transition-colors duration-200"
                >
                  Restart Now
                </button>
                <button
                  onClick={closeBanner}
                  className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-md transition-colors duration-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Update Banner */}
      <UpdateBanner />

      <StatusCardGrid data={statusData} />
      
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span>Version: {appVersion || 'Loading...'}</span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate || isDownloading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 space-x-2"
          >
            <FaSync className={`h-4 w-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdate ? 'Checking...' : 'Check for Updates'}</span>
          </button>
          <button
            onClick={() => nav('/update-history')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 space-x-2"
          >
            <FaClock className="h-4 w-4" />
            <span>View Update History</span>
          </button>
        </div>
      </div>

      <div className="chartContainer bg-white p-8 rounded-lg shadow-xl mt-6">
        <AreaChart />
        <BarChart />
        <PieChart />
      </div>

<div>
  <h1>this is a custom input</h1>
  <CustomInput placeholder="Enter text" />
</div>

<ClassicWindowsForm />


    </div>
  )
}

export default Dashboard
