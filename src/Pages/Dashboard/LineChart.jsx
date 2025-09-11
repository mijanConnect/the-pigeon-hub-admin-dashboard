// LineChart.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useGetMonthlyRevenueQuery } from "../../redux/apiSlices/dashboardSlice";
import { data } from "autoprefixer";

// Registering chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LineChart = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [chartHeight, setChartHeight] = useState("200px");

  // Fetch revenue data from API
  const { data: revenueData = [], isLoading } =
    useGetMonthlyRevenueQuery(selectedYear);

    console.log(data)

  // Effect to update chart height based on screen size
  useEffect(() => {
    const updateChartHeight = () => {
      if (window.innerWidth < 768) {
        setChartHeight("150px");
      } else if (window.innerWidth < 1024) {
        setChartHeight("200px");
      } else {
        setChartHeight("250px");
      }
    };
    updateChartHeight();
    window.addEventListener("resize", updateChartHeight);
    return () => window.removeEventListener("resize", updateChartHeight);
  }, []);

  // Map API response to chart data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Total Revenue",
        data: months.map((_, idx) => {
          const monthData = revenueData.find((item) => item.month === idx + 1);
          return monthData ? monthData.revenue : 0;
        }),
        fill: false,
        borderColor: "#071952",
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: 2,
        pointBorderColor: "#071952",
        pointBackgroundColor: "#088395",
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: { color: "#088395" },
      },
      tooltip: {
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        backgroundColor: "#088395",
        padding: { x: 20, y: 2 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: () => null,
          label: (context) => `$${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: true, color: "#088395" },
        ticks: {
          color: "#181818",
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          font: { size: window.innerWidth < 768 ? 8 : 12 },
        },
      },
      y: {
        grid: { display: false },
        beginAtZero: false,
        ticks: {
          color: "#181818",
          padding: window.innerWidth < 768 ? 10 : 32,
          callback: (value) => `$${value.toLocaleString()}`,
          font: { size: window.innerWidth < 768 ? 8 : 12 },
        },
      },
    },
  };

  const handleYearChange = (event) =>
    setSelectedYear(parseInt(event.target.value));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold text-secondary">
          Total Revenue
        </h2>
        {/* Uncomment to enable year selection */}
        {/* <select
          value={selectedYear}
          onChange={handleYearChange}
          className="bg-primary text-white py-1 sm:py-2 px-3 sm:px-5 rounded-lg"
          style={{ outline: "none" }}
        >
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select> */}
      </div>
      <div
        style={{ width: "100%", height: chartHeight }}
        className="text-white"
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
