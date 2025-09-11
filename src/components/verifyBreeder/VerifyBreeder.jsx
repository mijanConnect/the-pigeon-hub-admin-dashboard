import React, { useState, useMemo } from "react";
import {
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Form,
  Tooltip,
  Switch,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import AddVerifiedBadge from "./AddVerifiedBadge"; // Add Modal
import {
  FaTrash,
  FaEye,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import Swal from "sweetalert2";
import GermanyFlag from "../../../src/assets/country-flag.png";

const { Option } = Select;

const initialData = [
  {
    key: "1",
    breederName: "Breeder A",
    pigeonScore: 95,
    country: "USA", // string, not object
    email: "breederA@example.com",
    phoneNumber: "+1 123-456-7890",
    gender: "Male",
    experienceLevel: "Expert",
    status: "Active",
  },
  {
    key: "2",
    breederName: "Breeder B",
    pigeonScore: 88,
    country: "UK",
    email: "breederB@example.com",
    phoneNumber: "+44 789-456-1230",
    gender: "Female",
    experienceLevel: "Intermediate",
    status: "Inactive",
  },
  {
    key: "3",
    breederName: "Breeder C",
    pigeonScore: 99,
    country: "Canada",
    email: "breederC@example.com",
    phoneNumber: "+1 555-987-6543",
    gender: "Male",
    experienceLevel: "Beginner",
    status: "Active",
  },
];

const VerifyBreeder = () => {
  const [data, setData] = useState(initialData);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const showViewModal = (record) => {
    setEditingData(record);
    setIsEditModalVisible(true);
  };

  const handleEditSave = (values) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === editingData.key
          ? { ...editingData, ...values } // country stays string
          : item
      )
    );
    setIsEditModalVisible(false);
  };

  const handleDelete = (record) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.key !== record.key));
        Swal.fire({
          title: "Deleted!",
          text: "User has been deleted.",
          icon: "success",
        });
      }
    });
  };

  const handleStatusChange = (record, checked) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to change status to ${
        checked ? "Active" : "Inactive"
      }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev) =>
          prev.map((item) =>
            item.key === record.key
              ? { ...item, status: checked ? "Active" : "Inactive" }
              : item
          )
        );
        Swal.fire({
          title: "Updated!",
          text: `Status has been changed to ${
            checked ? "Active" : "Inactive"
          }.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const getColumns = () => [
    { title: "Breeder Name", dataIndex: "breederName", key: "breederName" },
    { title: "Pigeon Score", dataIndex: "pigeonScore", key: "pigeonScore" },
    // {
    //   title: "Country",
    //   dataIndex: "country",
    //   key: "country",
    //   render: (country) => (
    //     <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
    //       <img
    //         src={country.icon}
    //         alt={country.name}
    //         style={{ width: 20, height: 20, borderRadius: "50%" }}
    //       />
    //       <span>{country.name}</span>
    //     </div>
    //   ),
    // },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (country) => country || "-",
    },

    { title: "E-mail", dataIndex: "email", key: "email" },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: "Experience Level",
      dataIndex: "experienceLevel",
      key: "experienceLevel",
    },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div className="flex gap-5 border px-4 py-2 rounded">
            <Tooltip title="View & Update Details">
              <FaEye
                style={{ color: "#ffff", fontSize: "16px", cursor: "pointer" }}
                onClick={() => showViewModal(record)}
              />
            </Tooltip>

            {/* <Tooltip title="Edit">
              <FaEdit
                style={{ color: "#ffff", fontSize: "16px", cursor: "pointer" }}
                onClick={() => handleDelete(record)}
              />
            </Tooltip> */}

            <Tooltip title="Delete">
              <FaTrash
                style={{
                  color: "#ff4d4f",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
            {/* <Tooltip title="Status">
              <Switch
                size="small"
                checked={record.status === "Active"}
                style={{
                  backgroundColor:
                    record.status === "Active" ? "#3fae6a" : "gray",
                }}
                onChange={(checked) => handleStatusChange(record, checked)}
              />
            </Tooltip> */}
          </div>
          {/* <Tooltip title="View & Update Details">
            <EditOutlined
              className="text-white hover:text-gray-400 text-xl"
              onClick={() => showViewModal(record)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <FaTrash
              style={{ color: "#ff4d4f", fontSize: "16px", cursor: "pointer" }}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>

          <Tooltip title="Status">
            <Switch
              size="small"
              checked={record.status === "Active"}
              style={{
                backgroundColor:
                  record.status === "Active" ? "#3fae6a" : "gray",
              }}
              onChange={(checked) => handleStatusChange(record, checked)}
            />
          </Tooltip> */}
        </div>
      ),
    },
  ];

  // Filtered data using useMemo for performance
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchMatch =
        item.breederName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phoneNumber.toLowerCase().includes(searchText.toLowerCase());

      const countryMatch =
        filterCountry === "all" ||
        item.country.name.toLowerCase() === filterCountry.toLowerCase();
      const genderMatch =
        filterGender === "all" ||
        item.gender.toLowerCase() === filterGender.toLowerCase();
      const experienceMatch =
        filterExperience === "all" ||
        item.experienceLevel.toLowerCase() === filterExperience.toLowerCase();
      const statusMatch =
        filterStatus === "all" ||
        item.status.toLowerCase() === filterStatus.toLowerCase();

      return (
        searchMatch &&
        countryMatch &&
        genderMatch &&
        experienceMatch &&
        statusMatch
      );
    });
  }, [
    data,
    searchText,
    filterCountry,
    filterGender,
    filterExperience,
    filterStatus,
  ]);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 mt-4">
        <Button
          type="primary"
          className="py-5 px-7 font-semibold text-[16px]"
          onClick={() => setIsAddModalVisible(true)}
        >
          Add Verified Breeder
        </Button>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-[#333D49] rounded-lg shadow-lg border border-gray-200 mb-2">
        <Row gutter={[16, 16]} className="flex flex-wrap px-4 mb-4 mt-4">
          {/* Search */}
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Search</label>
              <Input
                placeholder="Search..."
                className="custom-input-ant"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </Col>

          {/* Country */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Country</label>
              <Select
                placeholder="Select Country"
                className="custom-select-ant"
                value={filterCountry}
                onChange={setFilterCountry}
              >
                <Option value="all">All</Option>
                <Option value="USA">USA</Option>
                <Option value="UK">UK</Option>
                <Option value="Canada">Canada</Option>
                <Option value="Germany">Germany</Option>
              </Select>
            </div>
          </Col>

          {/* Gender */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Gender</label>
              <Select
                placeholder="Select Gender"
                className="custom-select-ant"
                value={filterGender}
                onChange={setFilterGender}
              >
                <Option value="all">All</Option>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
              </Select>
            </div>
          </Col>

          {/* Experience Level */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Experience Level</label>
              <Select
                placeholder="Select Level"
                className="custom-select-ant"
                value={filterExperience}
                onChange={setFilterExperience}
              >
                <Option value="all">All</Option>
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Expert">Expert</Option>
              </Select>
            </div>
          </Col>

          {/* Status */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Status</label>
              <Select
                placeholder="Select Status"
                className="custom-select-ant"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All</Option>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div style={{ minWidth: "max-content" }}>
            <Table
              columns={getColumns()}
              dataSource={filteredData}
              rowClassName={() => "hover-row"}
              components={{
                header: {
                  cell: (props) => (
                    <th
                      {...props}
                      style={{
                        height: 70,
                        lineHeight: "70px",
                        background: "#333D49",
                        color: "#ffffff",
                        fontWeight: 600,
                        padding: "0 16px",
                      }}
                    >
                      {props.children}
                    </th>
                  ),
                },
                body: {
                  cell: (props) => (
                    <td
                      {...props}
                      style={{
                        background: "#212B35",
                        padding: "12px 16px",
                        color: "#ffffff",
                        borderBottom: "none",
                      }}
                    >
                      {props.children}
                    </td>
                  ),
                },
              }}
              bordered={false}
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
              rowKey="key"
            />
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddVerifiedBadge
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSave={(newData) => {
          setData((prev) => [
            ...prev,
            { key: String(prev.length + 1), ...newData },
          ]);
          setIsAddModalVisible(false);
        }}
      />

      {/* Edit Modal */}
      {/* Edit Modal */}
      <Modal
        title="Edit Verified Breeder"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        width={800}
        footer={null}
      >
        {editingData && (
          <Form
            layout="vertical"
            initialValues={{
              ...editingData,
              country: editingData.country, // ✅ just string
              gender: editingData.gender,
              experienceLevel: editingData.experienceLevel,
              status: editingData.status,
            }}
            onFinish={handleEditSave}
            className="mb-6"
          >
            <Row gutter={[30, 20]}>
              {/* Breeder Name */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Breeder Name"
                  name="breederName"
                  rules={[
                    { required: true, message: "Please enter breeder name" },
                  ]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Breeder Name"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Pigeon Score */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Pigeon Score"
                  name="pigeonScore"
                  rules={[
                    { required: true, message: "Please enter pigeon score" },
                  ]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Pigeon Score"
                    type="number"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Country */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: "Please select country" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Country"
                    className="custom-select-ant-modal"
                  >
                    <Option value="USA">USA</Option>
                    <Option value="UK">UK</Option>
                    <Option value="Canada">Canada</Option>
                    <Option value="Germany">Germany</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Email */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="E-mail"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter E-mail"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Phone Number */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Phone Number"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Gender */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{ required: true, message: "Please select gender" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Gender"
                    className="custom-select-ant-modal"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Experience Level */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Experience Level"
                  name="experienceLevel"
                  rules={[
                    {
                      required: true,
                      message: "Please select experience level",
                    },
                  ]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Experience Level"
                    className="custom-select-ant-modal"
                  >
                    <Option value="Beginner">Beginner</Option>
                    <Option value="Intermediate">Intermediate</Option>
                    <Option value="Expert">Expert</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Status */}
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Status"
                    className="custom-select-ant-modal"
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                    <Option value="Pending">Pending</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Footer Buttons */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setIsEditModalVisible(false)}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default VerifyBreeder;
