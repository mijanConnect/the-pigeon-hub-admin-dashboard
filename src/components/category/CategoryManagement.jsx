import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Typography,
  Breadcrumb,
  Card,
  Upload,
  message,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import SubCategoryManagement from "../../Pages/Dashboard/SubCategory";

const { Title } = Typography;

const CategoryManagement = () => {
  // State for categories
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Load initial data (mock data for demonstration)
  useEffect(() => {
    // In a real application, this would be an API call
    const mockCategories = [
      {
        id: 1,
        name: "Electronics",
        description: "Electronic devices",
        imageUrl: "https://i.ibb.co.com/C5dPm7xb/Frame-2147226698.png",
      },
      {
        id: 2,
        name: "Clothing",
        description: "Fashion items",
        imageUrl: "https://i.ibb.co.com/d4tpsSPj/Frame-2147227088-1.png",
      },
      {
        id: 3,
        name: "Books",
        description: "Reading materials",
        imageUrl: "https://i.ibb.co.com/C5dPm7xb/Frame-2147226698.png",
      },
    ];

    setCategories(mockCategories);
  }, []);

  // Reset image state when modal is opened/closed
  useEffect(() => {
    if (modalVisible) {
      if (editingId !== null) {
        const category = categories.find((c) => c.id === editingId);
        if (category?.imageUrl) {
          setImageUrl(category.imageUrl);
          setFileList([
            {
              uid: "-1",
              name: "category-image.png",
              status: "done",
              url: category.imageUrl,
            },
          ]);
        } else {
          setImageUrl(null);
          setFileList([]);
        }
      } else {
        setImageUrl(null);
        setFileList([]);
      }
    }
  }, [modalVisible, editingId, categories]);

  // Add or update a category
  const handleCategorySave = (values) => {
    if (editingId !== null) {
      setCategories(
        categories.map((category) =>
          category.id === editingId
            ? {
                ...category,
                ...values,
                imageUrl: imageUrl || category.imageUrl,
              }
            : category
        )
      );
      message.success("Category updated successfully");
    } else {
      // Add new category
      const newCategory = {
        id: Math.max(0, ...categories.map((c) => c.id)) + 1,
        ...values,
        imageUrl: imageUrl,
      };
      setCategories([...categories, newCategory]);
      message.success("Category added successfully");
    }
    resetModal();
  };

  // Delete a category
  const handleCategoryDelete = (id) => {
    setCategories(categories.filter((category) => category.id !== id));
    message.success("Category deleted successfully");
  };

  // Open modal for adding/editing
  const showModal = (id = null) => {
    setEditingId(id);

    // If editing, populate the form
    if (id !== null) {
      const category = categories.find((c) => c.id === id);
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }

    setModalVisible(true);
  };

  // Reset modal state
  const resetModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
    setImageUrl(null);
    setFileList([]);
  };

  // View subcategories for a specific category
  const viewSubCategories = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowSubCategories(true);
  };

  // Go back to categories list
  const backToCategories = () => {
    setShowSubCategories(false);
    setSelectedCategory(null);
  };

  // Handle image upload
  const handleImageUpload = ({ file, fileList }) => {
    setFileList(fileList);

    if (file.status === "uploading") {
      return;
    }

    if (file.status === "done") {
      const uploadedImageUrl = URL.createObjectURL(file.originFileObj);
      setImageUrl(uploadedImageUrl);
      message.success(`${file.name} uploaded successfully`);
    } else if (file.status === "error") {
      message.error(`${file.name} upload failed.`);
    }
  };

  // Configure image upload props
  const uploadProps = {
    name: "file",
    listType: "picture",
    maxCount: 1,
    fileList: fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload
    },
    onChange: handleImageUpload,
    onRemove: () => {
      setImageUrl(null);
      setFileList([]);
    },
  };

  // Category columns for table
  const categoryColumns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      align: "center",
      render: (imageUrl) =>
        imageUrl ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src={imageUrl}
              alt="image"
              style={{ width: 100, height: 40 }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: "#f0f0f0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No Image
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      width:400
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            description="All subcategories will also be deleted."
            onConfirm={() => handleCategoryDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => viewSubCategories(record.id)}
          >
            View Subcategories
          </Button>
        </Space>
      ),
    },
  ];

  if (showSubCategories && selectedCategory) {
    const category = categories.find((c) => c.id === selectedCategory);

    return (
      <SubCategoryManagement
        categoryId={selectedCategory}
        categoryName={category ? category.name : ""}
        onBack={backToCategories}
        categories={categories}
      />
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Category List</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Category
          </Button>
        </div>
        <Table
          columns={categoryColumns}
          dataSource={categories.map((item) => ({ ...item, key: item.id }))}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal for add/edit category */}
      <Modal
        title={`${editingId !== null ? "Edit" : "Add"} Category`}
        open={modalVisible}
        onCancel={resetModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCategorySave}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>
          {/* Replace your current Form.Item for Category Image with this */}
          <Form.Item label="Category Image" name="image">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            {imageUrl && (
              <div style={{ marginTop: 16 }}>
                <Image
                  src={imageUrl}
                  alt="Preview"
                  width={300}
                  height={150}
                  style={{
                    objectFit: "contain",
                    border: "1px solid #f0f0f0",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}
          </Form.Item>
          {/* {imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <Image
                src={imageUrl}
                alt="Preview"
                width={200}
                style={{ objectFit: "cover" }}
              />
            </div>
          )} */}
          <Form.Item className="text-right">
            <Space>
              <Button onClick={resetModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingId !== null ? "Update" : "Save"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
