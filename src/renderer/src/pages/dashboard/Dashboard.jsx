import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaUsers, FaBoxOpen, FaMoneyBillWave, FaChartLine, FaSun, FaMoon, FaChartBar, FaPlus, FaUserPlus, FaFileInvoice, FaBook, FaRegCreditCard, FaShoppingCart, FaFileExport } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Mock Data for components where dynamic data isn't available
const weeklyPerformanceData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Revenue (₹)',
      data: [40000, 48000, 42000, 49000, 51000, 45000, 47000],
      backgroundColor: '#3B82F6',
      borderRadius: 4,
      barPercentage: 0.5,
    },
    {
      label: 'Collection (L)',
      data: [3400, 3800, 3500, 3900, 4000, 3600, 3700],
      backgroundColor: '#10B981',
      borderRadius: 4,
      barPercentage: 0.5,
    },
  ],
};

const recentCollectionsData = [
  { customer: 'Ramesh Kumar', shift: 'Morning', time: '06:32 AM', amount: 12.6, fat: 4.7, snf: 8.9 },
  { customer: 'Priya Sharma', shift: 'Morning', time: '07:15 AM', amount: 8.5, fat: 3.6, snf: 8.2 },
  { customer: 'Suresh Ravi', shift: 'Evening', time: '06:01 PM', amount: 15.2, fat: 4.1, snf: 8.7 },
  { customer: 'Lakshmi Reddy', shift: 'Evening', time: '07:00 PM', amount: 10.8, fat: 4, snf: 8.5 },
  { customer: 'Vijay Singh', shift: 'Morning', time: '08:02 AM', amount: 14.6, fat: 4.1, snf: 8.8 },
];

const Dashboard = () => {
  // Your existing state and hooks remain the same
  // ...

  // Hardcoded data based on the image for demonstration
  const dashboardImage = {
    totalCustomers: 245,
    todaysCollection: 3471.3,
    todaysRevenue: 52069.5,
    profitMargin: 18.5,
    morningShiftCollection: 1850.5,
    eveningShiftCollection: 1620.8,
    morningFat: 4.2,
    morningSnf: 8.5,
    eveningFat: 4.0,
    eveningSnf: 8.7,
    productsInStock: 48,
    productsSoldToday: 32,
  };

  const totalCollection = dashboardImage.morningShiftCollection + dashboardImage.eveningShiftCollection;
  const morningCollectionRate = (dashboardImage.morningShiftCollection / totalCollection) * 100;
  const eveningCollectionRate = (dashboardImage.eveningShiftCollection / totalCollection) * 100;


  return (
    <div className="min-h-screen ">
      <div className="max-w-8xl mx-auto space-y-6">

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Customers"
            value={dashboardImage.totalCustomers}
            icon={<FaUsers className="text-white" />}
            color="bg-blue-500"
          />
          <KpiCard
            title="Today's Collection"
            value={`${dashboardImage.todaysCollection} L`}
            subtitle="morning + evening"
            icon={<FaBoxOpen className="text-white" />}
            color="bg-green-500"
          />
          <KpiCard
            title="Today's Revenue"
            value={`₹${dashboardImage.todaysRevenue.toLocaleString()}`}
            icon={<FaMoneyBillWave className="text-white" />}
            color="bg-yellow-500"
          />
          <KpiCard
            title="Profit Margin"
            value={`${dashboardImage.profitMargin}%`}
            icon={<FaChartLine className="text-white" />}
            color="bg-teal-500"
          />
        </div>

        {/* Shift-wise Collection */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Shift-wise Collection</h2>
          <p className="text-sm text-gray-500 mb-6">Morning vs Evening milk collection comparison</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
            {/* Morning Shift */}
            <ShiftCard
              shift="Morning Shift"
              collection={dashboardImage.morningShiftCollection}
              rate={morningCollectionRate}
              fat={dashboardImage.morningFat}
              snf={dashboardImage.morningSnf}
              icon={<FaSun className="text-yellow-500" />}
              color="yellow"
            />
            {/* Evening Shift */}
            <ShiftCard
              shift="Evening Shift"
              collection={dashboardImage.eveningShiftCollection}
              rate={eveningCollectionRate}
              fat={dashboardImage.eveningFat}
              snf={dashboardImage.eveningSnf}
              icon={<FaMoon className="text-blue-500" />}
              color="blue"
            />
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <p className="text-gray-700 font-semibold">Total Collection: <span className="text-xl text-black">{totalCollection.toFixed(1)} Liters</span></p>
            <p className="text-sm text-gray-500">Average Quality: <span className="font-semibold text-gray-700">FAT: 4.1% - SNF: 8.4%</span></p>
          </div>
        </div>

        {/* Main Content Area: Performance & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Weekly Performance</h2>
              <p className="text-sm text-gray-500 mb-4">Revenue and milk collection details</p>
              <div style={{ height: '300px' }}>
                <Bar
                  data={weeklyPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                      y: { beginAtZero: true, grid: { display: false } },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProductCard title="Products in Stock" value={dashboardImage.productsInStock} change="+5%" icon={<FaBoxOpen />} />
              <ProductCard title="Products Sold Today" value={dashboardImage.productsSoldToday} change="+10%" icon={<FaShoppingCart />} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            <p className="text-sm text-gray-500 mb-6">Frequently used operations</p>
            <div className="space-y-3">
              <QuickActionButton text="New Entry" icon={<FaPlus />} primary />
              <QuickActionButton text="Add Customer" icon={<FaUserPlus />} />
              <QuickActionButton text="Add Product" icon={<FaBoxOpen />} />
              <QuickActionButton text="Generate Bill" icon={<FaFileInvoice />} />
              <QuickActionButton text="View Reports" icon={<FaBook />} />
              <QuickActionButton text="Payments" icon={<FaRegCreditCard />} />
            </div>
          </div>
        </div>

        {/* Recent Collections Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Recent Collections</h2>
          <p className="text-sm text-gray-500 mb-4">Latest milk collection entries</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Shift</th>
                  <th scope="col" className="px-6 py-3">Time</th>
                  <th scope="col" className="px-6 py-3 text-right">Amount (₹)</th>
                  <th scope="col" className="px-6 py-3 text-right">FAT %</th>
                  <th scope="col" className="px-6 py-3 text-right">SNF %</th>
                </tr>
              </thead>
              <tbody>
                {recentCollectionsData.map((item, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.customer}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.shift === 'Morning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.time}</td>
                    <td className="px-6 py-4 text-right">{item.amount.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right">{item.fat.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right">{item.snf.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Reports */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center">
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
        </div>
      </div>
    </div>
  )
}

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

const ShiftCard = ({ shift, collection, rate, fat, snf, icon, color }) => (
  <div>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">{icon}</div>
      <div>
        <p className="font-semibold text-gray-700">{shift}</p>
        <p className="text-xl font-bold text-gray-900">{collection.toFixed(1)} L</p>
      </div>
    </div>
    <div className="flex items-center gap-4 mb-3">
      <p className="text-sm font-semibold">{rate.toFixed(1)}%</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color === 'yellow' ? 'bg-yellow-400' : 'bg-blue-500'}`} style={{ width: `${rate}%` }}></div>
      </div>
      <p className="text-sm font-semibold">{(100 - rate).toFixed(1)}%</p>
    </div>
    <div className="flex justify-between text-sm text-gray-500">
      <p>Avg. FAT: <span className="font-bold text-gray-800">{fat}%</span></p>
      <p>Avg. SNF: <span className="font-bold text-gray-800">{snf}%</span></p>
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
    <p className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{change}</p>
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