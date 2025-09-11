import React from "react";
import { FaCalendarDay, FaDollarSign } from "react-icons/fa";
import { HiMiniUsers } from "react-icons/hi2";
import { MdArrowUpward, MdOutlineHome } from "react-icons/md";
import { PiHouseLine } from "react-icons/pi";
import { Bar } from "react-chartjs-2";
import LineChart from "./LineChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import OrderTable from "../../components/home/OrderTable";
import SalesLeaderBoard from "../../components/home/SalesLeaderBoard";
import HomeCard from "../../components/home/HomeCard";
import { Marchant } from "../../components/common/Svg";
import { People } from "../../components/common/Svg";
import { Pending } from "../../components/common/Svg";
import { SubscriptionManagement } from "../../components/common/Svg";
import PigeonIcon from "../../../src/assets/pigeon.png";
import VerifyIcon from "../../../src/assets/verify.png";
import AwardIcon from "../../../src/assets/win.png";
import SubscriptionIcon from "../../../src/assets/subscription.png";
import { Select } from "antd";
import { useGetOverviewStatsQuery } from "../../redux/apiSlices/dashboardSlice";
const { Option } = Select;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const data = {
    labels: [
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
    ],
    datasets: [
      {
        label: "Subscriptions",
        data: [64, 27, 83, 90, 87, 85, 70, 40, 32, 74, 65, 70],
        backgroundColor: "#3FC7EE",
        borderColor: "#A1A1A1",
        borderWidth: 1,
        barThickness: 24,
        maxBarThickness: 24,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: "#A1A1A1",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          suggestedMin: 0,
          suggestedMax: 100,
        },
        grid: {
          display: true,
          lineWidth: 2,
        },
      },
    },
  };

  const { data: stats, isLoading } = useGetOverviewStatsQuery();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-2 md:p-4 space-y-4 md:space-y-6">
      {/* Home Card */}
      {/* <div>
        <HomeCard />
      </div> */}

      {/* Line Chart Section */}
      {/* <div className="w-full">
        <div className="w-full bg-primary p-3 md:p-4 lg:p-6 rounded-lg">
          <LineChart />
        </div>
      </div> */}

      <div className="flex flex-col lg:flex-row gap-6 border-primary rounded-lg">
        {/* Line Chart Section */}
        <div className="flex-1 w-full lg:w-2/3 border border-primary rounded-lg p-6">
          <LineChart />
        </div>

        {/* Card Section */}
        <div className="w-full lg:w-1/3 border border-primary p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-secondary text-[24px] font-bold">Statistics</h2>
            <div className="border border-primary text-primary px-4 py-1 rounded-md">
              <p>7 Days</p>
            </div>
            {/* <Select
              defaultValue="7days"
              style={{ width: 100 }}
              className="custom-select-ant-modal"
            >
              <Option value="1day">1 Day</Option>
              <Option value="7days">7 Days</Option>
              <Option value="1month">1 Month</Option>
            </Select> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-auto lg:h-[240px]">
            {/* Total Pigeons */}
            <div className="bg-white border border-primary rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-baseline">
                <h2 className="text-center text-[16px] font-semibold mb-1">
                  Total Pigeon
                </h2>
                <h3 className="text-secondary text-[24px] text-center font-semibold flex items-center gap-3">
                  <img src={PigeonIcon} alt="Logo" /> {stats?.totalPigeons || 0}
                </h3>
              </div>
            </div>

            {/* Verified Pigeons */}
            <div className="bg-white border border-primary rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-baseline">
                <h2 className="text-center text-[16px] font-semibold mb-1">
                  Verified Pigeon
                </h2>
                <h3 className="text-secondary text-[24px] text-center font-semibold flex items-center gap-3">
                  <img src={VerifyIcon} alt="Logo" />{" "}
                  {stats?.verifiedPigeons || 0}
                </h3>
              </div>
            </div>

            {/* Iconic Pigeons */}
            <div className="bg-white border border-primary rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-baseline">
                <h2 className="text-center text-[16px] font-semibold mb-1">
                  Iconic Pigeon
                </h2>
                <h3 className="text-secondary text-[24px] text-center font-semibold flex items-center gap-3">
                  <img src={AwardIcon} alt="Logo" /> {stats?.iconPigeons || 0}
                </h3>
              </div>
            </div>

            {/* Subscription Revenue */}
            <div className="bg-white border border-primary rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-baseline">
                <h2 className="text-center text-[16px] font-semibold mb-1">
                  Subscription Revenue
                </h2>
                <h3 className="text-secondary text-[24px] text-center font-semibold flex items-center gap-3">
                  <img src={SubscriptionIcon} alt="Logo" /> $
                  {stats?.subscriptionRevenue || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Table */}
      <div>
        <OrderTable />
        {/* <SalesLeaderBoard /> */}
      </div>
    </div>
  );
};

export default Home;
