
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaUsers, FaBoxOpen, FaMoneyBillWave, FaChartLine, FaSun, FaMoon, FaPlus, FaUserPlus, FaFileInvoice, FaBook, FaRegCreditCard, FaShoppingCart, FaFileExport, FaUser, FaDownload } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import useHomeStore from '../../zustand/useHomeStore';
import { Link } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const getDashboardData = useHomeStore((state) => state.fetchDashboardData);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appUpdateMessage, setAppUpdateMessage] = useState(null);
  const [appUpdateProgress, setAppUpdateProgress] = useState(0);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await getDashboardData();
      console.log('dashboard data', res);
      if (res.status_code === 200) {
        setDashboardData(res.data);
      } else {
        if (!isSilent) {
          setError(res.message);
          toast.error(res.message);
        }
      }
    } catch (error) {
      if (!isSilent) {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [getDashboardData]);

  const handleCheckUpdate = async () => {
    if (window.api && window.api.checkForUpdate) {
      try {
        setAppUpdateMessage('Checking for updates...');
        await window.api.checkForUpdate();
      } catch (err) {
        toast.error('Failed to check for updates');
        setAppUpdateMessage(null);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(false);

    // Automatic update check on dashboard load
    handleCheckUpdate();

    // Listen for app updates
    if (window.api) {
      window.api.onUpdateMessage((message) => {
        setAppUpdateMessage(message);
        if (message === 'No update available.') {
          toast.info('Your software is up to date.');
        }
      });

      window.api.onUpdateProgress((percent) => {
        setAppUpdateProgress(percent);
      });
    }

    return () => {
      if (window.api && window.api.removeUpdateListeners) {
        window.api.removeUpdateListeners();
      }
    };
  }, [fetchDashboardData]);


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Wait for data to load
  if (!dashboardData) {
    return null;
  }

  // Extract data from API response
  const { summary, milk_type_distribution, total_milk, last_7_days_shift_data } = dashboardData;

  // Prepare line chart data from last_7_days_shift_data
  const weeklyPerformanceData = {
    labels: last_7_days_shift_data?.map(item => item.day) || [],
    datasets: [
      {
        label: 'Morning Shift (L)',
        data: last_7_days_shift_data?.map(item => item.morning_milk) || [],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Evening Shift (L)',
        data: last_7_days_shift_data?.map(item => item.evening_milk) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' L';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value) {
            return value + ' L';
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  // Calculate total collection
  const totalCollection = total_milk?.total_milk_collected || 0;
  const totalPurchased = total_milk?.total_milk_purchased || 0;

  // Calculate totals for last 7 days
  const last7DaysTotal = last_7_days_shift_data?.reduce((sum, day) => sum + day.total_milk, 0) || 0;
  const last7DaysMorningTotal = last_7_days_shift_data?.reduce((sum, day) => sum + day.morning_milk, 0) || 0;
  const last7DaysEveningTotal = last_7_days_shift_data?.reduce((sum, day) => sum + day.evening_milk, 0) || 0;

  // Calculate percentages for shift distribution
  const morningPercentage = last7DaysTotal > 0 ? (last7DaysMorningTotal / last7DaysTotal * 100).toFixed(1) : 0;
  const eveningPercentage = last7DaysTotal > 0 ? (last7DaysEveningTotal / last7DaysTotal * 100).toFixed(1) : 0;

  // Mock data for recent collections (you can replace with API data when available)
  const recentCollectionsData = [
    { customer: 'Ramesh Kumar', shift: 'Morning', time: '06:32 AM', amount: 12.6, fat: 4.7, snf: 8.9 },
    { customer: 'Priya Sharma', shift: 'Morning', time: '07:15 AM', amount: 8.5, fat: 3.6, snf: 8.2 },
    { customer: 'Suresh Ravi', shift: 'Evening', time: '06:01 PM', amount: 15.2, fat: 4.1, snf: 8.7 },
    { customer: 'Lakshmi Reddy', shift: 'Evening', time: '07:00 PM', amount: 10.8, fat: 4, snf: 8.5 },
    { customer: 'Vijay Singh', shift: 'Morning', time: '08:02 AM', amount: 14.6, fat: 4.1, snf: 8.8 },
  ];

  return (
    <div className="min-h-screen relative">
      {/* App Update Overlay/Banner */}
      {appUpdateMessage && (
        <div className="fixed top-0 left-0 w-full z-[100] animate-in slide-in-from-top duration-500 ease-out">
          {/* Main Banner */}
          <div className={`text-white px-6 py-3 shadow-2xl backdrop-blur-md border-b border-white/10 transition-colors duration-500 ${appUpdateMessage === 'No update available.'
            ? 'bg-gray-800'
            : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700'
            }`}>
            <div className="max-w-8xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg backdrop-blur-sm ${appUpdateMessage === 'No update available.' ? 'bg-white/10' : 'bg-white/20 animate-pulse'
                  }`}>
                  <FaChartLine className="text-xl text-white" />
                </div>
                <div>
                  <p className="font-bold text-xs tracking-wide uppercase opacity-80">Software Update</p>
                  <p className="text-lg font-medium leading-tight">{appUpdateMessage}</p>
                </div>
              </div>

              {appUpdateProgress > 0 && (
                <div className="flex items-center gap-4 w-full sm:w-80">
                  <div className="flex-1 relative h-3 bg-blue-900/40 rounded-full overflow-hidden border border-blue-400/20">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-white transition-all duration-500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                      style={{ width: `${appUpdateProgress}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold font-mono min-w-[50px]">{appUpdateProgress}%</span>
                </div>
              )}

              <button
                onClick={() => setAppUpdateMessage(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>

          {/* High-Visibility Top Progress Strip */}
          {appUpdateProgress > 0 && (
            <div className="w-full h-1.5 bg-blue-900/20">
              <div
                className="h-full bg-white transition-all duration-500 shadow-[0_0_10px_#fff]"
                style={{ width: `${appUpdateProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className={`max-w-8xl mx-auto space-y-6 transition-all duration-500 ${appUpdateMessage ? 'pt-24' : 'pt-4'}`}>
        {/* Top KPI Cards - Using API Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Customers"
            value={summary.customers}
            icon={<FaUsers className="text-white" />}
            color="bg-blue-500"
          />
          <KpiCard
            title="Today's Collection"
            value={`${totalCollection.toFixed(2)} L`}
            subtitle="morning + evening"
            icon={<FaBoxOpen className="text-white" />}
            color="bg-green-500"
          />
          <KpiCard
            title="Current Inventory"
            value={`${summary.inventory.toFixed(2)}`}
            icon={<FaMoneyBillWave className="text-white" />}
            color="bg-yellow-500"
          />
          <KpiCard
            title="Last 7 Days"
            value={`${last7DaysTotal.toFixed(2)} L`}
            subtitle="total collection"
            icon={<FaChartLine className="text-white" />}
            color="bg-teal-500"
          />
        </div>

        {/* Shift-wise Collection Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Last 7 Days - Shift-wise Collection</h2>
          <p className="text-sm text-gray-500 mb-6">Morning vs Evening milk collection breakdown</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
            {/* Morning Shift */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FaSun className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Morning Shift</p>
                  <p className="text-xl font-bold text-gray-900">
                    {last7DaysMorningTotal.toFixed(2)} L
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <p className="text-sm font-semibold">{morningPercentage}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${morningPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Evening Shift */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaMoon className="text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Evening Shift</p>
                  <p className="text-xl font-bold text-gray-900">
                    {last7DaysEveningTotal.toFixed(2)} L
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <p className="text-sm font-semibold">{eveningPercentage}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${eveningPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <p className="text-gray-700 font-semibold">
              Total Collection: <span className="text-xl text-black">{last7DaysTotal.toFixed(2)} Liters</span>
            </p>
            <p className="text-sm text-gray-500">
              Customers: <span className="font-semibold text-gray-700">{summary.customers}</span>
            </p>
          </div>
        </div>

        {/* Main Content Area: Performance & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Performance Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Last 7 Days Collection Trend</h2>
              <p className="text-sm text-gray-500 mb-4">Morning vs Evening shift comparison</p>
              <div style={{ height: '300px' }}>
                <Line data={weeklyPerformanceData} options={chartOptions} />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProductCard
                title="Total Customers"
                value={summary.customers}
                icon={<FaUsers />}
              />
              <ProductCard
                title="Today's Inventory"
                value={`${summary.inventory.toFixed(2)} L`}
                icon={<FaBoxOpen />}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            <p className="text-sm text-gray-500 mb-6">Frequently used operations</p>
            <div className="space-y-3">

              <Link to="/customer">
                <QuickActionButton text="All Customer" icon={<FaUsers />} />
              </Link>
              <Link to="/AddProductPage">
                <QuickActionButton text="Add Product" icon={<FaBoxOpen />} />
              </Link>
              <Link to="/milkCorrection">
                <QuickActionButton text="All Milk Correction" icon={<FaFileInvoice />} />
              </Link>
              <Link to="/reports">
                <QuickActionButton text="View Reports" icon={<FaBook />} />
              </Link>
              <Link to="/cashentry">
                <QuickActionButton text="Cash Entries" icon={<FaRegCreditCard />} />
              </Link>
            </div>
          </div>
        </div>

        {/* 7 Days Detailed Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Last 7 Days Detailed Report</h2>
          <p className="text-sm text-gray-500 mb-4">Day-wise collection breakdown</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Day</th>
                  <th scope="col" className="px-6 py-3 text-right">Morning (L)</th>
                  <th scope="col" className="px-6 py-3 text-right">Evening (L)</th>
                  <th scope="col" className="px-6 py-3 text-right">Total (L)</th>
                  <th scope="col" className="px-6 py-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {last_7_days_shift_data?.map((item, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.day}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{item.morning_milk.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{item.evening_milk.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold">{item.total_milk.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-semibold">
                      ₹{item.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="2" className="px-6 py-4 font-bold text-gray-900">Total</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {last7DaysMorningTotal.toFixed(2)} L
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {last7DaysEveningTotal.toFixed(2)} L
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {last7DaysTotal.toFixed(2)} L
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    ₹{last_7_days_shift_data?.reduce((sum, day) => sum + day.total_amount, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Export Reports */}
        {/* <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h3 className="text-md font-semibold text-gray-800">Export Reports</h3>
            <p className="text-sm text-gray-500">Download daily, weekly, or monthly reports</p>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <FaFileExport />
              <span>Export Report</span>
            </button>
          </div>
        */}


      </div>
      {/* Fixed Bottom Left Update Button */}
      <div
        onClick={handleCheckUpdate}
        style={{
          position: "fixed"
        }}
        className="fixed bottom-3 left-0 z-[90] flex items-center gap-2 bg-gray-900/80 hover:bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/10"
        title="Check for software updates"
      >
        <div className="bg-blue-500 p-1.5 rounded-full group-hover:rotate-180 transition-transform duration-500">
          <FaDownload className="text-xs" />
        </div>
        <span className="text-xs font-bold tracking-wider uppercase">Check Update</span>
      </div>
    </div>
  );
};

// Reusable Components
const KpiCard = ({ title, value, subtitle, icon, color }) => (
  <div className={`${color} p-5 rounded-lg text-white shadow-lg`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
      </div>
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

const ProductCard = ({ title, value, change, icon }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm flex justify-between items-start">
    <div>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    {change && <p className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{change}</p>}
  </div>
);

const QuickActionButton = ({ text, icon, primary = false }) => (
  <button className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm font-medium transition-colors ${primary
    ? 'bg-blue-600 text-white shadow hover:bg-blue-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}>
    {icon}
    <span>{text}</span>
  </button>
);

export default Dashboard;
