import React from "react";
import { Table, Tag } from "antd";

// Data for the table
const data = [
  {
    key: "1",
    rank: "#4",
    salesRep: "John Doe",
    email: "john@email.com",
    totalSales: "$10,000",
    image: "https://i.ibb.co/4m6b9DW/user-avatar.jpg", // Replace with appropriate image URL
  },
  {
    key: "2",
    rank: "#5",
    salesRep: "John Doe",
    email: "john@email.com",
    totalSales: "$8,000",
    image: "https://i.ibb.co/4m6b9DW/user-avatar.jpg", // Replace with appropriate image URL
  },
  {
    key: "3",
    rank: "#6",
    salesRep: "John Doe",
    email: "john@email.com",
    totalSales: "$8,000",
    image: "https://i.ibb.co/4m6b9DW/user-avatar.jpg", // Replace with appropriate image URL
  },
];

// Columns definition
const columns = [
  {
    title: "Rank",
    dataIndex: "rank",
    key: "rank",
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: "Sales Representatives",
    dataIndex: "salesRep",
    key: "salesRep",
    render: (text, record) => (
      <div className="flex items-center">
        <img
          src={record.image}
          alt={text}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginRight: 8,
          }}
        />
        {text}
      </div>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Total Sales",
    dataIndex: "totalSales",
    key: "totalSales",
  },
];

const SalesTable = () => {
  return (
    <div className="px-6 pt-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
           <Table
             dataSource={data}
             columns={columns}
             pagination={{ pageSize: 7 }}
             bordered={false}
             size="small"
             rowClassName="custom-table"
           />
         </div>
  );
};

export default SalesTable;
