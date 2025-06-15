import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const AreaChart = () => {
  const [state] = useState({
    series: [
      {
        name: 'Series 1',
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: 'Series 2',
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      grid: {
        borderColor: '#e5e7eb',
        row: {
          colors: ['#f9fafb', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19T00:00:00.000Z',
          '2018-09-19T01:30:00.000Z',
          '2018-09-19T02:30:00.000Z',
          '2018-09-19T03:30:00.000Z',
          '2018-09-19T04:30:00.000Z',
          '2018-09-19T05:30:00.000Z',
          '2018-09-19T06:30:00.000Z',
        ],
        labels: {
          style: {
            colors: '#6b7280',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
          },
        },
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
      colors: ['#3b82f6', '#10b981'],
      legend: {
        position: 'top',
        labels: {
          colors: '#374151',
        },
      },
    },
  });

  return (
    <div className="w-full max-w-full bg-white p-4 rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Milk Trends</h2>
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="area"
        height={350}
      />
    </div>
  );
};

export default AreaChart;
