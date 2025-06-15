import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import useHomeStore from '../../../zustand/useHomeStore';

const BarChart = () => {
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [weeklyMilkSale, setWeeklyMilkSale] = useState([]);

  const [chartData, setChartData] = useState({
    series: [{ name: 'Milk Sale', data: [] }],
    options: {
      chart: {
        type: 'bar',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [],
        title: { text: 'Days of the Week' },
        labels: {
          style: { colors: '#4B5563' }, // gray-600
        },
      },
      yaxis: {
        title: { text: 'Litres' },
        labels: {
          style: { colors: '#4B5563' },
        },
      },
      title: {
        text: 'Weekly Milk Sales',
        align: 'center',
        style: {
          fontSize: '18px',
          color: '#1F2937', // gray-800
        },
      },
      colors: ['#3B82F6'], // Tailwind blue-500
      responsive: [
        {
          breakpoint: 640,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '60%',
              },
            },
            chart: {
              height: 300,
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchDashboardData();
      if (response?.data?.weekly_milk_sale) {
        setWeeklyMilkSale(response.data.weekly_milk_sale);
      }
    };
    fetchData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (weeklyMilkSale.length > 0) {
      const categories = weeklyMilkSale.map(item => item.day);
      const salesData = weeklyMilkSale.map(item => parseFloat(item.total_sale));

      setChartData(prev => ({
        ...prev,
        series: [{ name: 'Milk Sale', data: salesData }],
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: categories,
          },
        },
      }));
    }
  }, [weeklyMilkSale]);

  return (
    <div className="w-full max-w-full bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
        Weekly Milk Sales
      </h2>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default BarChart;
