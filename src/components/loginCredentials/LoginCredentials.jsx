import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tooltip,
  Switch,
  Select,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaEye,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const { Option } = Select;

const components = {
  header: {
    row: (props) => (
      <tr
        {...props}
        style={{
          backgroundColor: "#f0f5f9",
          height: "50px",
          color: "secondary",
          fontSize: "18px",
          textAlign: "center",
          padding: "12px",
        }}
      />
    ),
    cell: (props) => (
      <th
        {...props}
        style={{
          color: "secondary",
          fontWeight: "bold",
          fontSize: "18px",
          textAlign: "center",
          padding: "12px",
        }}
      />
    ),
  },
};

const LoginCredentials = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "example@email.com",
      role: "Admin",
      phone: "+1234567890",
      status: "Active",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@email.com",
      role: "User",
      phone: "+9876543210",
      status: "Inactive",
    },
  ]);

  const [roles, setRoles] = useState(["Admin", "User"]); // Default roles

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewForm] = Form.useForm();

  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [roleForm] = Form.useForm();

  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [userForm] = Form.useForm();

  const navigate = useNavigate();

  // View/Edit User Modal
  const showViewModal = (record) => {
    setSelectedRecord(record);
    viewForm.setFieldsValue(record);
    setIsViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedRecord(null);
  };

  const handleUpdateRecord = () => {
    viewForm.validateFields().then((values) => {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRecord.id ? { ...item, ...values } : item
        )
      );
      Swal.fire({
        title: "Updated!",
        text: "User details have been updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsViewModalVisible(false);
    });
  };

  // Add Role
  const handleAddRole = () => {
    roleForm.validateFields().then((values) => {
      setRoles((prev) => [...prev, values.roleName]); // Add role to dropdown
      Swal.fire({
        title: "Role Added!",
        text: `Role "${values.roleName}" has been successfully added.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      roleForm.resetFields();
      setIsRoleModalVisible(false);
    });
  };

  // Add New User
  const handleAddUser = () => {
    userForm.validateFields().then((values) => {
      const newUser = {
        id: data.length + 1,
        ...values,
        status: "Active",
      };
      setData((prev) => [...prev, newUser]);
      Swal.fire({
        title: "User Added!",
        text: `${values.name} has been added successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      userForm.resetFields();
      setIsUserModalVisible(false);
    });
  };

  const columns = [
    { title: "User Name", dataIndex: "name", key: "name", align: "center" },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    { title: "Role", dataIndex: "role", key: "role", align: "center" },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
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
                onClick={() => {
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
                      setData(data.filter((item) => item.id !== record.id));
                      Swal.fire({
                        title: "Deleted!",
                        text: "User has been deleted.",
                        icon: "success",
                      });
                    }
                  });
                }}
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
                    record.status === "Active" ? "#3fae6a" : "gray",
                }}
                onChange={(checked) => {
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
                          item.id === record.id
                            ? {
                                ...item,
                                status: checked ? "Active" : "Inactive",
                              }
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

  return (
    <div>
      <div className="flex justify-end items-center mb-4 ">
        <div className="flex gap-5">
          <Button
            type="primary"
            onClick={() => setIsUserModalVisible(true)}
            className="bg-[#37B7C3] py-5 px-7 font-semibold text-[16px]"
          >
            Add New User
          </Button>
          <Button
            type="primary"
            onClick={() => setIsRoleModalVisible(true)}
            className="py-5 px-7 font-semibold text-[16px]"
          >
            Add New Role
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div style={{ minWidth: "max-content" }}>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
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
              rowKey="id"
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
          <Button key="cancel" onClick={handleCloseViewModal}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleUpdateRecord}>
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
                    { type: "email", message: "Enter a valid email" },
                  ]}
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
                  rules={[{ required: true, message: "Please enter phone" }]}
                >
                  <Input
                    placeholder="Enter Phone Number"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* Add New Role Modal */}
      <Modal
        title="Add New Role"
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRoleModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddRole}>
            Add Role
          </Button>,
        ]}
        width={500}
      >
        <Form form={roleForm} layout="vertical" className="mb-6">
          <Form.Item
            name="roleName"
            label="Role Name"
            rules={[{ required: true, message: "Please enter role name" }]}
            className="custom-form-item-ant"
          >
            <Input
              placeholder="Enter Role Name"
              className="custom-input-ant-modal"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add New User Modal */}
      <Modal
        title="Add New User"
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setIsUserModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddUser}>
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
                name="email"
                label="Email"
                rules={[{ required: true, message: "Please enter email" }]}
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
                rules={[{ required: true, message: "Please select a role" }]}
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
                rules={[{ required: true, message: "Please enter phone" }]}
                className="custom-form-item-ant"
              >
                <Input
                  placeholder="Enter Phone"
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
