import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import useHomeStore from '../../../zustand/useHomeStore'; // Adjust the path if needed

const BarChart = () => {
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [weeklyMilkSale, setWeeklyMilkSale] = useState([]);

  const [chartData, setChartData] = useState({
    series: [{ name: 'Milk Sale', data: [] }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
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
        categories: [], // Updated dynamically
        title: { text: 'Days of the Week' },
      },
      yaxis: {
        title: { text: 'Litres' },
      },
      title: {
        text: 'Weekly Milk Sales',
        align: 'center',
        style: { fontSize: '18px' },
      },
      colors: ['#4CAF50'],
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
    <div id="bar-chart">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
        width={600}
      />
    </div>
  );
};

export default BarChart;