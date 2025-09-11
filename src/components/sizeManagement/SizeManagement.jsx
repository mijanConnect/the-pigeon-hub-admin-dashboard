import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Switch,
  Form,
  Modal,
  Popconfirm,
  Typography,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const SizeManagement = () => {
  const [sizes, setSizes] = useState([
    { id: "1", size: "S", active: true },
    { id: "2", size: "M", active: true },
    { id: "3", size: "L", active: false },
    { id: "4", size: "XL", active: true },
  ]);

  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredItems = sizes.filter((item) =>
    item.size.toLowerCase().includes(searchText.toLowerCase())
  );

  const showAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      size: record.size,
      active: record.active,
    });
    setIsModalVisible(true);
  };

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingItem) {
          const updatedItems = sizes.map((item) =>
            item.id === editingItem.id ? { ...item, ...values } : item
          );
          setSizes(updatedItems);
        } else {
          const newItem = {
            id: Date.now().toString(),
            ...values,
            active: values.active || false,
          };
          setSizes([...sizes, newItem]);
        }
        setIsModalVisible(false);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleDelete = (id) => {
    setSizes(sizes.filter((item) => item.id !== id));
  };

  const handleToggleActive = (id, checked) => {
    const updatedItems = sizes.map((item) =>
      item.id === id ? { ...item, active: checked } : item
    );
    setSizes(updatedItems);
  };

  const columns = [
   {
  title: "Size",
  dataIndex: "size",
  key: "size",
  align: "center",
  render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>, // Make data bold
},

    {
      title: "Status",
      dataIndex: "active",
        key: "active",
      align:"center",
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: "Actions",
        key: "actions",
        align: "center",
      
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
                  onClick={() => showEditModal(record)}
                  className="mr-4"
          />
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Typography.Title level={2}>Size Management</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search size..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add New Size
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingItem ? "Edit Size" : "Add New Size"}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="size"
            label="Size"
            rules={[{ required: true, message: "Please select the size" }]}
          >
            <Select>
              {sizeOptions.map((size) => (
                <Select.Option key={size} value={size}>
                  {size}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="active" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SizeManagement;
