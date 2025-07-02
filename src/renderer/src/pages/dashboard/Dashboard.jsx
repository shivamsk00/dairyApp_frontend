import React, { useEffect, useState } from 'react'
import "./dashboard.css"
import Card from '../../components/cards/Card'
import AreaChart from '../../components/charts/areaChart/AreaChart'
import BarChart from '../../components/charts/barChart/BarChart'
import PieChart from '../../components/charts/pieChar/PieChart'
import useHomeStore from '../../zustand/useHomeStore'
import { toast } from 'react-toastify'







const Dashboard = () => {
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [cardData, setCardData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchDashboardData();
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



  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6">

      {
        message && (
          <div className=" w-full bg-slate-900 text-white text-center p-2 text-sm z-50">
            <p>{message}</p>
            {progress !== null && (
              <div className="w-full mt-1 bg-gray-700 rounded overflow-hidden h-2">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )
      }



      <div className="chartContainer bg-white p-8 rounded-lg shadow-xl">
        <AreaChart />
        <BarChart />
        <PieChart />
      </div>
    </div>
  )
}

export default Dashboard