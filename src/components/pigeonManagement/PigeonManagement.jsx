import {
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
  message,
} from "antd";
import { getCode, getNames } from "country-list";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { PiDnaBold } from "react-icons/pi";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "../myPigeon/myPigeon.responsive.css";
import {
  useDeletePigeonMutation,
  useGetAllPigeonsQuery,
  useGetSinglePigeonQuery,
  useTogglePigeonStatusMutation,
  useUpdatePigeonMutation,
} from "../../redux/apiSlices/allpigeonSlice";
// view handled by route /view-pigeon/:id
import { attachDragToElement } from "../common/dragScroll";
import { getImageUrl } from "../common/imageUrl";

const { Option } = Select;

const PigeonManagement = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const { id } = useParams();
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPigeonForEdit, setSelectedPigeonForEdit] = useState(null);
  const [editForm] = Form.useForm();
  const [isIconicEnabled, setIsIconicEnabled] = useState(false);
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

  // view data is fetched by the standalone view page at /view-pigeon/:id

  const [updatePigeon] = useUpdatePigeonMutation();
  const [deletePigeon] = useDeletePigeonMutation();
  const [togglePigeonStatus] = useTogglePigeonStatusMutation();

  // Track per-row updating state for inline edits
  const [updatingVerifications, setUpdatingVerifications] = useState({});
  // Optimistic values for inline verification so UI updates immediately
  const [verifyingValues, setVerifyingValues] = useState({});
  // Track per-row updating state for iconic score
  const [updatingIconicScores, setUpdatingIconicScores] = useState({});
  // Optimistic values for iconic score inline edits
  const [iconicScoreValues, setIconicScoreValues] = useState({});

  const pigeons = data?.pigeons || [];
  const total = data?.pagination?.total || 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleView = (record) => {
    navigate(`/view-pigeon/${record._id}`);
  };

  const showPdfExportModal = (record) => {
    console.log("[MyPigeon] navigating to export route for", record?._id);
    navigate(`/export-pdf/${record._id}`, {
      state: { from: "/pigeon-management" },
    });
  };

  const showFullEditModal = (record) => {
    setEditingPigeonId(record._id);
    setIsModalVisible(true);
  };

  const downloadUrl = async (url, filename) => {
    if (!url) {
      message.error("File not available for download");
      return;
    }

    // If url is an object URL or data URL, just use anchor
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // Try fetching the resource as a blob (better for cross-origin images when CORS allows)
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("Fetch failed");
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      return;
    } catch (err) {
      // Fallback to direct link (may open in new tab or be blocked by CORS)
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
  };

  const showEditModal = (record) => {
    setSelectedPigeonForEdit(record);

    // Simple boolean check since API returns "verified": true/false
    const isVerified = record.verified === "Yes";
    const isIconic = record.iconic === true;

    // Set initial iconic state for score field
    setIsIconicEnabled(isIconic);

    editForm.setFieldsValue({
      verification: isVerified ? "verified" : "notverified",
      iconic: isIconic ? "yes" : "no",
      iconicScore: record.iconicScore || 0,
    });
    setEditModalVisible(true);
  };

  const handleDownload = async (record, key) => {
    // pick the appropriate field or generate content
    switch (key) {
      case "pedigree":
        if (!record.pedigreePhoto) {
          return message.error("Pedigree photo not available for this pigeon");
        }
        return await downloadUrl(
          getImageUrl(record.pedigreePhoto),
          `${record.ringNumber || record._id}-pedigree.jpg`
        );
      case "ownership":
        if (!record.ownershipPhoto) {
          return message.error("Ownership card not available for this pigeon");
        }
        return await downloadUrl(
          getImageUrl(record.ownershipPhoto),
          `${record.ringNumber || record._id}-ownership.jpg`
        );
      case "dna":
        if (!record.DNAPhoto) {
          return message.error("DNA certificate not available for this pigeon");
        }
        return await downloadUrl(
          getImageUrl(record.DNAPhoto),
          `${record.ringNumber || record._id}-dna.jpg`
        );
      case "photo":
        if (!record.pigeonPhoto) {
          return message.error("Pigeon photo not available");
        }
        return await downloadUrl(
          getImageUrl(record.pigeonPhoto),
          `${record.ringNumber || record._id}-photo.jpg`
        );
      case "details": {
        console.log("[MyPigeon] download details requested for", record?._id);
        showPdfExportModal(record);
        return;
      }
      default:
        return message.error("Unknown download option");
    }
  };

  const handleEditUpdate = async () => {
    try {
      const values = await editForm.validateFields();

      const dataToSend = {
        verified: values.verification === "verified",
        iconic: values.iconic === "yes",
        iconicScore: parseInt(values.iconicScore) || 0,
      };

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("data", JSON.stringify(dataToSend));

      await updatePigeon({
        id: selectedPigeonForEdit._id,
        formData,
        token,
      }).unwrap();

      message.success("Pigeon details updated successfully!");
      setEditModalVisible(false);
      setSelectedPigeonForEdit(null);
      editForm.resetFields();
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || "Failed to update pigeon details");
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setSelectedPigeonForEdit(null);
    setIsIconicEnabled(false);
    editForm.resetFields();
  };

  const handleIconicChange = (value) => {
    const isIconic = value === "yes";
    setIsIconicEnabled(isIconic);

    // If iconic is set to "no", reset the score to 0
    if (!isIconic) {
      editForm.setFieldsValue({ iconicScore: 0 });
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPigeonId(null);
  };

  const handleViewCancel = () => {
    // kept for compatibility if other code calls it - no-op now
  };

  const showPedigreeChart = (record) => {
    navigate(`/pigeon-management/${record._id}`);
  };

  // ref for horizontal scrolling container
  const tableRowRef = useRef(null);

  // enable mouse and touch drag to scroll horizontally on the table container
  useEffect(() => {
    const el = tableRowRef.current;
    if (!el) return;

    const cleanup = attachDragToElement(el);
    return cleanup;
  }, [pigeons.length]);

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
      confirmButtonColor: "#37B7C3",
      cancelButtonColor: "#C33739",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePigeon(record._id).unwrap();
          message.success("Pigeon deleted successfully!");
        } catch (err) {
          message.error(err?.data?.message || "Failed to delete");
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
      confirmButtonColor: "#37B7C3",
      cancelButtonColor: "#C33739",
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

  // Inline Verified change from table
  const handleInlineVerifiedChange = async (record, value) => {
    const id = record._id;
    try {
      // optimistic update so select shows new value immediately
      setVerifyingValues((prev) => ({ ...prev, [id]: value }));
      // mark this row as updating
      setUpdatingVerifications((prev) => ({ ...prev, [id]: true }));

      const dataToSend = {
        verified: value === "Yes",
      };

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("data", JSON.stringify(dataToSend));

      await updatePigeon({ id, formData, token }).unwrap();

      message.success("Verification updated successfully");
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || "Failed to update verification");
    } finally {
      setUpdatingVerifications((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      // remove optimistic value once update completes; fresh data will come from refetch
      setTimeout(() => {
        setVerifyingValues((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }, 300);
    }
  };

  // Inline Iconic Score change from table
  const handleInlineIconicScoreChange = async (record, value) => {
    const id = record._id;
    try {
      // optimistic update
      setIconicScoreValues((prev) => ({ ...prev, [id]: value }));
      setUpdatingIconicScores((prev) => ({ ...prev, [id]: true }));

      const numeric = parseInt(value, 10) || 0;
      // If score is 0 => not iconic, otherwise iconic
      const dataToSend = { iconicScore: numeric, iconic: numeric > 0 };

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("data", JSON.stringify(dataToSend));

      await updatePigeon({ id, formData, token }).unwrap();

      message.success("Iconic score updated");
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || "Failed to update iconic score");
    } finally {
      setUpdatingIconicScores((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setTimeout(() => {
        setIconicScoreValues((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }, 300);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (src, record) => {
        const imageExists = src && src.trim() !== "";

        return imageExists ? (
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
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            {record?.name?.[0]?.toUpperCase()} {/* Show first letter of name */}
          </div>
        );
      },
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      width: 50,
      render: (verified, record) => {
        const optimistic = verifyingValues[record._id];
        return (
          <Select
            value={optimistic ?? verified}
            onChange={(val) => handleInlineVerifiedChange(record, val)}
            disabled={!!updatingVerifications[record._id]}
            style={{ width: 70 }}
            className="iconic-score-select"
            options={[
              {
                label: <span style={{ color: "green" }}>Yes</span>,
                value: "Yes",
              },
              { label: <span style={{ color: "red" }}>No</span>, value: "No" },
            ]}
          />
        );
      },
    },
    // { title: "Iconic", dataIndex: "iconic", key: "iconic" },
    {
      title: "Iconic Score",
      dataIndex: "iconicScore",
      key: "iconicScore",
      width: 140,
      render: (iconicScore, record) => {
        const optimistic = iconicScoreValues[record._id];
        const value = optimistic ?? iconicScore ?? 0;

        return (
          <Select
            showSearch
            allowClear
            value={value}
            onChange={(val) => handleInlineIconicScoreChange(record, val)}
            disabled={!!updatingIconicScores[record._id]}
            filterOption={(input, option) =>
              option?.label
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ width: 60 }}
            className="iconic-score-select"
            options={Array.from({ length: 99 }, (_, i) => ({
              label: `${99 - i}`,
              value: 99 - i,
            }))}
          />
        );
      },
    },
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
          <span>N/A</span>
        );
      },
    },
    // { title: "Pigeon ID", dataIndex: "pigeonId", key: "pigeonId" },
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
            <Tooltip title="View Pedigree​">
              <PiDnaBold
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => showPedigreeChart(record)}
              />
            </Tooltip>
            <Tooltip title="Edit Details">
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
            {/* Download menu */}
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => {
                    // menu keys: pedigree, ownership, details, dna, photo
                    handleDownload(record, key);
                  }}
                >
                  <Menu.Item key="pedigree">Original pedigree</Menu.Item>
                  <Menu.Item key="ownership">Ownership card</Menu.Item>
                  <Menu.Item key="details">Pigeon details</Menu.Item>
                  <Menu.Item key="dna">DNA certificate</Menu.Item>
                  <Menu.Item key="photo">Pigeon photo</Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Tooltip title="Download Options">
                <IoMdDownload
                  style={{
                    color: "#ffff",
                    fontSize: 16,
                    cursor: "pointer",
                    marginLeft: "-5px",
                  }}
                />
              </Tooltip>
            </Dropdown>
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
        <Row gutter={[16, 16]} className="pt-4 filters-row flex flex-wrap px-4 mb-4">
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Search</label>
              <Input
                placeholder="Search"
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
                className="custom-select-ant custom-select-ant-table-select"
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
                <Option value="Unspecified">Unspecified</Option>
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
      <div
        ref={tableRowRef}
        className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 custom-scrollbar hide-scrollbar cursor-grab"
      >
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div
            style={{ minWidth: pigeons.length > 0 ? "max-content" : "100%" }}
            className="bg-[#333D49] rounded-lg scale-x-70"
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
                          whiteSpace: "nowrap",
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
                {/* <Form.Item
                  label="Iconic Score"
                  name="iconicScore"
                  className="custom-form-item-ant"
                >
                  <Input
                    type="number"
                    placeholder="Enter Iconic Score"
                    className="custom-input-ant-modal"
                  />
                </Form.Item> */}

                <Form.Item
                  label="Iconic Score"
                  name="iconicScore"
                  // rules={[{ required: true, message: "Please select iconic score" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select Iconic Score"
                    className="custom-select-ant-modal custom-select-ant-modal-2"
                    showSearch // Enable search functionality
                    allowClear // Enable the clear button (cross icon)
                    optionFilterProp="children" // Ensures search is done based on the option's children (i.e., the value)
                    filterOption={(input, option) =>
                      option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {Array.from({ length: 101 }, (_, i) => i).map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
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

      {/* Edit Modal */}
      <Modal
        title="Edit Pigeon Details"
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleEditCancel}
            className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739] hover:!bg-transparent"
          >
            Cancel
          </Button>,
          <Button
            key="update"
            onClick={handleEditUpdate}
            className="bg-primary border border-primary hover:!border-primary text-white hover:!text-primary hover:!bg-transparent"
          >
            Update
          </Button>,
        ]}
        width={600}
      >
        <Form form={editForm} layout="vertical" className="custom-form-ant">
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Form.Item
                label="Verification"
                name="verification"
                rules={[
                  {
                    required: true,
                    message: "Please select verification status",
                  },
                ]}
                className="custom-form-item-ant"
              >
                <Select
                  placeholder="Select Verification Status"
                  className="custom-select-ant-modal"
                >
                  <Option value="verified">Verified</Option>
                  <Option value="notverified">Not Verified</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Iconic Status"
                name="iconic"
                rules={[
                  { required: true, message: "Please select iconic status" },
                ]}
                className="custom-form-item-ant"
              >
                <Select
                  placeholder="Select Iconic Status"
                  className="custom-select-ant-modal"
                  onChange={handleIconicChange}
                >
                  <Option value="yes">Yes</Option>
                  <Option value="no">No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} className="mb-10">
            <Col span={24}>
              <Form.Item
                label="Iconic Score"
                name="iconicScore"
                rules={[
                  {
                    required: isIconicEnabled,
                    message:
                      "Please select iconic score when iconic is enabled",
                  },
                ]}
                className="custom-form-item-ant"
              >
                <Select
                  placeholder={
                    isIconicEnabled
                      ? "Select Iconic Score (0-100)"
                      : "Score disabled (Iconic: No)"
                  }
                  className="custom-select-ant-modal"
                  disabled={!isIconicEnabled}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {Array.from({ length: 99 }, (_, i) => 99 - i).map((v) => (
                    <Option key={v} value={v}>
                      {v}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PigeonManagement;
