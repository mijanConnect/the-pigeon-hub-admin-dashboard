import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Input,
  Form,
  Space,
  Select,
  Row,
  Col,
} from "antd";
import GradientButton from "../../common/GradiantButton";
import { IoEyeSharp } from "react-icons/io5";
import { MdArrowBackIosNew, MdDelete } from "react-icons/md";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const RetailerInfo = ({ salesRep }) => {
  const router = useNavigate()
  console.log(salesRep?.name); // Check the value of salesRep.name
  const [data, setData] = useState([
    {
      key: "1",
      sl: "1",
      retailerName: "John Doe",
      email: "johndoe@example.com",
      assignedSalesRep: "Alice Johnson",
      TotalOrderPlaced: "50 Boxes",
      TotalSales: "$300",
      SubscriptionTier: "Gold",
      shippingAddress: "123 Main St, New York, NY",
      nameOnCard: "John Doe",
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvc: "123",
      zipCode: "10001",
    },
    {
      key: "2",
      sl: "2",
      retailerName: "Jane Smith",
      email: "janesmith@example.com",
      assignedSalesRep: "Alice Johnson",
      TotalOrderPlaced: "35 Boxes",
      TotalSales: "$210",
      SubscriptionTier: "Silver",
      shippingAddress: "456 Oak St, Chicago, IL",
      nameOnCard: "Jane Smith",
      cardNumber: "5555555555554444",
      expiry: "10/26",
      cvc: "456",
      zipCode: "60601",
    },
    {
      key: "3",
      sl: "3",
      retailerName: "Robert Johnson",
      email: "robert@example.com",
      assignedSalesRep: "Alice Johnson",
      TotalOrderPlaced: "65 Boxes",
      TotalSales: "$390",
      SubscriptionTier: "Gold",
      shippingAddress: "789 Pine St, Los Angeles, CA",
      nameOnCard: "Robert Johnson",
      cardNumber: "3782822463100005",
      expiry: "08/27",
      cvc: "789",
      zipCode: "90001",
    },
    {
      key: "4",
      sl: "4",
      retailerName: "Lisa Williams",
      email: "lisa@example.com",
      assignedSalesRep: "Alice Johnson",
      TotalOrderPlaced: "42 Boxes",
      TotalSales: "$252",
      SubscriptionTier: "Bronze",
      shippingAddress: "321 Elm St, Dallas, TX",
      nameOnCard: "Lisa Williams",
      cardNumber: "6011111111111117",
      expiry: "05/28",
      cvc: "321",
      zipCode: "75201",
    },
  ]);

  const [commission, setCommission] = useState([
    {
      key: "1",
      OrderID: "#123456",
      OrderDate: "March 03, 2025",
      ProductName: "Premium Coffee Box",
      OrderBox: 12,
      SalesAmount: "$300",
      Commission: "$30",
      Status: "Pending",
    },
    {
      key: "2",
      OrderID: "#123457",
      OrderDate: "March 05, 2025",
      ProductName: "Deluxe Tea Set",
      OrderBox: 8,
      SalesAmount: "$240",
      Commission: "$24",
      Status: "Completed",
    },
    {
      key: "3",
      OrderID: "#123458",
      OrderDate: "March 10, 2025",
      ProductName: "Organic Snack Box",
      OrderBox: 15,
      SalesAmount: "$375",
      Commission: "$37.50",
      Status: "Pending",
    },
    {
      key: "4",
      OrderID: "#123459",
      OrderDate: "March 15, 2025",
      ProductName: "Gourmet Chocolate Box",
      OrderBox: 10,
      SalesAmount: "$350",
      Commission: "$35",
      Status: "Completed",
    },
  ]);

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingRetailer, setViewingRetailer] = useState(null);
  const [isTargetModalVisible, setIsTargetModalVisible] = useState(false);

  // Set the initial targetSalesRep state using the salesRep prop (if available)
  const [targetSalesRep, setTargetSalesRep] = useState({
    name: salesRep?.name || "", // Set initial value from props, fallback to empty string
    amount: "",
  });

  const statusOptions = ["Active", "Inactive", "Pending", "Suspended"];

  // Update targetSalesRep state when salesRep prop changes
  useEffect(() => {
    if (salesRep?.name) {
      setTargetSalesRep((prevState) => ({
        ...prevState,
        name: salesRep.name,
      }));
    }
  }, [salesRep]);

  const showModal = (record = null) => {
    if (record) {
      setSelectedUser(record);
      form.setFieldsValue({
        name: record.retailerName,
        email: record.email,
        salesRep: record.assignedSalesRep,
        shippingAddress: record.shippingAddress,
        accountStatus: record.status || "Active",
        nameOnCard: record.nameOnCard,
        cardNumber: record.cardNumber,
        expiry: record.expiry,
        cvc: record.cvc,
        zipCode: record.zipCode,
      });
    } else {
      setSelectedUser(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const showTargetModal = () => {
    setIsTargetModalVisible(true);
  };

  const showViewModal = (record) => {
    setViewingRetailer(record);
    setIsViewModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsViewModalVisible(false);
    setIsTargetModalVisible(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const handleSave = (values) => {
    if (selectedUser) {
      // Update existing record
      setData((prevData) =>
        prevData.map((item) =>
          item.key === selectedUser.key
            ? {
                ...item,
                retailerName: values.name,
                email: values.email,
                assignedSalesRep: values.salesRep,
                shippingAddress: values.shippingAddress,
                status: values.accountStatus,
                nameOnCard: values.nameOnCard,
                cardNumber: values.cardNumber,
                expiry: values.expiry,
                cvc: values.cvc,
                zipCode: values.zipCode,
              }
            : item
        )
      );
    } else {
      // Add new record
      const newRecord = {
        key: String(data.length + 1),
        sl: String(data.length + 1),
        retailerName: values.name,
        email: values.email,
        assignedSalesRep: values.salesRep,
        TotalOrderPlaced: "0 Boxes",
        TotalSales: "$0",
        SubscriptionTier: "Basic",
        shippingAddress: values.shippingAddress,
        status: values.accountStatus,
        nameOnCard: values.nameOnCard,
        cardNumber: values.cardNumber,
        expiry: values.expiry,
        cvc: values.cvc,
        zipCode: values.zipCode,
      };
      setData([...data, newRecord]);
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleTargetSave = () => {
    // Handle the saving logic for target sales reps
    console.log("Target Sales Rep Saved:", targetSalesRep);
    setIsTargetModalVisible(false);
  };

  const handleDelete = (key) => {
    setData(data.filter((item) => item.key !== key));
  };

  const columns = [
    { title: "SL", dataIndex: "sl", align: "center" },
    { title: "Retailer Name", dataIndex: "retailerName", align: "center" },
    { title: "Email", dataIndex: "email", align: "center" },
    {
      title: "Assigned Sales Rep",
      dataIndex: "assignedSalesRep",
      align: "center",
    },
    {
      title: "Total Order Placed",
      dataIndex: "TotalOrderPlaced",
      align: "center",
    },
    { title: "Total Sales", dataIndex: "TotalSales", align: "center" },
    {
      title: "Subscription Tier",
      dataIndex: "SubscriptionTier",
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <IoEyeSharp
            className="text-xl cursor-pointer"
            onClick={() => showViewModal(record)}
          />
          <MdDelete
            className="text-xl cursor-pointer text-red-500"
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  const commissionColumns = [
    { title: "Order ID", dataIndex: "OrderID", align: "center" },
    { title: "Order Date", dataIndex: "OrderDate", align: "center" },
    { title: "Product Name", dataIndex: "ProductName", align: "center" },
    {
      title: "Order Box",
      dataIndex: "OrderBox",
      align: "center",
    },
    {
      title: "Sales Amount",
      dataIndex: "SalesAmount",
      align: "center",
    },
    { title: "Commission", dataIndex: "Commission", align: "center" },
    {
      title: "Status",
      dataIndex: "Status",
      align: "center",
    },
  ];

  // Retailer View Modal Component inline
  const RetailerViewModal = ({ visible, onClose, retailerData }) => {
    return (
      <Modal
        title=""
        centered
        visible={visible}
        onCancel={onClose}
        footer={[
          <Button
            key="done"
            type="primary"
            onClick={onClose}
            className="bg-teal-500 hover:bg-teal-600"
          >
            Done
          </Button>,
        ]}
        width={500}
      >
        <div className="retailer-info-container">
          <h2 className="text-xl font-bold mb-4">Retailer Information</h2>

          <div className="mb-4">
            <p className="font-medium mb-1">
              User Name: {retailerData?.retailerName}
            </p>
            <p className="font-medium mb-1">
              Assign Sales Rep: {retailerData?.assignedSalesRep}
            </p>
            <p className="font-medium mb-1">Email: {retailerData?.email}</p>
            <p className="font-medium mb-1">
              Shipping Address:{" "}
              {retailerData?.shippingAddress || "example shipping address"}
            </p>
          </div>

          <h2 className="text-xl font-bold mb-4">Payment Information</h2>

          <div>
            <p className="font-medium mb-1">
              Name On Card:{" "}
              {retailerData?.nameOnCard || retailerData?.retailerName}
            </p>
            <p className="font-medium mb-1">
              Card Number: {retailerData?.cardNumber || "1234567891023"}
            </p>
            <p className="font-medium mb-1">
              mm/yy: {retailerData?.expiry || "25/29"}
            </p>
            <p className="font-medium mb-1">
              CVC: {retailerData?.cvc || "956"}
            </p>
            <p className="font-medium mb-1">
              Zip Code: {retailerData?.zipCode || "123456"}
            </p>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <div className="flex justify-between mb-10 mt-10">
        <div className="flex items-center gap-2">
          <MdArrowBackIosNew
            onClick={() => router("/salesRepsManage")}
            className="cursor-pointer"
          />
          <h1 className="text-2xl font-bold">Retailer List</h1>
        </div>
        <div className="flex gap-4">
          {/* <GradientButton
            onClick={showTargetModal} 
          >
            Set Target Sales Reps
          </GradientButton> */}
          <GradientButton onClick={() => showModal()}>
            Add Retailer
          </GradientButton>
        </div>
      </div>

      <div className="px-6 pt-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
        <Table
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered
          size="small"
          rowClassName="custom-row"
        />
      </div>

      <div>
        <h3 className="text-2xl font-bold pt-10">Commission Details</h3>
        <div className="px-6 pt-6 mt-5 rounded-lg bg-gradient-to-r from-primary to-secondary">
          <Table
            dataSource={commission}
            columns={commissionColumns}
            pagination={{ pageSize: 10 }}
            bordered
            size="small"
            rowClassName="custom-row"
          />
        </div>
      </div>

      {/* Add/Edit Retailer Modal */}
      <Modal
        title={selectedUser ? "Edit Retailer Information" : "Add New Retailer"}
        visible={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalOpen(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            className="bg-teal-500 hover:bg-teal-600"
          >
            {selectedUser ? "Save Changes" : "Add Retailer"}
          </Button>,
        ]}
        width={800}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Retailer Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter retailer name" },
                ]}
              >
                <Input placeholder="Name" className="p-2 rounded" />
              </Form.Item>

              <Form.Item
                label="Assign Sales Rep"
                name="salesRep"
                rules={[
                  { required: true, message: "Please select a sales rep" },
                ]}
              >
                <Select
                  placeholder="Select Sales Rep Name"
                  className="w-full"
                  suffixIcon={<span className="text-teal-500">▼</span>}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Select.Option key={i} value={`Sales Rep ${i + 1}`}>
                      Sales Rep {i + 1}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email address" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input placeholder="Email" className="p-2 rounded" />
              </Form.Item>

              <Form.Item
                label="Shipping Address"
                name="shippingAddress"
                rules={[
                  { required: true, message: "Please enter shipping address" },
                ]}
              >
                <Input placeholder="Shipping address" className="p-2 rounded" />
              </Form.Item>

              <Form.Item
                label="Account Status"
                name="accountStatus"
                rules={[
                  { required: true, message: "Please select account status" },
                ]}
              >
                <Select placeholder="Select Account Status" className="w-full">
                  {statusOptions.map((status) => (
                    <Select.Option key={status} value={status}>
                      {status}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Right Column - Payment Information */}
            <Col xs={24} md={12}>
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-4">
                  Payment Information
                </h2>

                <Form.Item
                  name="nameOnCard"
                  rules={[
                    { required: true, message: "Please enter name on card" },
                  ]}
                >
                  <Input
                    placeholder="Name On Card"
                    className="p-2 rounded mb-3"
                  />
                </Form.Item>

                <Form.Item
                  name="cardNumber"
                  rules={[
                    { required: true, message: "Please enter card number" },
                    {
                      pattern: /^[0-9]{13,19}$/,
                      message: "Please enter a valid card number",
                    },
                  ]}
                >
                  <Input
                    placeholder="Card Number"
                    className="p-2 rounded mb-3"
                    suffix={
                      <Space>
                        <span className="text-red-500">●</span>
                        <span className="text-gray-900 bg-yellow-500 px-1 rounded">
                          ■
                        </span>
                        <span className="text-blue-500">■</span>
                      </Space>
                    }
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="expiry"
                      rules={[
                        { required: true, message: "Required" },
                        {
                          pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                          message: "Format: MM/YY",
                        },
                      ]}
                    >
                      <Input placeholder="mm/yy" className="p-2 rounded mb-3" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="cvc"
                      rules={[
                        { required: true, message: "Required" },
                        { pattern: /^[0-9]{3,4}$/, message: "Invalid CVC" },
                      ]}
                    >
                      <Input
                        placeholder="CVC"
                        className="p-2 rounded mb-3"
                        suffix={<LockOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="zipCode"
                  rules={[
                    { required: true, message: "Please enter zip code" },
                    {
                      pattern: /^[0-9]{5}(-[0-9]{4})?$/,
                      message: "Please enter a valid zip code",
                    },
                  ]}
                >
                  <Input placeholder="Zip Code" className="p-2 rounded" />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Set Target Modal */}
      <Modal
        title="Set Target Sales Reps"
        visible={isTargetModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleTargetSave}>
          <Form.Item
            name="name"
            label="Sales Rep Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input
              value={targetSalesRep.name}
              onChange={(e) =>
                setTargetSalesRep({ ...targetSalesRep, name: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Target Amount"
            rules={[
              { required: true, message: "Please input the target amount!" },
            ]}
          >
            <Input
              type="number"
              value={targetSalesRep.amount}
              onChange={(e) =>
                setTargetSalesRep({ ...targetSalesRep, amount: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Set Target
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Retailer Modal */}
      <RetailerViewModal
        visible={isViewModalVisible}
        onClose={() => setIsViewModalVisible(false)}
        retailerData={viewingRetailer}
      />
    </div>
  );
};

export default RetailerInfo;
