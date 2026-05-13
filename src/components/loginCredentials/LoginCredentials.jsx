import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
  Table,
  Tooltip,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useAddAdminMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
} from "../../redux/apiSlices/usermanageSlice";
import { attachDragToElement } from "../common/dragScroll";
import SyncHorizontalScroll from "../common/SyncHorizontalScroll";

const { Option } = Select;

const LoginCredentials = () => {
  // API hooks
  const {
    data: apiUsers = { users: [], pagination: null },
    isLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({ page: 1, limit: 10000 });

  const { data: apiRoles = [] } = useGetRolesQuery();

  const [addAdmin, { isLoading: isAddingAdmin }] = useAddAdminMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  // Local UI / form state
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewForm] = Form.useForm();

  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
  const [adminForm] = Form.useForm();
  const tableContainerRef = useRef(null);

  // pageAccess options (include options observed in API samples so edit modal can pre-select)
  const pageAccessOptions = [
    "analytics",
    "breeder",
    "overview",
    "package",
    "userManagement",
    "pigeon",
  ];

  const navigate = useNavigate();

  // Helper function to determine user type based on role and customRole
  const getUserType = (user) => {
    if (!user) return "Unknown";

    const role = user.role || "";
    const customeRole = user.customeRole || "";

    // Log for debugging
    console.log(
      `Checking user: ${user.name} | role: "${role}" | customeRole: "${customeRole}"`,
    );

    // Free user - role: USER and customRole: FREEUSER
    if (role === "PAIDUSER" && customeRole === "FREEUSER") {
      console.log("  ✓ Matched: Free user");
      return "Free user";
    }

    // Paid User - role: PAIDUSER and customRole: FREEUSER
    if (role === "PAIDUSER" && customeRole === "CASHPAID") {
      console.log("  ✓ Matched: Paid User");
      return "Paid User";
    }

    // Paid User Website - role: PAIDUSER and customRole is empty/null
    if (role === "PAIDUSER" && !customeRole) {
      console.log("  ✓ Matched: Paid User Website");
      return "Paid User Website";
    }

    // Registered - role: USER and customRole is empty/null
    if (role === "USER" && !customeRole) {
      console.log("  ✓ Matched: Registered");
      return "Registered";
    }

    console.log("  ✗ No match - Fallback to role");
    return role || "Unknown";
  };

  // Sync users - filter to show all users EXCEPT ADMIN
  useEffect(() => {
    if (Array.isArray(apiUsers.users)) {
      const filteredUsers = apiUsers.users.filter(
        (user) => user.role !== "ADMIN",
      );

      // Log first user to see exact structure
      if (filteredUsers.length > 0) {
        console.log("=== FIRST USER OBJECT ===");
        console.log("Full object:", filteredUsers[0]);
        console.log("role:", filteredUsers[0].role);
        console.log("customeRole:", filteredUsers[0].customeRole);
      }

      setData(filteredUsers);
      setOriginalData(filteredUsers);
      setSortedData(filteredUsers);
    }
  }, [apiUsers]);

  // Sync roles from API - filter only USER and PAIDUSER
  useEffect(() => {
    if (Array.isArray(apiRoles)) {
      const userRoles = apiRoles
        .map((r) => r.roleName)
        .filter((role) => role === "USER" || role === "PAIDUSER");
      setRoles(userRoles);
    }
  }, [apiRoles]);

  const getFormRole = (record) => {
    const role = record.role?.toUpperCase();
    const customRole = record.customeRole?.toUpperCase();

    if (role === "PAIDUSER" && customRole === "FREEUSER") {
      return "USER";
    }

    if (role === "PAIDUSER" && customRole === "CASHPAID") {
      return "PAIDUSER";
    }

    return role;
  };

  // Show / Edit modal
  const showViewModal = (record) => {
    setSelectedRecord(record);

    viewForm.setFieldsValue({
      name: record.name,
      email: record.email,
      role: getFormRole(record),
      phone: record.phone,
    });

    setIsViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedRecord(null);
    viewForm.resetFields();
  };

  const handleUpdateRecord = () => {
    viewForm.validateFields().then(async (values) => {
      const payload = {
        name: values.name,
        email: values.email,
        customeRole:
          values.role === "USER"
            ? "FREEUSER"
            : values.role === "PAIDUSER"
              ? "CASHPAID"
              : "",
        contact: values.phone,
      };

      try {
        await updateUser({ _id: selectedRecord._id, body: payload }).unwrap();
        message.success("User details have been updated successfully.");
        handleCloseViewModal();
        refetchUsers();
      } catch (err) {
        message.error(err?.data?.message || "Failed to update user.");
      }
    });
  };

  // Add User with role selection (USER or PAIDUSER)
  const handleAddUser = () => {
    adminForm.validateFields().then(async (values) => {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role:
          values.role === "USER"
            ? "PAIDUSER"
            : values.role === "PAIDUSER"
              ? "PAIDUSER"
              : "",
        customeRole:
          values.role === "USER"
            ? "FREEUSER"
            : values.role === "PAIDUSER"
              ? "CASHPAID"
              : "",
        contact: values.phone,
      };

      try {
        await addAdmin(payload).unwrap();
        message.success(`${values.name} has been added successfully.`);
        adminForm.resetFields();
        setIsAdminModalVisible(false);
        refetchUsers();
      } catch (err) {
        message.error(err?.data?.message || "Failed to add user.");
      }
    });
  };

  // Delete User
  const handleDelete = (record) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#088395",
      cancelButtonColor: "#C33739",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser({ _id: record._id }).unwrap();
          message.success("User has been deleted.");
          refetchUsers();
        } catch (err) {
          message.error(err?.data?.message || "Failed to delete user.");
        }
      }
    });
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      sorter: (a, b) =>
        (a?.name || "")
          .toString()
          .localeCompare((b?.name || "").toString(), undefined, {
            sensitivity: "base",
          }),
      sortDirections: ["ascend", "descend"],
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Current Plan",
      dataIndex: "currentPlan",
      key: "currentPlan",
      align: "center",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (_, record) => (
        <span style={{ color: "#088395", fontWeight: "500" }}>
          {getUserType(record)}
        </span>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          style={{
            color: status === "Active" ? "#088395" : "#ff4d4f",
            fontWeight: "500",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div className="flex gap-5 border px-4 py-2 rounded">
            <Tooltip title="View & Update Details">
              <button
                onClick={() => showViewModal(record)}
                className="text-white hover:text-gray-400 text-xl"
              >
                <FaEdit
                  style={{
                    color: "#ffff",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                />
              </button>
            </Tooltip>

            <Tooltip title="Delete">
              <button
                onClick={() => handleDelete(record)}
                className="text-red-500 hover:text-red-700 text-md"
              >
                <FaTrash
                  style={{
                    color: "text-red-700",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                />
              </button>
            </Tooltip>

            <Tooltip title="Status">
              <Switch
                size="small"
                checked={record.status === "Active"}
                style={{
                  backgroundColor:
                    record.status === "Active" ? "#088395" : "gray",
                }}
                onChange={(checked) => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: `You are about to change status to ${
                      checked ? "Active" : "Inactive"
                    }.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#088395",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, change it!",
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      try {
                        await toggleUserStatus({
                          _id: record._id,
                          status: checked,
                        }).unwrap();

                        message.success(
                          `Status has been changed to ${
                            checked ? "Active" : "Inactive"
                          }.`,
                        );
                        refetchUsers();
                      } catch (err) {
                        message.error(
                          err?.data?.message || "Failed to update status.",
                        );
                      }
                    }
                  });
                }}
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

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const cleanup = attachDragToElement(el);
    return cleanup;
  }, [data.length]);

  return (
    <div className="mt-4">
      <div className="flex justify-end items-center mb-4 ">
        <div className="flex gap-5">
          <Button
            onClick={() => setIsAdminModalVisible(true)}
            className="bg-[#088395] hover:!bg-[#088395]/80 text-white hover:!text-white py-5 px-7 font-semibold text-[16px] border-[#088395] hover:!border-[#088395]"
            loading={isAddingAdmin}
          >
            Add User
          </Button>
        </div>
      </div>

      <SyncHorizontalScroll
        containerClassName="overflow-x-auto border rounded-lg shadow-md bg-gray-50 custom-scrollbar hide-scrollbar cursor-grab"
        watch={data.length}
      >
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div
            style={{ minWidth: data.length > 0 ? "max-content" : "100%" }}
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
                dataSource={sortedData}
                rowClassName={() => "hover-row"}
                bordered={false}
                size="small"
                rowKey="_id"
                scroll={data.length > 0 ? { x: "max-content" } : undefined}
                pagination={false}
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
                      No users found
                    </div>
                  ),
                }}
                onChange={(pagination, filters, sorter) => {
                  // Handle client-side sorting
                  const s = Array.isArray(sorter) ? sorter[0] : sorter;

                  if (!s || !s.column) {
                    setSortedData(originalData);
                    return;
                  }

                  const key = s.field || s.columnKey || s.column?.key;
                  const order = s.order;

                  if (!order) {
                    setSortedData(originalData);
                    return;
                  }

                  const next = [...originalData];
                  if (key === "name") {
                    next.sort((a, b) => {
                      const A = (a?.name || "").toString();
                      const B = (b?.name || "").toString();
                      const cmp = A.localeCompare(B, undefined, {
                        sensitivity: "base",
                      });
                      return order === "ascend" ? cmp : -cmp;
                    });
                  }

                  setSortedData(next);
                }}
              />
            )}
          </div>
        </div>
      </SyncHorizontalScroll>

      {/* View/Edit User Modal */}
      <Modal
        title="View User Details"
        open={isViewModalVisible}
        onCancel={handleCloseViewModal}
        width={800}
        footer={[
          <Button
            key="cancel"
            onClick={handleCloseViewModal}
            className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
          >
            Cancel
          </Button>,
          <Button
            key="save"
            className="bg-primary border border-primary text-white"
            onClick={handleUpdateRecord}
            loading={isUpdating}
          >
            Save Changes
          </Button>,
        ]}
      >
        {selectedRecord && (
          <Form
            form={viewForm}
            layout="vertical"
            initialValues={selectedRecord}
            className="mb-6"
          >
            <Row gutter={[30, 20]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  className="custom-form-item-ant"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input
                    placeholder="Enter Name"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  className="custom-form-item-ant"
                  rules={[
                    { required: true, message: "Please enter email" },
                    {
                      pattern:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  ]}
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <Input
                    placeholder="Enter Email"
                    className="custom-input-ant-modal"
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="role"
                  label="Role"
                  className="custom-form-item-ant-select"
                  rules={[{ required: true, message: "Please select role" }]}
                >
                  <Select
                    placeholder="Select Role"
                    className="custom-select-ant-modal"
                  >
                    <Option value="USER">USER</Option>
                    <Option value="PAIDUSER">PAIDUSER</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  className="custom-form-item-ant"
                  rules={[
                    { required: true, message: "Please enter Phone Number" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const digits = String(value).replace(/\D/g, "").length;
                        return digits >= 7 && digits <= 15
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Please enter a valid Phone Number"),
                            );
                      },
                    },
                  ]}
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <Input
                    placeholder="Enter Phone Number"
                    className="custom-input-ant-modal"
                    inputMode="tel"
                    maxLength={20}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* Add User Modal with Role Selection */}
      <Modal
        title="Add User"
        open={isAdminModalVisible}
        onCancel={() => setIsAdminModalVisible(false)}
        width={700}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsAdminModalVisible(false)}
            className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
          >
            Cancel
          </Button>,
          <Button
            key="add"
            className="bg-primary border border-primary text-white"
            onClick={handleAddUser}
            loading={isAddingAdmin}
          >
            Add User
          </Button>,
        ]}
      >
        <Form form={adminForm} layout="vertical" className="mb-6">
          <Row gutter={[30, 20]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter Name" }]}
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
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter Email" },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Please enter a valid email address",
                  },
                ]}
                validateTrigger={["onChange", "onBlur"]}
                className="custom-form-item-ant"
              >
                <Input
                  placeholder="Enter Email"
                  className="custom-input-ant-modal"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="role"
                label="Role"
                initialValue="USER"
                rules={[{ required: true, message: "Please select a Role" }]}
                className="custom-form-item-ant-select"
              >
                <Select
                  placeholder="Select Role"
                  className="custom-select-ant-modal"
                >
                  <Option value="USER">USER</Option>
                  <Option value="PAIDUSER">PAIDUSER</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please enter Phone Number" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const digits = String(value).replace(/\D/g, "").length;
                      return digits >= 7 && digits <= 15
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Please enter a valid Phone Number"),
                          );
                    },
                  },
                ]}
                validateTrigger={["onChange", "onBlur"]}
                className="custom-form-item-ant"
              >
                <Input
                  placeholder="Enter Phone Number"
                  className="custom-input-ant-modal"
                  inputMode="tel"
                  maxLength={20}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter Password" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters long",
                  },
                ]}
                className="custom-form-item-ant"
              >
                <Input.Password
                  placeholder="Enter Password"
                  className="custom-input-ant-modal"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginCredentials;
