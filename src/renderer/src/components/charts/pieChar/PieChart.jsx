import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const PieChart = () => {
  const [chartData] = useState({
    series: [44, 33, 23], // Example values
    options: {
      chart: {
        type: 'pie',
      },
      labels: ['Cow Milk', 'Buffalo Milk', 'Other'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      title: {
        text: 'Milk Type Distribution',
        align: 'center'
      }
    }
  });

  return (
    <div id="pie-chart">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="pie"
        height={350}
        width={600}
      />
    </div>
  );
};

export default PieChart;
