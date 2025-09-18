import React, { useEffect, useState } from 'react'
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
} from 'react-icons/fa';
import StatusCardGrid from '../../components/StatusCardGrid'

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
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [cardData, setCardData] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(null); // null = no progress

  useEffect(() => {
    window.api.onUpdateMessage((msg) => {
      setMessage(msg);
    });

    window.api.onUpdateProgress((percent) => {
      setProgress(percent);
    });
  }, []);


  // handle download update
  const handleUpdateClick = () => {
    window.api.upadateStartDownload('start-update-download');
    setIsDownloading(true)
  };



  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6">
      {
        message && message == 'No update available.' && (
          <div className=" w-full bg-slate-900 text-white text-center p-2 text-sm z-50">
            <p>{message}</p>
            {progress == null && (
              <div className="w-full mt-1 bg-gray-700 rounded overflow-hidden h-2">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            <h1 className='text-white text-left'>{progress || 0}%</h1>
          </div>
        )
      }


      {message && message !== 'No update available.' && (
        <button
          onClick={handleUpdateClick}
          disabled={isDownloading}
          className={`px-3 py-1 rounded shadow fixed bottom-20 right-10 z-50 transition 
      ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
    `}
        >
          {isDownloading ? 'Downloading...' : 'Download Update'}
        </button>
      )}

      <StatusCardGrid data={statusData} />



      {/* <button
        onClick={() => window.api.checkForUpdate('check-for-update')}
        className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 transition"
      >
        Check for Update
      </button> */}


      <div className="chartContainer bg-white p-8 rounded-lg shadow-xl">
        <AreaChart />
        <BarChart />
        <PieChart />
      </div>


    </div>
  )
}

export default Dashboard



