import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChart = () => {
    const [chartData] = useState({
        series: [{
            name: 'Milk Sale',
            data: [1200, 1500, 1800, 1000, 2000, 2200, 1900]
        }],
        options: {
            chart: {
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
                    columnWidth: '50%',
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                title: {
                    text: 'Days of the Week'
                }
            },
            yaxis: {
                title: {
                    text: 'Litres'
                }
            },
            title: {
                text: 'Weekly Milk Sales',
                align: 'center',
                style: { fontSize: '18px' }
            },
            colors: ['#4CAF50']
        }
    });

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
