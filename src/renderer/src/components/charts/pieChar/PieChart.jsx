import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import useHomeStore from '../../../zustand/useHomeStore'; // Adjust path as needed

const PieChart = () => {
  const fetchDashboardData = useHomeStore(state => state.fetchDashboardData);
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    chart: {
      type: 'pie',
    },
    labels: labels,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: 'bottom' }
      }
    }],
    title: {
      text: 'Milk Type Distribution',
      align: 'center'
    }
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

  if (loading) return <p>Loading chart...</p>;

  return (
    <div id="pie-chart">
      <ReactApexChart
        options={{ ...chartOptions, labels }}
        series={series}
        type="pie"
        height={350}
        width={600}
      />
    </div>
  );
};

export default PieChart;