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
  Card,
  Select,
  Upload,
  message,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const SubCategoryManagement = ({
  categoryId,
  categoryName,
  onBack,
  categories,
}) => {
  // State for subcategories
  const [subCategories, setSubCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [filteredCategoryId, setFilteredCategoryId] = useState(
    categoryId || null
  );
  const [imageUrl, setImageUrl] = useState(null);
  const [fileList, setFileList] = useState([]);

  // On first load, if categoryId is provided, use it as the initial filter
  useEffect(() => {
    if (categoryId) {
      setFilteredCategoryId(categoryId);
    } else if (categories && categories.length > 0) {
      const savedCategoryId = localStorage.getItem("selectedCategoryId");
      if (savedCategoryId) {
        setFilteredCategoryId(Number(savedCategoryId));
      } else {
        setFilteredCategoryId(categories[0].id);
      }
    }
  }, [categoryId, categories]);

  // Store the selected category ID in localStorage for persistence
  useEffect(() => {
    if (filteredCategoryId) {
      localStorage.setItem("selectedCategoryId", filteredCategoryId);
    }
  }, [filteredCategoryId]);

  // Reset image state when modal is opened/closed
  useEffect(() => {
    if (modalVisible) {
      if (editingId !== null) {
        const subCategory = subCategories.find((sc) => sc.id === editingId);
        if (subCategory?.imageUrl) {
          setImageUrl(subCategory.imageUrl);
          setFileList([
            {
              uid: "-1",
              name: "subcategory-image.png",
              status: "done",
              url: subCategory.imageUrl,
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
  }, [modalVisible, editingId, subCategories]);

  // Mock data function - in a real app this would be an API call
  const fetchSubCategories = () => {
    // Mock data
    const mockSubCategories = [
      {
        id: 1,
        categoryId: 1,
        name: "Smartphones",
        description: "Mobile phones",
        imageUrl: "https://i.ibb.co.com/d4tpsSPj/Frame-2147227088-1.png",
      },
      {
        id: 2,
        categoryId: 1,
        name: "Laptops",
        description: "Portable computers",
        imageUrl: "https://i.ibb.co.com/C5dPm7xb/Frame-2147226698.png",
      },
      {
        id: 3,
        categoryId: 2,
        name: "T-shirts",
        description: "Casual wear",
        imageUrl: "https://i.ibb.co.com/d4tpsSPj/Frame-2147227088-1.png",
      },
      {
        id: 4,
        categoryId: 3,
        name: "Fiction",
        description: "Novels and stories",
        imageUrl: "https://i.ibb.co.com/C5dPm7xb/Frame-2147226698.png",
      },
    ];

    return mockSubCategories;
  };

  // Load subcategories based on the selected category ID
  useEffect(() => {
    if (filteredCategoryId) {
      const allSubCategories = fetchSubCategories();
      const filteredSubCategories = allSubCategories.filter(
        (sc) => sc.categoryId === Number(filteredCategoryId)
      );
      setSubCategories(filteredSubCategories);
    }
  }, [filteredCategoryId]);

  // Handle image upload
  const handleImageUpload = ({ file, fileList }) => {
    setFileList(fileList);

    if (file.status === "uploading") {
      return;
    }

    if (file.status === "done") {
      // In a real app, you would get the URL from the server response
      // For now, we'll simulate with a placeholder
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

  // Add or update a subcategory
  const handleSubCategorySave = (values) => {
    if (editingId !== null) {
      // Edit existing subcategory
      setSubCategories(
        subCategories.map((subCategory) =>
          subCategory.id === editingId
            ? {
                ...subCategory,
                ...values,
                imageUrl: imageUrl || subCategory.imageUrl,
              }
            : subCategory
        )
      );
      message.success("Subcategory updated successfully");
    } else {
      // Add new subcategory
      const newSubCategory = {
        id: Math.max(0, ...subCategories.map((c) => c.id || 0)) + 1,
        categoryId: values.categoryId || filteredCategoryId, // Use categoryId from the form or current filter
        imageUrl: imageUrl,
        ...values,
      };
      setSubCategories([...subCategories, newSubCategory]);
      message.success("Subcategory added successfully");

      // If we added to a different category than what's filtered, update the filter
      if (values.categoryId !== filteredCategoryId) {
        setFilteredCategoryId(values.categoryId);
      }
    }
    resetModal();
  };

  // Delete a subcategory
  const handleSubCategoryDelete = (id) => {
    setSubCategories(
      subCategories.filter((subCategory) => subCategory.id !== id)
    );
    message.success("Subcategory deleted successfully");
  };

  // Open modal for adding/editing
  const showModal = (id = null) => {
    setEditingId(id);

    // If editing, populate the form
    if (id !== null) {
      const subCategory = subCategories.find((sc) => sc.id === id);
      form.setFieldsValue(subCategory);
    } else {
      form.resetFields();
      // Set the current categoryId as default for new subcategories
      form.setFieldsValue({ categoryId: Number(filteredCategoryId) });
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

  // Handle category filter change
  const handleCategoryFilterChange = (value) => {
    setFilteredCategoryId(Number(value));
    localStorage.setItem("selectedCategoryId", value);
  };

  // Get current category name
  const getCurrentCategoryName = () => {
    if (!categories) return "";
    const currentCategory = categories.find(
      (cat) => cat.id === Number(filteredCategoryId)
    );
    return currentCategory ? currentCategory.name : categoryName || "";
  };

  // SubCategory columns for table
  const subCategoryColumns = [
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
              alt="thumbnail"
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
            title="Are you sure you want to delete this subcategory?"
            onConfirm={() => handleSubCategoryDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
            >
              Back to Categories
            </Button>
            <Title level={4} className="m-0">
              Subcategories of {getCurrentCategoryName()}
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Subcategory
          </Button>
        </div>

        {/* Category Filter - Now ALWAYS enabled, regardless of source */}
        <div className="mb-4">
          <Select
            value={filteredCategoryId}
            onChange={handleCategoryFilterChange}
            style={{ width: 200 }}
          >
            {categories?.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>

        <Table
          columns={subCategoryColumns}
          dataSource={subCategories.map((item) => ({ ...item, key: item.id }))}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No subcategories found for this category" }}
        />
      </Card>

      {/* Modal for add/edit subcategory */}
      <Modal
        title={`${editingId !== null ? "Edit" : "Add"} Subcategory`}
        open={modalVisible}
        onCancel={resetModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubCategorySave}>
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
          <Form.Item
            label="Category"
            name="categoryId"
            initialValue={Number(filteredCategoryId)}
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select>
              {categories?.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Subcategory Image" name="image">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
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

export default SubCategoryManagement;
