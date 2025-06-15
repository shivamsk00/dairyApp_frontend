import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import useHomeStore from '../../../zustand/useHomeStore';

const PieChart = () => {
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    chart: {
      type: 'pie',
    },
    labels,
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { width: 280 },
          legend: { position: 'bottom' },
        },
      },
    ],
    legend: {
      position: 'right',
      labels: {
        colors: '#374151', // Tailwind gray-700
      },
    },
    title: {
      text: 'Milk Type Distribution',
      align: 'center',
      style: {
        fontSize: '18px',
        color: '#1f2937', // gray-800
      },
    },
    colors: ['#3b82f6', '#f97316', '#10b981', '#f43f5e', '#8b5cf6'], // blue, orange, green, pink, violet
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDashboardData();
        const milkData = res?.data?.milk_type_distribution || [];

        const pieLabels = milkData.map(item =>
          item.type.charAt(0).toUpperCase() + item.type.slice(1) + ' Milk'
        );
        const pieSeries = milkData.map(item => item.percentage);

        setLabels(pieLabels);
        setSeries(pieSeries);
      } catch (err) {
        console.error('Error loading milk type distribution:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500 font-medium">Loading chart...</div>
    );
  }

  return (
    <div className="w-full max-w-full bg-white p-4 rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
        Milk Type Distribution
      </h2>
      <div className="flex justify-center">
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="pie"
          height={350}
        />
      </div>
    </div>
  );
};

export default PieChart;
