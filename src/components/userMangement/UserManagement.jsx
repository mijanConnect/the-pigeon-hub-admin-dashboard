import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Tag,
  Typography,
  message,
  Modal,
  Select,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    setLoading(true);

    const mockUsers = Array(50)
      .fill()
      .map((_, index) => ({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        phone: `+1 ${Math.floor(100000000 + Math.random() * 900000000)}`,
        address: `${index + 100} Main Street, City ${index % 10}, Country`,
        status: ["user", "vendor", "admin"][Math.floor(Math.random() * 3)],
        isBlocked: Math.random() > 0.8,
      }));

    setUsers(mockUsers);
    setPagination({
      ...pagination,
      total: mockUsers.length,
    });
    setLoading(false);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const getProcessedUsers = () => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const handleDelete = (userId) => {
    confirm({
      title: "Are you sure you want to delete this user?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        setUsers(users.filter((user) => user.id !== userId));
        message.success("User deleted successfully");
      },
    });
  };

  const handleToggleBlock = (userId, currentBlockStatus) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isBlocked: !currentBlockStatus } : user
      )
    );
    message.success(
      `User ${currentBlockStatus ? "unblocked" : "blocked"} successfully`
    );
  };

  // Define columns based on screen size
  const getColumns = () => {
    return [
      {
        title: "Serial",
        dataIndex: "id",
        key: "id",
        width: 80,
        align: "center",
        render: (text, record, index) => {
          return (pagination.current - 1) * pagination.pageSize + index + 1;
        },
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        align: "center",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "center",
        responsive: ["md"],
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        align: "center",
        responsive: ["lg"],
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        align: "center",
        ellipsis: true,
        responsive: ["lg"],
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => {
          let color = "blue";
          if (status === "admin") color = "red";
          else if (status === "vendor") color = "green";
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        render: (_, record) => (
          <Space wrap size="small">
            <Button
              type={record.isBlocked ? "dashed" : "primary"}
              size="middle"
              icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
              onClick={() => handleToggleBlock(record.id, record.isBlocked)}
            >
              {record.isBlocked ? "Unblock" : "Block"}
            </Button>
            <Popconfirm
              title="Delete this user?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="middle" icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  };

  return (
    <div className="w-full px-2 md:px-4 py-4">
      <div className="flex w-full justify-between items-start md:items-center mb-4 gap-4">
        <Title level={4} className="m-0 text-lg md:text-xl">
          User Management
        </Title>

        <div className="w-full md:w-auto flex  gap-2">
          <Input
            placeholder="Search by name or email"
            prefix={<SearchOutlined />}
            className="w-full sm:w-48 md:w-64 h-12"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-full sm:w-36 h-12"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Users</Option>
            <Option value="user">Users</Option>
            <Option value="vendor">Vendors</Option>
            <Option value="admin">Admins</Option>
          </Select>
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-1">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table
            columns={getColumns()}
            dataSource={getProcessedUsers()}
            rowKey="id"
            pagination={{
              ...pagination,
              size: "default",
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
            loading={loading}
            size="middle"
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
