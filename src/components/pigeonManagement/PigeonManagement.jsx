import React, { useState } from "react";
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
  Spin,
  Switch,
} from "antd";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import {
  useGetAllPigeonsQuery,
  useGetSinglePigeonQuery,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
  useTogglePigeonStatusMutation,
} from "../../redux/apiSlices/allpigeonSlice";
import { getImageUrl } from "../common/imageUrl";
import PigeonImage from "../../../src/assets/pigeon-image.png";
import VerifyIcon from "../../assets/verify.png";
import Swal from "sweetalert2";
import ViewPigeon from "../myPigeon/ViewPigeon";
import { getNames } from "country-list";
import { getCode } from "country-list";

const { Option } = Select;

const PigeonManagement = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    country: "all",
    gender: "all",
    color: "all",
    status: "all",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPigeonId, setEditingPigeonId] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewPigeonId, setViewPigeonId] = useState(null);
  const countries = getNames();

  // RTK Query hooks
  const { data, isLoading } = useGetAllPigeonsQuery({
    page,
    limit: pageSize,
    searchTerm: filters.search || undefined,
    country: filters.country !== "all" ? filters.country : undefined,
    gender: filters.gender !== "all" ? filters.gender : undefined,
    color: filters.color !== "all" ? filters.color : undefined,
    verified:
      filters.status === "verified"
        ? true
        : filters.status === "notverified"
        ? false
        : undefined,
  });

  const { data: editingPigeonData } = useGetSinglePigeonQuery(editingPigeonId, {
    skip: !editingPigeonId,
  });

  const { data: viewPigeonData, isLoading: viewLoading } =
    useGetSinglePigeonQuery(viewPigeonId, {
      skip: !viewPigeonId,
    });

  const [updatePigeon] = useUpdatePigeonMutation();
  const [deletePigeon] = useDeletePigeonMutation();
  const [togglePigeonStatus] = useTogglePigeonStatusMutation();

  const pigeons = data?.pigeons || [];
  const total = data?.pagination?.total || 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleView = (record) => {
    setViewPigeonId(record._id);
    setViewModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingPigeonId(record._id);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPigeonId(null);
  };

  const handleViewCancel = () => {
    setViewModalVisible(false);
    setViewPigeonId(null);
  };

  const handleModalSave = async (values) => {
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      const formData = new FormData();

      // Append form values to FormData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      await updatePigeon({
        id: editingPigeonId,
        formData,
        token,
      }).unwrap();

      Swal.fire("Success!", "Pigeon updated successfully.", "success");
      setIsModalVisible(false);
      setEditingPigeonId(null);
    } catch (err) {
      Swal.fire("Error", err?.data?.message || "Failed to update", "error");
    }
  };

  const handleDelete = (record) => {
    Swal.fire({
      title: "Delete Pigeon?",
      text: `Are you sure you want to delete ${record.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePigeon(record._id).unwrap();
          Swal.fire("Deleted!", "Pigeon has been deleted.", "success");
        } catch (err) {
          Swal.fire("Error", err?.data?.message || "Failed to delete", "error");
        }
      }
    });
  };

  const handleStatusToggle = (record, checked) => {
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await togglePigeonStatus({
            _id: record._id,
            status: checked,
          }).unwrap();

          Swal.fire({
            title: "Updated!",
            text: `Status has been changed to ${
              checked ? "Active" : "Inactive"
            }.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            title: "Error",
            text: err?.data?.message || "Failed to update status.",
            icon: "error",
          });
        }
      }
    });
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (src) => (
        <img
          src={src ? getImageUrl(src) : PigeonImage}
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
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (country) => {
        const countryCode = country ? getCode(country.name || country) : null;
        return countryCode ? (
          <div className="flex items-center gap-2">
            <img
              src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
              alt={country.name || country}
              className="w-5 h-4 rounded-sm"
            />
            <p className="text-white">{countryCode}</p>
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
    { title: "Pigeon ID", dataIndex: "pigeonId", key: "pigeonId" },
    { title: "Ring Number", dataIndex: "ringNumber", key: "ringNumber" },
    { title: "Birth Year", dataIndex: "birthYear", key: "birthYear" },
    { title: "Father", dataIndex: "father", key: "father" },
    { title: "Mother", dataIndex: "mother", key: "mother" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Status", dataIndex: "status", key: "status" },

    // { title: "Breeder", dataIndex: "breeder", key: "breeder" },
    // { title: "Color & Pattern", dataIndex: "color", key: "color" },
    // {
    //   title: "Icon",
    //   dataIndex: "icon",
    //   key: "icon",
    //   width: 80,
    //   render: (src) =>
    //     src && src !== "-" ? (
    //       <img
    //         src={VerifyIcon}
    //         alt="verify"
    //         style={{ width: 24, height: 24, objectFit: "cover" }}
    //       />
    //     ) : (
    //       <span>-</span>
    //     ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div className="flex gap-5 border px-4 py-2 rounded">
            <Tooltip title="View Details">
              <FaEye
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => handleView(record)}
              />
            </Tooltip>
            {/* <Tooltip title="View & Update Details">
              <FaEdit
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => showEditModal(record)}
              />
            </Tooltip> */}
            <Tooltip title="Delete">
              <FaTrash
                style={{ color: "#ff4d4f", fontSize: 16, cursor: "pointer" }}
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
                onChange={(checked) => handleStatusToggle(record, checked)}
              />
            </Tooltip> */}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="bg-[#333D49] rounded-lg shadow-lg border border-gray-200 mb-2 mt-6">
        <Row gutter={[16, 16]} className="px-4 mb-4 pt-4">
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Search</label>
              <Input
                placeholder="Search..."
                className="custom-input-ant"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Country</label>
              <Select
                placeholder="Select Country"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filters.country || "all"}
                onChange={(value) => handleFilterChange("country", value)}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {/* ✅ "All" option at the top */}
                <Option value="all">All</Option>

                {countries.map((country, index) => (
                  <Option key={index} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Gender</label>
              <Select
                placeholder="Select Gender"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filters.gender}
                onChange={(value) => handleFilterChange("gender", value)}
              >
                <Option value="all">All</Option>
                <Option value="Cock">Cock</Option>
                <Option value="Hen">Hen</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Color</label>
              <Select
                placeholder="Select Color"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filters.color}
                onChange={(value) => handleFilterChange("color", value)}
              >
                <Option value="all">All</Option>
                <Option value="White">White</Option>
                <Option value="Red">Red</Option>
                <Option value="Blue">Blue</Option>
                <Option value="Green">Green</Option>
                <Option value="Yellow">Yellow</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Verification</label>
              <Select
                placeholder="Select Status"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
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
          <div
            style={{ minWidth: pigeons.length > 0 ? "max-content" : "100%" }}
            className="bg-[#333D49] rounded-lg"
          >
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={pigeons}
                rowClassName={() => "hover-row"}
                bordered={false}
                size="small"
                rowKey="_id"
                scroll={pigeons.length > 0 ? { x: "max-content" } : undefined}
                pagination={{
                  current: page,
                  pageSize,
                  total,
                  showSizeChanger: false,
                  onChange: (newPage) => setPage(newPage),
                }}
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
                locale={{
                  emptyText: (
                    <div className="py-10 text-gray-400 text-center">
                      No pigeons found 🕊️
                    </div>
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title="View & Update Pigeon"
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        {editingPigeonData && (
          <Form
            layout="vertical"
            initialValues={{
              name: editingPigeonData?.data?.name,
              pigeonId: editingPigeonData?.data?.pigeonId,
              ringNumber: editingPigeonData?.data?.ringNumber,
              birthYear: editingPigeonData?.data?.birthYear,
              father: editingPigeonData?.data?.father,
              mother: editingPigeonData?.data?.mother,
              gender: editingPigeonData?.data?.gender,
              status: editingPigeonData?.data?.status,
              country: editingPigeonData?.data?.country,
              verified: editingPigeonData?.data?.verified ? "Yes" : "No",
              iconic: editingPigeonData?.data?.iconic,
              iconicScore: editingPigeonData?.data?.iconicScore,
              color: editingPigeonData?.data?.color,
            }}
            onFinish={handleModalSave}
            className="mb-6"
          >
            <Row gutter={[30, 20]}>
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
                    <Option value="Cock">Cock</Option>
                    <Option value="Hen">Hen</Option>
                  </Select>
                </Form.Item>
              </Col>

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
                    <Option value="Bangladesh">Bangladesh</Option>
                    <Option value="USA">USA</Option>
                    <Option value="UK">UK</Option>
                    <Option value="Canada">Canada</Option>
                    <Option value="Germany">Germany</Option>
                  </Select>
                </Form.Item>
              </Col>

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

      {/* View Modal */}
      <ViewPigeon
        visible={viewModalVisible}
        onCancel={handleViewCancel}
        pigeonData={viewPigeonData?.data || null}
        loading={viewLoading}
      />
    </div>
  );
};

export default PigeonManagement;
