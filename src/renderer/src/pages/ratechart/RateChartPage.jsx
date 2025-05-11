import React from 'react'
import './ratechart.css'
const RateChartPage = () => {
  return (
    <div className='rateChartContainer'>
      <div className="snfChartBox">
        <h1 className='text-2xl font-bold'>SNF CHART</h1>
        <div className="snfChartTable"></div>
      </div>
      <div className="rateChartBox"></div>
    </div>
  )
}

export default RateChartPage