import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Tooltip,
} from "antd";
import Swal from "sweetalert2";
import { CloseOutlined, LockOutlined } from "@ant-design/icons";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";

const retailersData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Retailer ${i + 1}`,
  email: `retailer${i + 1}@gmail.com`,
  phone: `+23191633389${i + 1}`,
  totalOrder: Math.floor(Math.random() * 100),
  totalSales: `$${(Math.random() * 1000).toFixed(2)}`,
  accountStatus: i % 2 === 0 ? "Active" : "Inactive",
  image: `https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-around-his-neck_23-2148096439.jpg?semt=ais_hybrid/50?text=R${
    i + 1
  }`,
  salesRep: `Sales Rep ${(i % 5) + 1}`,
  shippingAddress: `${i + 100} Example Street, City ${(i % 10) + 1}`,
  nameOnCard: "Alice Johnson",
  cardNumber: "1234567891023",
  expiry: "25/29",
  cvc: "956",
  zipCode: "123456",
}));

const statusOptions = ["Active", "Inactive"];

const RetailerManageTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [retailers, setRetailers] = useState(retailersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "SL",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Retailer Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Assigned Sales Rep",
      dataIndex: "salesRep",
      key: "salesRep",
      align: "center",
    },
    {
      title: "Total Order Placed",
      dataIndex: "totalOrder",
      key: "totalOrder",
      align: "center",
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "center",
    },
    {
      title: "Subscription",
      dataIndex: "accountStatus",
      key: "accountStatus",
      align: "center",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center space-x-3">
          <Tooltip title="Edit">
            <button
              onClick={() => handleEdit(record)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            >
              <FaEdit size={16} />
            </button>
          </Tooltip>

          <Tooltip title="View">
            <button
              onClick={() => handleViewDetails(record)}
              className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
            >
              <FaEye size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Delete" color="red">
            <button
              onClick={() => handleDelete(record.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <FaTrashAlt size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      salesRep: user.salesRep,
      shippingAddress: user.shippingAddress,
      nameOnCard: user.nameOnCard,
      cardNumber: user.cardNumber,
      expiry: user.expiry,
      cvc: user.cvc,
      zipCode: user.zipCode,
      totalOrder: user.totalOrder,
      totalSales: user.totalSales,
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRetailers(retailers.filter((retailer) => retailer.id !== id));
        Swal.fire("Deleted!", "Retailer has been deleted.", "success");
      }
    });
  };

  const handleSave = (values) => {
    if (selectedUser) {
      // Update existing retailer
      setRetailers(
        retailers.map((retailer) =>
          retailer.id === selectedUser.id
            ? { ...selectedUser, ...values }
            : retailer
        )
      );
    } else {
      // Add new retailer
      const newRetailer = {
        ...values,
        id: retailers.length + 1,
        image:
          "https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-around-his-neck_23-2148096439.jpg",
      };
      setRetailers([...retailers, newRetailer]);
    }
    setIsModalOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const filteredRetailers = retailers.filter((retailer) => {
    const matchesSearch =
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus
      ? retailer.accountStatus === selectedStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold">
          Retailer List{" "}
          <span className="text-secondary">{retailers.length}</span>{" "}
        </h2>
        <div className="flex gap-5 items-center">
          <div className="w-[300px]">
            <Select
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
              placeholder="Filter by Status"
              style={{ width: "100%", height: "43px" }}
              allowClear
            >
              {statusOptions.map((status) => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Input
            placeholder="Search Retailers Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            className="py-2.5"
          />
          <Button
            type="primary"
            onClick={() => {
              setSelectedUser(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="bg-teal-500 hover:bg-teal-600 py-5 text-white"
          >
            Add Retailer
          </Button>
        </div>
      </div>

      <div className="bg-primary p-5 rounded-lg">
        <Table
          dataSource={filteredRetailers}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered={false}
          size="small"
          rowClassName="custom-row"
          rowKey="id"
        />
      </div>

      {/* Modal for Add/Edit Retailer */}
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
                <Input placeholder="Retailer Name" className="p-2 rounded" />
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
                <Input placeholder="Shipping Address" className="p-2 rounded" />
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

      {/* View Retailer Details Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span>View Retailer Information</span>
          </div>
        }
        visible={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button
            key="done"
            type="primary"
            onClick={() => setIsViewModalOpen(false)}
            className="bg-teal-500 hover:bg-teal-600"
          >
            Done
          </Button>,
        ]}
        width={800}
      >
        {selectedUser && (
          <div className="bg-gray-50 p-6 rounded-md">
            <div className="flex items-center mb-6">
              <img
                src={selectedUser.image}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedUser.accountStatus === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedUser.accountStatus}
                </span>
              </div>
            </div>

            <div className="flex gap-8">
              {/* Left side - Retail Information */}
              <div className="w-1/2 space-y-4">
                <h3 className="font-bold text-lg mb-3">Retail Information</h3>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Assigned Sales Rep</p>
                  <p className="font-medium">{selectedUser.salesRep}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="font-medium">{selectedUser.totalOrder}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Total Sales</p>
                  <p className="font-medium">{selectedUser.totalSales}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Shipping Address</p>
                  <p className="font-medium">{selectedUser.shippingAddress}</p>
                </div>
              </div>

              {/* Right side - Payment Information */}
              <div className="w-1/2 space-y-4">
                <h3 className="font-bold text-lg mb-3">Payment Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">Name on Card</p>
                    <p className="font-medium">{selectedUser.nameOnCard}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Card Number</p>
                    <p className="font-medium">
                      •••• •••• •••• {selectedUser.cardNumber.slice(-4)}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Expiry</p>
                      <p className="font-medium">{selectedUser.expiry}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">CVC</p>
                      <p className="font-medium">•••</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Zip Code</p>
                    <p className="font-medium">{selectedUser.zipCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RetailerManageTable;
