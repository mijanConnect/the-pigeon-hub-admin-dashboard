// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Space,
//   Popconfirm,
//   Typography,
//   Breadcrumb,
//   Card,
//   message,
// } from "antd";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   ArrowLeftOutlined,
// } from "@ant-design/icons";

// const { Title } = Typography;

// const SubCategoryManagement = ({ categoryId, categoryName, onBack }) => {
//   // State for subcategories
//   const [subCategories, setSubCategories] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [form] = Form.useForm();

//   // Load initial data (mock data for demonstration)
//   useEffect(() => {
//     // In a real application, this would be an API call
//     const mockSubCategories = [
//       {
//         id: 1,
//         categoryId: 1,
//         name: "Smartphones",
//         description: "Mobile phones",
//       },
//       {
//         id: 2,
//         categoryId: 1,
//         name: "Laptops",
//         description: "Portable computers",
//       },
//       { id: 3, categoryId: 2, name: "T-shirts", description: "Casual wear" },
//       {
//         id: 4,
//         categoryId: 3,
//         name: "Fiction",
//         description: "Novels and stories",
//       },
//     ];

//     // Filter subcategories for the selected category
//     const filteredSubCategories = mockSubCategories.filter(
//       (sc) => sc.categoryId === categoryId
//     );

//     setSubCategories(filteredSubCategories);
//   }, [categoryId]);

//   // Add or update a subcategory
//   const handleSubCategorySave = (values) => {
//     if (editingId !== null) {
//       // Edit existing subcategory
//       setSubCategories(
//         subCategories.map((subCategory) =>
//           subCategory.id === editingId
//             ? { ...subCategory, ...values }
//             : subCategory
//         )
//       );
//       message.success("Subcategory updated successfully");
//     } else {
//       // Add new subcategory
//       const newSubCategory = {
//         id: Math.max(0, ...subCategories.map((c) => c.id || 0)) + 1,
//         categoryId: categoryId,
//         ...values,
//       };
//       setSubCategories([...subCategories, newSubCategory]);
//       message.success("Subcategory added successfully");
//     }
//     resetModal();
//   };

//   // Delete a subcategory
//   const handleSubCategoryDelete = (id) => {
//     setSubCategories(
//       subCategories.filter((subCategory) => subCategory.id !== id)
//     );
//     message.success("Subcategory deleted successfully");
//   };

//   // Open modal for adding/editing
//   const showModal = (id = null) => {
//     setEditingId(id);

//     // If editing, populate the form
//     if (id !== null) {
//       const subCategory = subCategories.find((sc) => sc.id === id);
//       form.setFieldsValue(subCategory);
//     } else {
//       form.resetFields();
//     }

//     setModalVisible(true);
//   };

//   // Reset modal state
//   const resetModal = () => {
//     setModalVisible(false);
//     setEditingId(null);
//     form.resetFields();
//   };

//   // SubCategory columns for table
//   const subCategoryColumns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space size="middle">
//           <Button
//             type="primary"
//             icon={<EditOutlined />}
//             onClick={() => showModal(record.id)}
//           >
//             Edit
//           </Button>
//           <Popconfirm
//             title="Are you sure you want to delete this subcategory?"
//             onConfirm={() => handleSubCategoryDelete(record.id)}
//             okText="Yes"
//             cancelText="No"
//           >
//             <Button danger icon={<DeleteOutlined />}>
//               Delete
//             </Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6">
//       {/* <Breadcrumb className="mb-4">
//         <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
//         <Breadcrumb.Item onClick={onBack} className="cursor-pointer">
//           Category Management
//         </Breadcrumb.Item>
//         <Breadcrumb.Item>{categoryName} Subcategories</Breadcrumb.Item>
//       </Breadcrumb> */}

//       <Card>
//         <div className="flex justify-between items-center mb-4">
//           <Space>
//             <Button
//               type="default"
//               icon={<ArrowLeftOutlined />}
//               onClick={onBack}
//             >
//               Back to Categories
//             </Button>
//             <Title level={4} className="m-0">
//               Subcategories of {categoryName}
//             </Title>
//           </Space>
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             onClick={() => showModal()}
//           >
//             Add Subcategory
//           </Button>
//         </div>

//         <Table
//           columns={subCategoryColumns}
//           dataSource={subCategories.map((item) => ({ ...item, key: item.id }))}
//           rowKey="id"
//           pagination={{ pageSize: 10 }}
//           locale={{ emptyText: "No subcategories found for this category" }}
//         />
//       </Card>

//       {/* Modal for add/edit subcategory */}
//       <Modal
//         title={`${editingId !== null ? "Edit" : "Add"} Subcategory`}
//         open={modalVisible}
//         onCancel={resetModal}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubCategorySave}>
//           <Form.Item
//             label="Name"
//             name="name"
//             rules={[{ required: true, message: "Please input the name!" }]}
//           >
//             <Input placeholder="Enter name" />
//           </Form.Item>
//           <Form.Item
//             label="Description"
//             name="description"
//             rules={[
//               { required: true, message: "Please input the description!" },
//             ]}
//           >
//             <Input.TextArea rows={4} placeholder="Enter description" />
//           </Form.Item>
//           <Form.Item label="Category">
//             <Input value={categoryName} disabled />
//           </Form.Item>
//           <Form.Item className="text-right">
//             <Space>
//               <Button onClick={resetModal}>Cancel</Button>
//               <Button type="primary" htmlType="submit">
//                 {editingId !== null ? "Update" : "Save"}
//               </Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default SubCategoryManagement;
