// ProductFormModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Card, Row, Col, message, Button } from "antd";
import { dummyCategories, dummySubCategories, getBase64 } from "./constants";
import VariantForm from "./VariantForm";

const { Option } = Select;

const ProductFormModal = ({ visible, onCancel, onSave, product }) => {
  const [form] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [variants, setVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [variantFileList, setVariantFileList] = useState([]);
  const [useSamePrice, setUseSamePrice] = useState(false);
  const [commonPrice, setCommonPrice] = useState(0);

  useEffect(() => {
    if (visible) {
      // If product exists, we're in edit mode
      if (product) {
        form.setFieldsValue({
          name: product.name,
          category: product.category,
          subCategory: product.subCategory,
          quality: product.quality,
        });

        setSelectedCategory(product.category);

        // Set variants if they exist
        if (product.variants && product.variants.length) {
          setVariants(product.variants);

          // Check if all variants have the same price
          const firstPrice = product.variants[0].price;
          const allSamePrice = product.variants.every(
            (v) => v.price === firstPrice
          );

          if (allSamePrice) {
            setUseSamePrice(true);
            setCommonPrice(firstPrice);
          } else {
            setUseSamePrice(false);
          }
        } else {
          // No variants - create default from main product data
          if (product.price !== undefined && product.quantity !== undefined) {
            setVariants([
              {
                id: Date.now(),
                size: "M",
                color: "#000000",
                colorName: "Black",
                price: product.price,
                quantity: product.quantity,
                images: product.images || [],
              },
            ]);
            setCommonPrice(product.price);
          } else {
            setVariants([]);
          }
        }
      } else {
        // Reset form for add mode
        form.resetFields();
        setVariants([]);
        setSelectedCategory("");
        setUseSamePrice(false);
        setCommonPrice(0);
      }
    }
  }, [visible, product, form]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    form.setFieldsValue({ subCategory: undefined });
  };

  const filteredSubCategories = dummySubCategories.filter(
    (subCat) => subCat.parentCategory === selectedCategory
  );

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (variants.length === 0) {
        message.error("Please add at least one variant");
        return;
      }

      // Combine basic product info with variants
      const productData = {
        ...values,
        variants: variants,
        // Use first variant's data for legacy fields
        price: variants[0].price,
        quantity: variants[0].quantity,
        images: variants[0].images,
        description: "",
        faq: [],
        hasFaq: false,
        hasDescription: false,
      };

      onSave(productData);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <>
      <Modal
        title={product ? "Edit Product" : "Add New Product"}
        open={visible}
        onCancel={onCancel}
        width={1000}
        confirmLoading={uploading}
        style={{ top: 20 }}
        footer={[
          <div key="custom-footer" className="mt-10 flex justify-end gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" loading={uploading} onClick={handleSubmit}>
              {product ? "Update Product" : "Add Product"}
            </Button>
          </div>,
        ]}
      >
        <div style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}>
          <Form form={form} layout="vertical" name="productForm">
            <Card title="Basic Product Information">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[
                      { required: true, message: "Please enter product name" },
                    ]}
                  >
                    <Input
                      placeholder="Enter product name"
                      style={{ height: 40 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[
                      { required: true, message: "Please select a category" },
                    ]}
                  >
                    <Select
                      placeholder="Select category"
                      onChange={handleCategoryChange}
                      style={{ height: 40 }}
                    >
                      {dummyCategories.map((cat) => (
                        <Option key={cat.id} value={cat.name}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="subCategory"
                    label="Sub Category"
                    rules={[
                      {
                        required: true,
                        message: "Please select a sub category",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select sub category"
                      disabled={!selectedCategory}
                      style={{ height: 40 }}
                    >
                      {filteredSubCategories.map((subCat) => (
                        <Option key={subCat.id} value={subCat.name}>
                          {subCat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="quality"
                    label="Quality"
                    rules={[
                      { required: true, message: "Please select quality" },
                    ]}
                  >
                    <Select placeholder="Select quality" style={{ height: 40 }}>
                      <Option value="Premium">Premium</Option>
                      <Option value="Standard">Standard</Option>
                      <Option value="Economy">Economy</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Product Variants" style={{ marginTop: 16 }}>
              <VariantForm
                form={variantForm}
                variants={variants}
                setVariants={setVariants}
                editingVariant={editingVariant}
                setEditingVariant={setEditingVariant}
                variantFileList={variantFileList}
                setVariantFileList={setVariantFileList}
                useSamePrice={useSamePrice}
                setUseSamePrice={setUseSamePrice}
                commonPrice={commonPrice}
                setCommonPrice={setCommonPrice}
                handlePreview={handlePreview}
                uploading={uploading}
              />
            </Card>
          </Form>
        </div>
      </Modal>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ProductFormModal;
