import React, { useState } from "react";
import {
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  Spin,
  Tooltip,
} from "antd";
import AddNewPigeon from "./AddNewPigeon";
import {
  useDeletePigeonMutation,
  useGetMyPigeonsQuery,
  useGetSinglePigeonQuery,
} from "../../redux/apiSlices/mypigeonSlice";
import { getImageUrl } from "../common/imageUrl";
import VerifyIcon from "../../assets/verify.png";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import ViewPigeon from "./ViewPigeon"; // ✅ import
import Swal from "sweetalert2";
import { getNames } from "country-list";
import { getCode } from "country-list";

const { Option } = Select;
const { TabPane } = Tabs;

const MyPigeon = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState(null); // ✅ For edit
  const [tabKey, setTabKey] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    country: "all",
    gender: "all",
    color: "all",
    status: "all",
  });

  // Add states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewPigeonId, setViewPigeonId] = useState(null);

  const { data: viewPigeonData, isLoading: viewLoading } =
    useGetSinglePigeonQuery(viewPigeonId, {
      skip: !viewPigeonId, // only fetch when ID exists
    });

  const handleView = (record) => {
    setViewPigeonId(record._id); // ✅ fetch full pigeon details
    setViewModalVisible(true);
  };

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const countries = getNames();

  const [editingPigeonId, setEditingPigeonId] = useState(null);
  const { data: editingPigeonData } = useGetSinglePigeonQuery(editingPigeonId, {
    skip: !editingPigeonId, // don't fetch until ID is set
  });

  const showEditModal = (record) => {
    setEditingPigeonId(record._id);
    setIsModalVisible(true);
  };

  const { data, isLoading } = useGetMyPigeonsQuery({
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
    status: tabKey !== "all" ? tabKey : undefined,
  });

  const pigeons = data?.pigeons || [];
  const total = data?.pagination?.total || 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const [deletePigeon] = useDeletePigeonMutation();

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
  // const showEditModal = (record) => {
  //   setEditingPigeon(record);
  //   setIsModalVisible(true);
  // };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (src) => (
        <img
          src={getImageUrl(src)}
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

    { title: "Breeder", dataIndex: "breeder", key: "breeder" },
    { title: "Ring Number", dataIndex: "ringNumber", key: "ringNumber" },
    { title: "Birth Year", dataIndex: "birthYear", key: "birthYear" },
    { title: "Father", dataIndex: "father", key: "father" },
    { title: "Mother", dataIndex: "mother", key: "mother" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Color & Pattern", dataIndex: "color", key: "color" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Verified", dataIndex: "verified", key: "verified" },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (src) =>
        src && src !== "-" ? (
          <img
            src={VerifyIcon}
            alt="verify"
            style={{ width: 24, height: 24, objectFit: "cover" }}
          />
        ) : (
          <span>-</span>
        ),
    },
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
            <Tooltip title="View & Update Details">
              <FaEdit
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => showEditModal(record)}
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected row keys:", selectedRowKeys, selectedRows);
    },
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 mt-4">
        <Button
          type="primary"
          className="py-5 px-7 font-semibold text-[16px]"
          onClick={() => {
            setEditingPigeonId(null); // ✅ reset ID
            setIsModalVisible(true); // ✅ open modal
          }}
        >
          Add New Pigeon
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-[#333D49] rounded-lg shadow-lg border border-gray-200 mb-2">
        <div className="pt-3 mb-6 px-4 rounded-t-lg bg-[#44505E]">
          <Tabs
            defaultActiveKey="all"
            tabBarGutter={50}
            className="custom-tabs"
            onChange={(key) => {
              setTabKey(key);
              setPage(1); // reset pagination whenever tab changes
            }}
          >
            <TabPane tab="All" key="all" />
            <TabPane tab="Racing" key="Racing" />
            <TabPane tab="Breeding" key="Breeding" />
            <TabPane tab="Lost" key="Lost" />
            <TabPane tab="Sold" key="Sold" />
            <TabPane tab="Retired" key="Retired" />
            <TabPane tab="Deceased" key="Deceased" />
          </Tabs>
        </div>

        <Row gutter={[16, 16]} className="flex flex-wrap px-4 mb-4">
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
                // rowSelection={rowSelection}
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

      <AddNewPigeon
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPigeonId(null); // clear edit ID
        }}
        onSave={(values) => {
          console.log(editingPigeonId ? "Edit Pigeon:" : "Add Pigeon:", values);
          setIsModalVisible(false);
          setEditingPigeonId(null); // clear edit ID after save
        }}
        pigeonData={editingPigeonId ? editingPigeonData?.data : null} // ✅ Only pass data if editing
      />

      <ViewPigeon
        visible={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewPigeonId(null); // reset when closing
        }}
        pigeonData={viewPigeonData?.data || null}
        loading={viewLoading}
      />
    </div>
  );
};

export default MyPigeon;
