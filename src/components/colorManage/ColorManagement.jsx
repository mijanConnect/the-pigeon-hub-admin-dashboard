import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  Tooltip,
  message,
  Popconfirm,
  Card,
  Typography,
  Divider,
  ColorPicker,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ColorManagementSystem from "./ColorManagementSystem";

const { Title } = Typography;

// React component for color management
const ColorManagement = () => {
  const [colorSystem] = useState(
    new ColorManagementSystem([
      {
        id: 1,
        name: "Primary Blue",
        colorCode: "#1890ff",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Success Green",
        colorCode: "#52c41a",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Warning Yellow",
        colorCode: "#faad14",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Error Red",
        colorCode: "#f5222d",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: "Gray",
        colorCode: "#d9d9d9",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  );

  const [colors, setColors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingColor, setEditingColor] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Load colors on component mount
    refreshColors();
  }, []);

  const refreshColors = () => {
    setColors(colorSystem.getAllColors());
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setColors(colorSystem.searchColors(value));
  };

  const showAddModal = () => {
    setEditingColor(null);
    form.resetFields();
    form.setFieldsValue({ colorCode: "#1890ff", isActive: true });
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingColor(record);
    form.setFieldsValue({
      name: record.name,
      colorCode: record.colorCode,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Get form values and ensure we have the proper hex color
        const formValues = {
          ...values,
          colorCode:
            typeof values.colorCode === "object"
              ? values.colorCode.toHexString()
              : values.colorCode,
        };

        if (editingColor) {
          // Edit existing color
          const result = colorSystem.editColor(editingColor.id, formValues);
          if (result.success) {
            message.success(result.message);
            refreshColors();
            setIsModalVisible(false);
          } else {
            message.error(result.message);
          }
        } else {
          // Add new color
          const result = colorSystem.addColor(
            formValues.name,
            formValues.colorCode,
            formValues.isActive
          );
          if (result.success) {
            message.success(result.message);
            refreshColors();
            setIsModalVisible(false);
          } else {
            message.error(result.message);
          }
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (id) => {
    const result = colorSystem.deleteColor(id);
    if (result.success) {
      message.success(result.message);
      refreshColors();
    } else {
      message.error(result.message);
    }
  };

  const handleToggleStatus = (id) => {
    const result = colorSystem.toggleColorStatus(id);
    if (result.success) {
      message.success(result.message);
      refreshColors();
    } else {
      message.error(result.message);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Color Preview",
      dataIndex: "colorCode",
      key: "preview",
      align: "center",
      render: (colorCode) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              backgroundColor: colorCode,
              width: 40,
              height: 40,
              borderRadius: 30,
              border: "1px solid #d9d9d9",
            }}
          />
        </div>
      ),
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Color Code",
      dataIndex: "colorCode",
      key: "colorCode",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this color?"
            description="Are you sure you want to delete this color?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <Title level={2}>Color Management System</Title>

        <Space style={{ marginBottom: 16 }} className="flex justify-between">
          <Input
            placeholder="Search colors"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200,height:40 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} style={{height: 40}}>
            Add New Color
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={colors}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Color Modal */}
      <Modal
        title={editingColor ? "Edit Color" : "Add New Color"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingColor ? "Update" : "Add"}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item
            name="name"
            label="Color Name"
            rules={[{ required: true, message: "Please enter a color name" }]}
          >
            <Input placeholder="e.g., Primary Blue" />
          </Form.Item>

          <Form.Item
            name="colorCode"
            label="Color Code"
            rules={[{ required: true, message: "Please select a color" }]}
          >
            <ColorPicker
              showText
              format="hex"
              defaultValue={editingColor?.colorCode || "#1890ff"}
              value={form.getFieldValue("colorCode")}
              onChangeComplete={(color) => {
                // Use the hexString directly - this is the crucial fix
                form.setFieldsValue({ colorCode: color.toHexString() });
                console.log("Color set to:", color.toHexString());
              }}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ColorManagement;
