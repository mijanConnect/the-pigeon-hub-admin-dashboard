import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  message,
  Select,
  Row,
  Col,
} from "antd";
import SubscriptionCard from "./SubscriptionCard";
import GradientButton from "../common/GradiantButton";

const SubscriptionTable = () => {
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [currentSubscriber, setCurrentSubscriber] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const data = [
    {
      key: "1",
      name: "John Doe",
      profileCategory: "Retailer",
      email: "john@email.com",
      tier: "Gold",
      billingDate: "March 20, 2025",
      status: "Active",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      additionalImages: [
        "https://randomuser.me/api/portraits/men/1.jpg",
        "https://randomuser.me/api/portraits/men/2.jpg",
      ],
      paymentMethod: "Credit Card",
      subscriptionStart: "January 20, 2025",
      lastPayment: "$99.99 on March 20, 2025",
    },
    {
      key: "2",
      name: "Jane Smith",
      profileCategory: "Wholesaler",
      email: "jane@email.com",
      tier: "Silver",
      billingDate: "March 22, 2025",
      status: "Inactive",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      additionalImages: [
        "https://randomuser.me/api/portraits/women/1.jpg",
        "https://randomuser.me/api/portraits/women/2.jpg",
      ],
      paymentMethod: "PayPal",
      subscriptionStart: "February 15, 2025",
      lastPayment: "$79.99 on March 15, 2025",
    },
    // More subscriber data...
  ];

  const filteredData = data.filter(
    (subscriber) =>
      subscriber.name.toLowerCase().includes(searchName.toLowerCase()) &&
      subscriber.profileCategory
        .toLowerCase()
        .includes(searchCategory.toLowerCase())
  );

  const columns = [
    {
      title: "SL",
      dataIndex: "key",
      key: "key",
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Profile Category",
      dataIndex: "profileCategory",
      key: "profileCategory",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      align: "center",
    },
    {
      title: "Billing Date",
      dataIndex: "billingDate",
      key: "billingDate",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   align: "center",
    // },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <>
          <button
            onClick={() => showDetailsModal(record)}
            className="border px-2 py-1.5 rounded-md border-primary"
          >
            View Details
          </button>
        </>
      ),
      align: "center",
    },
  ];

  const showDetailsModal = (subscriber) => {
    setCurrentSubscriber(subscriber);
    setIsDetailsModalVisible(true);
  };

  const showStatusModal = (subscriber) => {
    setCurrentSubscriber(subscriber);
    setIsStatusModalVisible(true);
  };

  const handleStatusChange = (values) => {
    // Here you can update the status in your state or send it to your backend
    message.success(`Status updated to: ${values.status}`);
    setIsStatusModalVisible(false);
  };

  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
  };

  return (
    <div>
      <SubscriptionCard />

      <div className="mb-6 flex justify-between">
        <h2 className="text-3xl font-bold">All Subscribers</h2>
        <div className="search-box w-3/12 flex gap-5">
          <Input
            placeholder="Search Retailer & Sales Rep. Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ marginRight: 8 }}
            className="py-2"
          />
          {/* <Input
            placeholder="Search by Profile Category"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          /> */}
        </div>
      </div>
      <div className="bg-gradient-to-r from-primary to-secondary px-6 pt-6 rounded-xl">
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered={false}
          size="middle"
          rowClassName="custom-row"
        />
      </div>

      {/* Updated Subscriber Details Modal */}
      <Modal
        centered
        title="Subscriber Details"
        open={isDetailsModalVisible}
        onCancel={handleDetailsModalCancel}
        footer={[
          <Button key="back" onClick={handleDetailsModalCancel}>
            Close
          </Button>,
          <GradientButton
            key="edit"
            onClick={() => {
              handleDetailsModalCancel();
              showStatusModal(currentSubscriber);
            }}
          >
            Update Status
          </GradientButton>,
        ]}
        width={800}
      >
        {currentSubscriber && (
          <Row gutter={[24, 16]} align="middle">
            <Col span={24} md={10} className="flex justify-center">
              {currentSubscriber.avatar && (
                <div className="rounded-full overflow-hidden h-60 w-60 bg-gray-200 border-4 border-gray-100 shadow-sm">
                  <img
                    src={currentSubscriber.avatar || "/default-avatar.png"}
                    alt="Subscriber"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
              )}
            </Col>

            <Col span={24} md={14}>
              <div className="space-y-4 p-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Name
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {currentSubscriber.name}
                  </p>
                </div>

                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Email
                  </h3>
                  <p className="text-gray-700">{currentSubscriber.email}</p>
                </div>

                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Profile Category
                  </h3>
                  <p className="text-gray-700">Retailer</p>
                </div>

                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Tier Subscription
                  </h3>
                  <p className="text-gray-700">Gold</p>
                </div>

                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Billing Date
                  </h3>
                  <p className="text-gray-700">
                    {currentSubscriber.billingDate}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        centered
        title="Update Subscriber Status"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={{ status: currentSubscriber?.status }}
          onFinish={handleStatusChange}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select the status" }]}
          >
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <GradientButton type="primary" htmlType="submit">
              Update Status
            </GradientButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionTable;
