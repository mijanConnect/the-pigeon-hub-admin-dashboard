import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Switch,
  Table,
  Tooltip,
  message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useAddRoleMutation,
  useAddUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
} from "../../redux/apiSlices/usermanageSlice";
import { attachDragToElement } from "../common/dragScroll";

const { Option } = Select;

const LoginCredentials = () => {
  // API hooks
  const {
    data: apiUsers = { users: [], pagination: null },
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({ page: 1, limit: 10 });

  const { data: apiRoles = [] } = useGetRolesQuery();

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [addRoleApi, { isLoading: isAddingRole }] = useAddRoleMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  // Local UI / form state
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewForm] = Form.useForm();

  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [roleForm] = Form.useForm();

  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [userForm] = Form.useForm();
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

  // Sync users (ensure pages is included so edit modal receives pages)
  useEffect(() => {
    if (Array.isArray(apiUsers.users)) {
      setData(apiUsers.users);
    }
  }, [apiUsers]);

  // Sync roles from API
  useEffect(() => {
    if (Array.isArray(apiRoles)) {
      setRoles(apiRoles.map((r) => r.roleName));
    }
  }, [apiRoles]);

  // Show / Edit modal
  const showViewModal = (record) => {
    setSelectedRecord(record);
    // set fields explicitly (ensures Checkbox.Group receives values)
    viewForm.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      phone: record.phone,
      pageAccess: record.pages || [], // IMPORTANT: pre-select checkboxes from API pages
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
        customeRole: values.role,
        contact: values.phone,
        pages: values.pageAccess || [], // send updated pages from checkbox selection
      };

      console.log("updateUser", payload);

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

  // Add Role
  const handleAddRole = async () => {
    roleForm.validateFields().then(async (values) => {
      const roleName = values.roleName;
      try {
        await addRoleApi({ roleName }).unwrap();
        setRoles((prev) => [...prev, roleName]);
        message.success(`Role "${roleName}" has been successfully added.`);
        roleForm.resetFields();
        setIsRoleModalVisible(false);
        refetchUsers();
      } catch (err) {
        message.error(err?.data?.message || "Failed to add role.");
      }
    });
  };

  // Add User
  const handleAddUser = () => {
    userForm.validateFields().then(async (values) => {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        customeRole: values.role,
        contact: values.phone,
        pages: values.pageAccess || [],
      };

      try {
        await addUser(payload).unwrap();
        message.success(`${values.name} has been added successfully.`);
        userForm.resetFields();
        setIsUserModalVisible(false);
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
      confirmButtonColor: "#37B7C3",
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
    { title: "User Name", dataIndex: "name", key: "name", align: "center" },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Current Plan",
      dataIndex: "currentPlan",
      key: "currentPlan",
      align: "center",
    },
    { title: "Role", dataIndex: "role", key: "role", align: "center" },
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
            color: status === "Active" ? "#37B7C3" : "#ff4d4f",
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
                    record.status === "Active" ? "#37B7C3" : "gray",
                }}
                onChange={(checked) => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: `You are about to change status to ${
                      checked ? "Active" : "Inactive"
                    }.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#37B7C3",
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
                          }.`
                        );
                        refetchUsers();
                      } catch (err) {
                        message.error(
                          err?.data?.message || "Failed to update status."
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
            onClick={() => setIsUserModalVisible(true)}
            // className="bg-[#37B7C3] py-5 px-7 font-semibold text-[16px]"
            className="bg-[#37B7C3] hover:!bg-[#37B7C3]/80 text-white hover:!text-white py-5 px-7 font-semibold text-[16px] border-[#37B7C3] hover:!border-[#37B7C3]"
            loading={isAdding}
          >
            Add New User
          </Button>
          <Button
            onClick={() => setIsRoleModalVisible(true)}
            className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 px-7 font-semibold text-[16px]"
            loading={isAddingRole}
          >
            Add New Role
          </Button>
        </div>
      </div>

      <div
        ref={tableContainerRef}
        className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 hide-scrollbar custom-scrollbar"
      >
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div
            style={{ minWidth: "max-content" }}
            className="bg-[#333D49] rounded-lg"
          >
            <Table
              // rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
              loading={isUsersLoading}
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
                    No user found
                  </div>
                ),
              }}
              bordered={false}
              pagination={true}
              size="small"
              // scroll={{ x: "max-content" }}
              scroll={data.length > 0 ? { x: "max-content" } : undefined}
              rowKey="_id"
            />
          </div>
        </div>
      </div>

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
              </Col>{" "}
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
                    {roles.map((role) => (
                      <Option key={role} value={role}>
                        {role}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  className="custom-form-item-ant"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const digits = String(value).replace(/\D/g, "").length;
                        // Allow 7 to 15 digits (E.164 max is 15)
                        return digits >= 7 && digits <= 15
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Please enter a valid Phone Number")
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
              <Col xs={24} sm={24}>
                <Form.Item name="pageAccess" label="Page Access Control">
                  <Checkbox.Group className="custom-checkbox-ant-modal">
                    <Row>
                      <Col span={24}>
                        <Checkbox value="overview">Dashboard Overview</Checkbox>
                      </Col>
                      <Col span={24}>
                        <Checkbox value="pigeon">My Pigeons</Checkbox>
                      </Col>
                      <Col span={24}>
                        <Checkbox value="breeder">Verify Breeders</Checkbox>
                      </Col>
                      <Col span={24}>
                        <Checkbox value="package">
                          Subscription Packages
                        </Checkbox>
                      </Col>
                      <Col span={24}>
                        <Checkbox value="userManagement">
                          User Management
                        </Checkbox>
                      </Col>
                      <Col span={24}>
                        <Checkbox value="analytics">
                          Analytics & Reports
                        </Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* Add Role Modal */}
      <Modal
        title="Add New Role"
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsRoleModalVisible(false)}
            className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
          >
            Cancel
          </Button>,
          <Button
            key="add"
            className="bg-primary border border-primary text-white"
            onClick={handleAddRole}
          >
            Add Role
          </Button>,
        ]}
        width={500}
      >
        <Form form={roleForm} layout="vertical" className="mb-6">
          <Form.Item
            name="roleName"
            label="Role Name"
            rules={[{ required: true, message: "Please enter Role Name" }]}
            className="custom-form-item-ant"
          >
            <Input
              placeholder="Enter Role Name"
              className="custom-input-ant-modal"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        width={700}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsUserModalVisible(false)}
            className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
          >
            Cancel
          </Button>,
          <Button
            key="add"
            className="bg-primary border border-primary text-white"
            onClick={handleAddUser}
            loading={isAdding}
          >
            Add User
          </Button>,
        ]}
      >
        <Form form={userForm} layout="vertical" className="mb-6">
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
                rules={[{ required: true, message: "Please select a Role" }]}
                className="custom-form-item-ant-select"
              >
                <Select
                  placeholder="Select Role"
                  className="custom-select-ant-modal"
                >
                  {roles.map((role) => (
                    <Option key={role} value={role}>
                      {role}
                    </Option>
                  ))}
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
                      // Allow 7 to 15 digits (E.164 max is 15)
                      return digits >= 7 && digits <= 15
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Please enter a valid Phone Number")
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

            <Col xs={24} sm={12}>
              <Form.Item
                name="pageAccess"
                label="Page Access Control"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one page",
                  },
                ]}
                className="custom-form-item-ant-select"
              >
                <Checkbox.Group className="custom-checkbox-ant-modal">
                  <Row>
                    <Col span={24}>
                      <Checkbox value="overview">Dashboard Overview</Checkbox>
                    </Col>
                    <Col span={24}>
                      <Checkbox value="pigeon">My Pigeons</Checkbox>
                    </Col>
                    <Col span={24}>
                      <Checkbox value="breeder">Verify Breeders</Checkbox>
                    </Col>
                    <Col span={24}>
                      <Checkbox value="package">Subscription Packages</Checkbox>
                    </Col>
                    <Col span={24}>
                      <Checkbox value="userManagement">
                        User Management
                      </Checkbox>
                    </Col>
                    <Col span={24}>
                      <Checkbox value="analytics">Analytics & Reports</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginCredentials;
