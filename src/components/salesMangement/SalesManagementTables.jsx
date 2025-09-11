import React, { useState } from "react";
import { Table, Button, message } from "antd";
import DetailsModal from "./DetailsModal";
import StatusUpdateModal from "./StatusUpdateModal";
import GradientButton from "../common/GradiantButton";

// Sample data for the table
const data = [
  {
    key: "1",
    image:
      "https://i.ibb.co.com/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
    orderId: "ORD001",
    retailerName: "Retailer 1",
    salesRep: "John Doe",
    orderBox: 5,
    freeBox: 2,
    amount: 1500,
    status: "Pending",
  },
  {
    key: "2",
    image:
      "https://i.ibb.co.com/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
    orderId: "ORD002",
    retailerName: "Retailer 2",
    salesRep: "Jane Smith",
    orderBox: 8,
    freeBox: 3,
    amount: 2200,
    status: "Shipped",
  },
  {
    key: "3",
    image: "https://ibb.co.com/qMrtQDz8",
    orderId: "ORD003",
    retailerName: "Retailer 3",
    salesRep: "Mike Johnson",
    orderBox: 12,
    freeBox: 5,
    amount: 3100,
    status: "Delivered",
  },
  {
    key: "4",
    orderId: "ORD004",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 4",
    salesRep: "Sarah Lee",
    orderBox: 7,
    freeBox: 2,
    amount: 1850,
    status: "Pending",
  },
  {
    key: "5",
    orderId: "ORD005",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 5",
    salesRep: "David Scott",
    orderBox: 4,
    freeBox: 1,
    amount: 800,
    status: "Shipped",
  },
  {
    key: "6",
    orderId: "ORD006",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 6",
    salesRep: "Emma White",
    orderBox: 10,
    freeBox: 4,
    amount: 2100,
    status: "Delivered",
  },
  {
    key: "7",
    orderId: "ORD007",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 7",
    salesRep: "Oliver Brown",
    orderBox: 9,
    freeBox: 5,
    amount: 2700,
    status: "Pending",
  },
  {
    key: "8",
    orderId: "ORD008",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 8",
    salesRep: "Sophia Wilson",
    orderBox: 6,
    freeBox: 3,
    amount: 1450,
    status: "Shipped",
  },
  {
    key: "9",
    orderId: "ORD009",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 9",
    salesRep: "Liam Jones",
    orderBox: 14,
    freeBox: 6,
    amount: 3700,
    status: "Delivered",
  },
  {
    key: "10",
    orderId: "ORD010",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 10",
    salesRep: "Ava Taylor",
    orderBox: 15,
    freeBox: 7,
    amount: 4200,
    status: "Pending",
  },
  {
    key: "11",
    orderId: "ORD010",
    image: "https://ibb.co.com/qMrtQDz8",
    retailerName: "Retailer 11",
    salesRep: "Ava Taylor",
    orderBox: 15,
    freeBox: 7,
    amount: 4200,
    status: "Pending",
  },
];



const SalesManagementTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
   const [orders, setOrders] = useState([]);
  

  const handleCloseModal = () => {
    setIsModalVisible(false); // Hide modal
  };

   // orders state

   const handleUpdateStatus = (newStatus) => {
     // Update the selected order data's status
     setSelectedOrderData((prev) => ({
       ...prev,
       status: newStatus,
     }));

     // Update the orders list in the state to reflect the new status
     setOrders((prevOrders) =>
       prevOrders.map((order) =>
         order.orderId === selectedOrderData?.orderId
           ? { ...order, status: newStatus }
           : order
       )
     );

     message.success(`Order status updated to "${newStatus}" successfully!`);
     setIsStatusModalVisible(false);
   };




  const columns = [
    {
      title: "OrderId",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      render: (text) => <span className="text-black">{text}</span>,
    },
    {
      title: "Retailer Name",
      dataIndex: "retailerName",
      key: "retailerName",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Sales Rep",
      dataIndex: "salesRep",
      key: "salesRep",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Order Box",
      dataIndex: "orderBox",
      key: "orderBox",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Free Box",
      dataIndex: "freeBox",
      key: "freeBox",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (text) => <span>${text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <GradientButton
            onClick={() => {
              setSelectedOrderData(record);
              setIsModalVisible(true);
            }}
          >
            Details
          </GradientButton>
          <GradientButton
            onClick={() => {
              setSelectedOrderData(record);
              setIsStatusModalVisible(true);
            }}
          >
            Status Update
          </GradientButton>
        </div>
      ),
    },
  ];


  return (
    <div className="">
      <h2 className="text-2xl font-bold my-6">All Sales </h2>
      <div className="px-6 pt-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
        <Table
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered={false}
          size="small"
          className="custom-table" // Custom class for adding borders
        />
        {/* Render the modal with the selected order data */}
        <DetailsModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          orderData={selectedOrderData}
        />

        {/* Status Update Modal */}
        {selectedOrderData && (
          <StatusUpdateModal
            isVisible={isStatusModalVisible}
            onClose={() => setIsStatusModalVisible(false)}
            orderData={selectedOrderData}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
};

export default SalesManagementTable;
