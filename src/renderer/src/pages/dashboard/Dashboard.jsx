import React, { useEffect, useState } from 'react'
import "./dashboard.css"
import Card from '../../components/cards/Card'
import AreaChart from '../../components/charts/areaChart/AreaChart'
import BarChart from '../../components/charts/barChart/BarChart'
import PieChart from '../../components/charts/pieChar/PieChart'
import useHomeStore from '../../zustand/useHomeStore'







const Dashboard = () => {
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [cardData, setCardData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchDashboardData();
      const data = res?.data || {};

      // Construct updated cards
      const updatedCards = [
        {
          id: 1,
          title: "Customer",
          total: data.summary?.customers ?? 0,
        },
        {
          id: 2,
          title: "Today Milk Purchase",
          total: `${data.total_milk?.total_milk_purchased ?? 0} Ltr`,
        },
        {
          id: 3,
          title: "Today Milk Sale",
          total: `${data.total_milk?.total_milk_collected ?? 0} Ltr`,
        },
        {
          id: 4,
          title: "Inventory",
          total: data.summary?.inventory ?? 0,
        }
      ];

      setCardData(updatedCards);
    };

    fetchData();
  }, []);


  return (
    <div className='dashboardContainer'>
      <div className="cardContainer">

      

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {cardData.map((item) => (
            <Card key={item.id} data={item} />
          ))}
        </div>


      </div>
      <div className="chartContainer">
        <AreaChart />
        <BarChart />
        <PieChart />
      </div>
    </div>
  )
}

export default Dashboard