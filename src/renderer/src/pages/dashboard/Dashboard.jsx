import React from 'react'
import "./dashboard.css"
import Card from '../../components/cards/Card'
import AreaChart from '../../components/charts/areaChart/AreaChart'
import BarChart from '../../components/charts/barChart/BarChart'
import PieChart from '../../components/charts/pieChar/PieChart'

const cardData = [
  {
    id: 1,
    title: "Customer",
    total: 850,
  },
  {
    id: 2,
    title: 'Transctions',
    total: 15000,

  },
  {
    id: 3,
    title: "Milk Sale",
    total: 4000,

  }, {
    id: 4,
    title: "Inventory",
    total: 760
  }
]






const Dashboard = () => {


  
  return (
    <div className='dashboardContainer'>
      <div className="cardContainer">

        {
          cardData.map((item, idx) => (

            <Card key={idx} data={item} />
          ))
        }
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