import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Select,
  Tag,
  notification,
  message,
  Input,
} from "antd";
import { EyeOutlined, EditOutlined, FilterOutlined } from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";
import DetailsModalInOrder from "./DetailsModalInOrder";

// Mock data for orders
const initialOrders = [
  {
    key: "1",
    orderId: "PY12345",
    userName: "Alice Johnson",
    source: "Retailer",
    orderBox: 12,
    freeBox: 2,
    amount: "$200",
    status: "Pending",
    image:
      "https://i.ibb.co/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
  },
  {
    key: "3",
    orderId: "PY12346",
    userName: "Alice Johnson",
    source: "Retailer",
    orderBox: 12,
    freeBox: 2,
    amount: "$300",
    status: "Completed",
    image:
      "https://i.ibb.co/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
  },
  {
    key: "4",
    orderId: "PY12345",
    userName: "Alice Johnson",
    source: "Retailer",
    orderBox: 12,
    freeBox: 2,
    amount: "$200",
    status: "Pending",
    image:
      "https://i.ibb.co/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
  },
  {
    key: "5",
    orderId: "PY12346",
    userName: "Alice Johnson",
    source: "Retailer",
    orderBox: 12,
    freeBox: 2,
    amount: "$300",
    status: "Completed",
    image:
      "https://i.ibb.co/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
  },
  {
    key: "6",
    orderId: "PY12345",
    userName: "Alice Johnson",
    source: "Retailer",
    orderBox: 12,
    freeBox: 2,
    amount: "$200",
    status: "Pending",
    image:
      "https://i.ibb.co/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
  },
  {
    key: "7",
    orderId: "PY12346",
    userName: "Alice Johnson",
    source: "Retailer",
    orderBox: 12,
    freeBox: 2,
    amount: "$300",
    status: "Completed",
    image:
      "https://i.ibb.co/5WRNH1d3/fresh-healthy-fruits-straw-basket-generative-ai-188544-11999.jpg",
  },
];

const statusVariants = {
  Pending: "warning",
  Processing: "processing",
  Shipped: "default",
  Delivered: "success",
};

const OrderManagementTable = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders); // State for filtered orders
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [freeBoxes, setFreeBoxes] = useState("");

  // Handle the submit action
  const handleSubmit = () => {
    if (freeBoxes.trim() === "") {
      message.error("Please enter the number of free boxes.");
      return;
    }

    message.success(`Successfully added ${freeBoxes} free boxes!`);
    setFreeBoxes("");
    setDetailModalVisible(false);
  };

  // Status update handler
  const handleStatusUpdate = () => {
    if (selectedOrder && selectedStatus) {
      const updatedOrders = orders.map((order) =>
        order.key === selectedOrder.key
          ? { ...order, status: selectedStatus }
          : order
      );
      setOrders(updatedOrders);
      setStatusModalVisible(false);
      setSelectedStatus(null);
    }
  };

  // Filter handler based on status
  const handleFilterChange = (value) => {
    setSelectedStatus(value);
    if (value) {
      const filteredData = orders.filter((order) => order.status === value);
      setFilteredOrders(filteredData); // Set filtered orders based on the selected status
    } else {
      setFilteredOrders(orders); // Reset the filter when no status is selected
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      align: "center",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      align: "center",
    },
    {
      title: "Order Box",
      dataIndex: "orderBox",
      key: "orderBox",
      align: "center",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      //   render: (status) => <Tag color={statusVariants[status]}>{status}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, order) => (
        <div className="flex space-x-2 justify-center">
          {/* <GradientButton
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(order);
              setDetailModalVisible(true);
            }}
          >
            View Details
          </GradientButton> */}
          <button
            className="border border-primary px-2 py-1.5 rounded-md "
            onClick={() => {
              setSelectedOrder(order);
              setDetailModalVisible(true);
            }}
          >
            View Details
          </button>
          <GradientButton
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedOrder(order);
              setStatusModalVisible(true);
            }}
          >
            Update Status
          </GradientButton>
        </div>
      ),
    },
  ];

  return (
    <div className=" space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order List</h2>
        <div className="flex items-center">
          <Select
            value={selectedStatus}
            onChange={handleFilterChange}
            style={{ width: 200 }}
            placeholder="Select Status"
            allowClear
            className="h-10"
          >
            {Object.keys(statusVariants).map((status) => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>

        </div>
      </div>

      <div className="px-6 pt-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
        <Table
          dataSource={filteredOrders}
          columns={columns}
          pagination={{ pageSize: 5 }}
          bordered={false}
          size="small"
          rowClassName="custom-table"
        />
      </div>

      {/* Order Details Modal */}
      <DetailsModalInOrder
        handleSubmit={handleSubmit}
        detailModalVisible={detailModalVisible}
        setDetailModalVisible={setDetailModalVisible}
        selectedOrder={selectedOrder}
        freeBoxes={freeBoxes}
        setFreeBoxes={setFreeBoxes}
      />

      {/* Status Update Modal */}
      <Modal
        title="Update Order Status"
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setStatusModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleStatusUpdate}>
            Update Status
          </Button>,
        ]}
      >
        <Select
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
          placeholder="Select Order Status"
          style={{ width: "100%" , marginBottom:'20px'}}
        >
          {Object.keys(statusVariants).map((status) => (
            <Select.Option key={status} value={status}>
              {status}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default OrderManagementTable;
