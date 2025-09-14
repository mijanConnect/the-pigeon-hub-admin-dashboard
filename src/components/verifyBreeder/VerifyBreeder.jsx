// src/pages/VerifyBreeder.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Button, Table, Input, Select, Row, Col, Tooltip } from "antd";
import { FaTrash, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import AddVerifyBreeder from "./AddVerifiedBreeder";
import {
  useGetBreedersQuery,
  useAddBreederMutation,
  useUpdateBreederMutation,
  useDeleteBreederMutation,
} from "../../redux/apiSlices/breederSlice";

const { Option } = Select;

const VerifyBreeder = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // filters
  const [searchText, setSearchText] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // RTK Query
  const { data: apiData, isLoading } = useGetBreedersQuery({
    page,
    limit,
    search: searchText,
    country: filterCountry,
    gender: filterGender,
    status: filterStatus,
  });

  const [addBreeder] = useAddBreederMutation();
  const [updateBreeder] = useUpdateBreederMutation();
  const [deleteBreeder] = useDeleteBreederMutation();

  // load breeders when API updates
  useEffect(() => {
    if (apiData?.breeders) {
      setData(apiData.breeders);
    }
  }, [apiData]);

  const openAddModal = () => {
    setEditingData(null);
    setIsModalVisible(true);
  };

  const openEditModal = (record) => {
    setEditingData(record);
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingData) {
        await updateBreeder({
          id: editingData.key,
          data: values,
          token: "your-auth-token",
        }).unwrap();
        Swal.fire("Updated!", "Breeder updated successfully!", "success");
      } else {
        await addBreeder({
          data: values,
          token: "your-auth-token",
        }).unwrap();
        Swal.fire("Added!", "Breeder added successfully!", "success");
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBreeder(record.key).unwrap();
          Swal.fire("Deleted!", "Breeder has been deleted.", "success");
        } catch (error) {
          console.error(error);
          Swal.fire("Error", "Failed to delete breeder!", "error");
        }
      }
    });
  };

  const getColumns = () => [
    { title: "Breeder Name", dataIndex: "breederName", key: "breederName" },
    { title: "Pigeon Score", dataIndex: "pigeonScore", key: "pigeonScore" },
    { title: "Country", dataIndex: "country", key: "country" },
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
                onClick={() => openEditModal(record)}
              />
            </Tooltip>

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
          </div>
        </div>
      ),
    },
  ];

  // local filter (for client-side refinements in addition to API)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const experienceMatch =
        filterExperience === "all" ||
        item.experienceLevel.toLowerCase() === filterExperience.toLowerCase();

      return experienceMatch;
    });
  }, [data, filterExperience]);

  return (
    <div className="w-full">
      {/* Add Button */}
      <div className="flex justify-end mb-4 mt-4">
        <Button
          type="primary"
          className="py-5 px-7 font-semibold text-[16px]"
          onClick={openAddModal}
        >
          Add Verified Breeder
        </Button>
      </div>

      {/* Filters */}
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

          {/* Experience */}
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
        <div style={{ minWidth: "max-content" }}>
          <Table
            columns={getColumns()}
            dataSource={filteredData}
            loading={isLoading}
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
            pagination={{
              current: page,
              pageSize: limit,
              total: apiData?.pagination?.total || 0,
              onChange: (p, l) => {
                setPage(p);
                setLimit(l);
              },
            }}
            size="small"
            scroll={apiData?.length > 0 ? { x: "max-content" } : undefined}
            rowKey="key"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddVerifyBreeder
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        initialValues={editingData}
      />
    </div>
  );
};

export default VerifyBreeder;
