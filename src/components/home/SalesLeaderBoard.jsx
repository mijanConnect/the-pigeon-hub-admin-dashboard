import React, { useState } from "react";
import { Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

// Sample Data with Unique Keys
const dataSource = [
  {
    rank: 1,
    salesRepName: "Alice Johnson",
    totalSales: 50000,
    commission: 7500,
    tier: "Gold",
    status: "Active",
  },
  {
    rank: 2,
    salesRepName: "John Doe",
    totalSales: 45000,
    commission: 6800,
    tier: "Gold",
    status: "Active",
  },
  {
    rank: 3,
    salesRepName: "Emma Watson",
    totalSales: 42000,
    commission: 6500,
    tier: "Silver",
    status: "Active",
  },
  {
    rank: 4,
    salesRepName: "Michael Clark",
    totalSales: 39000,
    commission: 6100,
    tier: "Silver",
    status: "Active",
  },
  {
    rank: 5,
    salesRepName: "Sophia Lee",
    totalSales: 37000,
    commission: 5700,
    tier: "Silver",
    status: "Active",
  },
  {
    rank: 6,
    salesRepName: "David Miller",
    totalSales: 35000,
    commission: 5300,
    tier: "Bronze",
    status: "Inactive",
  },
  {
    rank: 7,
    salesRepName: "Robert Brown",
    totalSales: 33000,
    commission: 5000,
    tier: "Bronze",
    status: "Inactive",
  },
  {
    rank: 8,
    salesRepName: "Liam Wilson",
    totalSales: 31000,
    commission: 4800,
    tier: "Bronze",
    status: "Inactive",
  },
  {
    rank: 9,
    salesRepName: "Olivia Martinez",
    totalSales: 29000,
    commission: 4500,
    tier: "Bronze",
    status: "Inactive",
  },
  {
    rank: 10,
    salesRepName: "Ethan Taylor",
    totalSales: 27000,
    commission: 4200,
    tier: "Bronze",
    status: "Inactive",
  },
];


const columns = [
  { title: "Rank", dataIndex: "rank", key: "rank", align: "center" },
  {
    title: "Sales Rep Name",
    dataIndex: "salesRepName",
    key: "salesRepName",
    align: "center",
  },
  {
    title: "Total Sales",
    dataIndex: "totalSales",
    key: "totalSales",
    align: "center",
  },
  {
    title: "Commission",
    dataIndex: "commission",
    key: "commission",
    align: "center",
  },
  // { title: "Tier", dataIndex: "tier", key: "tier", align: "center" },
  // { title: "Status", dataIndex: "status", key: "status", align: "center" },
];


const SalesLeaderBoard = () => {
  const [searchText, setSearchText] = useState("");

  // Search handler
  const handleSearch = (value) => setSearchText(value);

  // Filtering the data based on the search text
  const filteredData = dataSource.filter(
    (item) =>
      // item.rank.toLowerCase().includes(searchText.toLowerCase()) ||
      item.salesRepName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.salesRepName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sales Rep Leaderboard</h1>
        {/* <Input
          placeholder="Search Order, Retailer, Sales"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
          className="w-1/3 py-2"
        /> */}
      </div>
      {/* Table Container with Gradient Background */}
      <div className="px-6 pt-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 7 }}
          bordered={false}
          size="small"
          rowClassName="custom-table"
        />
      </div>
    </div>
  );
};

export default SalesLeaderBoard;
