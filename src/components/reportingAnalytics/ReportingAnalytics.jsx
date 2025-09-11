// src/components/MonthlyStatsChart.jsx
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Table, Select, Button } from "antd";
import "antd/dist/reset.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useGetAnalyticsQuery } from "../../redux/apiSlices/analysisSlice";

// hook from RTK Query slice

const { Option } = Select;

// Custom 3D Bar with watermark (unchanged)
const Custom3DBarWithWatermark = ({ x, y, width, height, fill }) => {
  const depth = 10;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={0.4}
      />
      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${
          y - depth
        } ${x + width},${y}`}
        fill={fill}
        opacity={0.6}
      />
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${
          x + width + depth
        },${y + height} ${x + width},${y + height}`}
        fill={fill}
        opacity={0.7}
      />
    </g>
  );
};

export default function MonthlyStatsChart() {
  // ---- fetch API data ----
  const { data, isLoading, error } = useGetAnalyticsQuery();
  const chartRows = data?.chartData || [];

  const metricOptions = ["Revenue", "User Activity", "Pedigree Statistics"];
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [chartType, setChartType] = useState("Bar");

  // Dropdown Date Range (all unique)
  const monthYearOptions = [
    "All Months",
    ...new Set(chartRows.map((d) => d.date)),
  ];
  const [selectedMonthYear, setSelectedMonthYear] = useState("All Months");

  // Filtered rows
  const filteredData = useMemo(
    () =>
      chartRows.filter(
        (d) =>
          selectedMonthYear === "All Months" || d.date === selectedMonthYear
      ),
    [chartRows, selectedMonthYear]
  );

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Revenue", dataIndex: "Revenue", key: "Revenue" },
    {
      title: "User Activity",
      dataIndex: "User Activity",
      key: "User Activity",
    },
    {
      title: "Pedigree Statistics",
      dataIndex: "Pedigree Statistics",
      key: "Pedigree Statistics",
    },
  ];

  if (isLoading) return <p>Loading analytics…</p>;
  if (error)
    return (
      <p className="text-red-500">Failed: {error?.data || error?.error}</p>
    );

  return (
    <div>
      {/* Dropdowns */}
      <div className="mt-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-wrap gap-5">
            {/* Date Range */}
            <div className="flex flex-col w-36">
              <label className="mb-1 text-gray-800">Date Range</label>
              <Select
                value={selectedMonthYear}
                onChange={setSelectedMonthYear}
                className="custom-select-ant-white"
                style={{ width: "100%" }}
              >
                {monthYearOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Metric */}
            <div className="flex flex-col w-36">
              <label className="mb-1 text-gray-800">Category</label>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                placeholder="Select Metric"
                className="custom-select-ant-white"
                style={{ width: "100%" }}
              >
                <Option value="all">All Metrics</Option>
                {metricOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Export */}
          <div className="flex items-end">
            <Button
              type="primary"
              className="py-5 px-7 font-semibold text-[16px]"
              onClick={() => {
                const exportData = filteredData.map((row) => ({
                  Date: row.date,
                  Revenue: row["Revenue"] || 0,
                  "User Activity": row["User Activity"] || 0,
                  "Pedigree Statistics": row["Pedigree Statistics"] || 0,
                }));
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
                const excelBuffer = XLSX.write(workbook, {
                  bookType: "xlsx",
                  type: "array",
                });
                const blob = new Blob([excelBuffer], {
                  type: "application/octet-stream",
                });
                saveAs(blob, "Monthly_Report.xlsx");
              }}
            >
              Export Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="p-4 rounded-lg border"
        style={{ width: "100%", height: 400, marginTop: "40px" }}
      >
        <ResponsiveContainer>
          {chartType === "Bar" ? (
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(selectedMetric === "all" || selectedMetric === "Revenue") && (
                <Bar
                  dataKey="Revenue"
                  fill="#7086FD"
                  shape={(p) => <Custom3DBarWithWatermark {...p} />}
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "User Activity") && (
                <Bar
                  dataKey="User Activity"
                  fill="#6FD195"
                  shape={(p) => <Custom3DBarWithWatermark {...p} />}
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Pedigree Statistics") && (
                <Bar
                  dataKey="Pedigree Statistics"
                  fill="#FFAE4C"
                  shape={(p) => <Custom3DBarWithWatermark {...p} />}
                />
              )}
            </BarChart>
          ) : chartType === "Line" ? (
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(selectedMetric === "all" || selectedMetric === "Revenue") && (
                <Line type="monotone" dataKey="Revenue" stroke="#7086FD" />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "User Activity") && (
                <Line
                  type="monotone"
                  dataKey="User Activity"
                  stroke="#6FD195"
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Pedigree Statistics") && (
                <Line
                  type="monotone"
                  dataKey="Pedigree Statistics"
                  stroke="#FFAE4C"
                />
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(selectedMetric === "all" || selectedMetric === "Revenue") && (
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#7086FD"
                  fill="#7086FD"
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "User Activity") && (
                <Area
                  type="monotone"
                  dataKey="User Activity"
                  stroke="#6FD195"
                  fill="#6FD195"
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Pedigree Statistics") && (
                <Area
                  type="monotone"
                  dataKey="Pedigree Statistics"
                  stroke="#FFAE4C"
                  fill="#FFAE4C"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Ant Design Table (optional)
      <div style={{ marginTop: "50px" }}>
        <h1 className="text-[22px] font-bold mb-2">Data Table</h1>
        <Table
          bordered={false}
          size="small"
          rowClassName="custom-row"
          columns={columns.filter((c) => selectedMetric === "all" || c.dataIndex === selectedMetric)}
          dataSource={filteredData.map((r, i) => ({ ...r, key: i }))}
          pagination={{ pageSize: 6 }}
        />
      </div> */}
    </div>
  );
}
