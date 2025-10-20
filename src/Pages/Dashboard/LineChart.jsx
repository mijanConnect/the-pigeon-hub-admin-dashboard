// LineChart.jsx
import { Select } from "antd";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useGetMonthlyRevenueQuery } from "../../redux/apiSlices/dashboardSlice";

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

// Custom plugin to draw dotted vertical line on hover
const crosshairPlugin = {
  id: "crosshair",
  afterDatasetsDraw(chart) {
    const {
      ctx,
      tooltip,
      chartArea: { top, bottom },
    } = chart;

    if (tooltip && tooltip.getActiveElements().length > 0) {
      const activePoint = tooltip.getActiveElements()[0];
      const x = activePoint.element.x;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]); // Dotted pattern
      ctx.strokeStyle = "#088395";
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.restore();
    }
  },
};

// Register the plugin
ChartJS.register(crosshairPlugin);

const LineChart = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartHeight, setChartHeight] = useState("200px");

  // Generate last 5 years dynamically
  const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch revenue data from API
  const { data: revenueData = [], isLoading } = useGetMonthlyRevenueQuery(
    selectedYear,
    {
      // ensure RTK Query refetches when the argument (selectedYear) changes
      refetchOnMountOrArgChange: true,
    }
  );

  // console.log(data);

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

  // Determine if there's any non-zero revenue to show
  const dataValues = chartData.datasets[0].data;
  const hasRevenue = dataValues.some((v) => v && Number(v) > 0);
  const maxRevenue = Math.max(...dataValues.map((v) => Number(v) || 0));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
      axis: "x",
    },
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
        grid: {
          display: true,
          color: "#088395",
          drawOnChartArea: true,
          drawTicks: false,
          offset: false,
        },
        ticks: {
          color: "#181818",
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          padding: 12,
          font: { size: window.innerWidth < 768 ? 8 : 12 },
        },
      },
      y: {
        // Keep chart height and axis range but hide horizontal gridlines for the previous design
        grid: { display: false },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: hasRevenue
          ? undefined
          : Math.max(1, Math.ceil(maxRevenue || 100)),
        ticks: {
          color: "#181818",
          padding: window.innerWidth < 768 ? 5 : 10,
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
        <div className="flex items-center gap-2 select-item-home">
          <Select
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
            style={{ width: 110 }}
            className="custom-select-ant-modal"
          >
            {last5Years.map((year) => (
              <Select.Option key={year} value={year}>
                {year}
              </Select.Option>
            ))}
          </Select>
        </div>

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
