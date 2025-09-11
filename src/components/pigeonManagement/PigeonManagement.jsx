import React, { useState, useMemo } from "react";
import {
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  Tooltip,
  Modal,
  Form,
} from "antd";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import PigeonImage from "../../../src/assets/pigeon-image.png";
import VerifyIcon from "../../../src/assets/verify.png";
import GermanyFlag from "../../../src/assets/country-flag.png";
import Swal from "sweetalert2";

const { Option } = Select;

const initialData = [
  {
    key: "1",
    image: PigeonImage,
    name: "Pigeon 1",
    verified: "Yes",
    iconic: "Champion",
    iconicScore: 95,
    country: "USA",
    pigeonId: "P1001",
    ringNumber: "R1234",
    birthYear: 2020,
    father: "Father A",
    mother: "Mother A",
    gender: "Male",
    status: "Active",
    icon: VerifyIcon,
    color: "Red",
  },
  {
    key: "2",
    image: PigeonImage,
    name: "Pigeon 2",
    verified: "No",
    iconic: "Elite",
    iconicScore: 88,
    country: "UK",
    pigeonId: "P1002",
    ringNumber: "R1235",
    birthYear: 2021,
    father: "Father B",
    mother: "Mother B",
    gender: "Female",
    status: "Inactive",
    icon: "-",
    color: "Blue",
  },
  {
    key: "3",
    image: PigeonImage,
    name: "Pigeon 3",
    verified: "Yes",
    iconic: "Grandmaster",
    iconicScore: 99,
    country: "Canada",
    pigeonId: "P1003",
    ringNumber: "R1236",
    birthYear: 2019,
    father: "Father C",
    mother: "Mother C",
    gender: "Male",
    status: "Active",
    icon: VerifyIcon,
    color: "Green",
  },
];

const PigeonManagement = () => {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState(null);

  const showViewModal = (record) => {
    setEditingPigeon(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPigeon(null);
  };

  const handleModalSave = (values) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === editingPigeon.key ? { ...item, ...values } : item
      )
    );
    setIsModalVisible(false);
    setEditingPigeon(null);
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
        Swal.fire("Deleted!", "Pigeon has been deleted.", "success");
      }
    });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.ringNumber.toLowerCase().includes(search.toLowerCase());
      const matchesCountry =
        filterCountry === "all" ||
        item.country.name.toLowerCase() === filterCountry.toLowerCase();
      const matchesGender =
        filterGender === "all" ||
        item.gender.toLowerCase() === filterGender.toLowerCase();
      const matchesColor =
        filterColor === "all" ||
        item.color.toLowerCase() === filterColor.toLowerCase();
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "verified"
          ? item.verified === "Yes"
          : item.verified === "No");

      return (
        matchesSearch &&
        matchesCountry &&
        matchesGender &&
        matchesColor &&
        matchesStatus
      );
    });
  }, [data, search, filterCountry, filterGender, filterColor, filterStatus]);

  const getColumns = () => [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (src) => (
        <img
          src={src || PigeonImage}
          alt="pigeon"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Verified", dataIndex: "verified", key: "verified" },
    { title: "Iconic", dataIndex: "iconic", key: "iconic" },
    { title: "Iconic Score", dataIndex: "iconicScore", key: "iconicScore" },
    { title: "Country", dataIndex: "country", key: "country" },
    { title: "Pigeon ID", dataIndex: "pigeonId", key: "pigeonId" },
    { title: "Ring Number", dataIndex: "ringNumber", key: "ringNumber" },
    { title: "Birth Year", dataIndex: "birthYear", key: "birthYear" },
    { title: "Father", dataIndex: "father", key: "father" },
    { title: "Mother", dataIndex: "mother", key: "mother" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Color", dataIndex: "color", key: "color" },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (src) =>
        src && src !== "-" ? (
          <img src={src} alt="verify" style={{ width: 24, height: 24 }} />
        ) : (
          "-"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div className="flex gap-5 border px-4 py-2 rounded">
            <Tooltip title="View & Update Details">
              <FaEdit
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => showViewModal(record)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <FaTrash
                style={{ color: "#ff4d4f", fontSize: 16, cursor: "pointer" }}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="bg-[#333D49] rounded-lg shadow-lg border border-gray-200 mb-2 mt-6">
        <Row gutter={[16, 16]} className="px-4 mb-4 mt-4">
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Search</label>
              <Input
                placeholder="Search..."
                className="custom-input-ant"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Country</label>
              <Select
                className="custom-select-ant"
                value={filterCountry}
                onChange={setFilterCountry}
              >
                <Option value="all">All</Option>
                <Option value="usa">USA</Option>
                <Option value="uk">UK</Option>
                <Option value="canada">Canada</Option>
                <Option value="germany">Germany</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Gender</label>
              <Select
                className="custom-select-ant"
                value={filterGender}
                onChange={setFilterGender}
              >
                <Option value="all">All</Option>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Color</label>
              <Select
                className="custom-select-ant"
                value={filterColor}
                onChange={setFilterColor}
              >
                <Option value="all">All</Option>
                <Option value="red">Red</Option>
                <Option value="blue">Blue</Option>
                <Option value="green">Green</Option>
                <Option value="yellow">Yellow</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Status</label>
              <Select
                className="custom-select-ant"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All</Option>
                <Option value="verified">Verified</Option>
                <Option value="notverified">Not Verified</Option>
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
              pagination={{ pageSize: 5 }}
              size="small"
              scroll={{ x: "max-content" }}
              rowKey="key"
            />
          </div>
        </div>
      </div>

      {/* View & Update Modal */}
      <Modal
        title="View & Update Pigeon"
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        {editingPigeon && (
          <Form
            layout="vertical"
            initialValues={{
              ...editingPigeon,
              country: editingPigeon.country?.name || "",
              gender: editingPigeon.gender,
              status: editingPigeon.status,
              iconic: editingPigeon.iconic,
              iconicScore: editingPigeon.iconicScore,
              father: editingPigeon.father,
              mother: editingPigeon.mother,
              color: editingPigeon.color,
              pigeonId: editingPigeon.pigeonId,
              ringNumber: editingPigeon.ringNumber,
              name: editingPigeon.name,
              verified: editingPigeon.verified,
              birthYear: editingPigeon.birthYear,
            }}
            onFinish={handleModalSave}
            className="mb-6"
          >
            <Row gutter={[30, 20]}>
              {/* Name */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter name" }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Name"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Pigeon ID */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Pigeon ID"
                  name="pigeonId"
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Pigeon ID"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Ring Number */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Ring Number"
                  name="ringNumber"
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Ring Number"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Birth Year */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Birth Year"
                  name="birthYear"
                  className="custom-form-item-ant"
                >
                  <Input
                    type="number"
                    placeholder="Enter Birth Year"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Father */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Father"
                  name="father"
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Father's Name"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Mother */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Mother"
                  name="mother"
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Mother's Name"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Gender */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Gender"
                  name="gender"
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

              {/* Status */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Status"
                    className="custom-select-ant-modal"
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Country */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Country"
                  name="country"
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

              {/* Verified */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Verified"
                  name="verified"
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Verified Status"
                    className="custom-select-ant-modal"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Iconic */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Iconic"
                  name="iconic"
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Iconic Level"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Iconic Score */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Iconic Score"
                  name="iconicScore"
                  className="custom-form-item-ant"
                >
                  <Input
                    type="number"
                    placeholder="Enter Iconic Score"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* Color */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Color"
                  name="color"
                  className="custom-form-item-ant"
                >
                  <Input
                    placeholder="Enter Color"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Footer Buttons */}
            <div className="flex justify-end mt-4">
              <Button onClick={handleModalCancel} style={{ marginRight: 8 }}>
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

export default PigeonManagement;
