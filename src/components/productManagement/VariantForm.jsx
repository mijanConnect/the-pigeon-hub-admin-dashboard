// VariantForm.js
import React from "react";
import {
  Form,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Button,
  Table,
  Space,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { sizeOptions, colorOptions } from "./constants";

const { Option } = Select;

const VariantForm = ({
  form,
  variants,
  setVariants,
  editingVariant,
  setEditingVariant,
  variantFileList,
  setVariantFileList,
  useSamePrice,
  setUseSamePrice,
  commonPrice,
  setCommonPrice,
  handlePreview,
  uploading,
}) => {
  const handleAddVariant = async () => {
    try {
      const values = await form.validateFields();

      // Process images
      const images = variantFileList
        .map((file) => {
          if (file.originFileObj) {
            // For demo, we'll just use a placeholder URL
            return `https://picsum.photos/id/${Math.floor(
              Math.random() * 100
            )}/800/800`;
          } else if (file.url) {
            return file.url;
          }
          return null;
        })
        .filter(Boolean);

      // Find the selected color name
      const selectedColor = colorOptions.find(
        (color) => color.value === values.color
      );
      const colorName = selectedColor ? selectedColor.name : "Custom";

      // Use common price if the option is selected
      const variantPrice = useSamePrice ? commonPrice : values.price;

      const newVariant = {
        id: editingVariant ? editingVariant.id : Date.now(),
        size: values.size,
        color: values.color,
        colorName: colorName,
        price: variantPrice,
        quantity: values.quantity,
        images: images,
      };

      if (editingVariant) {
        // Update existing variant
        setVariants(
          variants.map((v) => (v.id === editingVariant.id ? newVariant : v))
        );
      } else {
        // Add new variant
        setVariants([...variants, newVariant]);
      }

      // Reset form and state
      form.resetFields();
      setVariantFileList([]);
      setEditingVariant(null);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);

    // Set form values
    form.setFieldsValue({
      size: variant.size,
      color: variant.color,
      price: useSamePrice ? commonPrice : variant.price,
      quantity: variant.quantity,
    });

    // Set file list from images
    if (variant.images && variant.images.length) {
      const files = variant.images.map((img, index) => ({
        uid: `-${index}`,
        name: `image-${index}`,
        status: "done",
        url: img,
      }));
      setVariantFileList(files);
    } else {
      setVariantFileList([]);
    }
  };

  const handleDeleteVariant = (variantId) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  const resetVariantForm = () => {
    form.resetFields();
    setVariantFileList([]);
    setEditingVariant(null);
  };

  const handleCommonPriceChange = (value) => {
    setCommonPrice(value);

    // Update all existing variants with the new price
    if (useSamePrice && variants.length > 0) {
      setVariants(
        variants.map((variant) => ({
          ...variant,
          price: value,
        }))
      );
    }
  };

  const handleUseSamePriceChange = (e) => {
    const checked = e.target.checked;
    setUseSamePrice(checked);

    if (checked && variants.length > 0) {
      // If checked and we have variants, update all to the common price
      setVariants(
        variants.map((variant) => ({
          ...variant,
          price: commonPrice,
        }))
      );
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setVariantFileList(newFileList);
  };

  const columns = [
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      align: "center",
    },
    {
      title: "Color",
      key: "color",
      align: "center",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              backgroundColor: record.color,
              border: "1px solid #d9d9d9",
              marginRight: 8,
              borderRadius: 10,
            }}
          />
          {record.colorName}
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Images",
      key: "images",
      align: "center",
      render: (_, record) => (
        <span>{record.images ? record.images.length : 0} images</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditVariant(record)}
            type="primary"
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariant(record.id)}
            type="primary"
            danger
            size="small"
          />
        </Space>
      ),
    },
  ];

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Checkbox
              checked={useSamePrice}
              onChange={handleUseSamePriceChange}
            >
              Use same price for all variants
            </Checkbox>
          </Col>
          <Col>
            {useSamePrice && (
              <InputNumber
                min={0}
                value={commonPrice}
                onChange={handleCommonPriceChange}
                placeholder="Enter common price"
                style={{ width: 200, height: 40 }}
                addonBefore="Price"
              />
            )}
          </Col>
        </Row>
      </div>

      {variants.length > 0 && (
        <Table
          dataSource={variants}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" name="variantForm">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="size"
              label="Size"
              rules={[{ required: true, message: "Please select size" }]}
            >
              <Select placeholder="Select size" style={{ height: 40 }}>
                {sizeOptions.map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="color"
              label="Color"
              rules={[{ required: true, message: "Please select color" }]}
            >
              <Select placeholder="Select color" style={{ height: 40 }}>
                {colorOptions.map((color) => (
                  <Option key={color.value} value={color.value}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: color.value,
                          border: "1px solid #d9d9d9",
                          marginRight: 8,
                          borderRadius: 2,
                        }}
                      />
                      {color.name}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {!useSamePrice && (
            <Col span={6}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="Enter price"
                  style={{ width: "100%", height: 40 }}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={useSamePrice ? 6 : 6}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <InputNumber
                min={0}
                placeholder="Enter quantity"
                style={{ width: "100%", height: 40 }}
              />
            </Form.Item>
          </Col>
          {useSamePrice && (
            <Col span={6}>
              <Form.Item label="Variant Images">
                <Upload
                  listType="picture-card"
                  fileList={variantFileList}
                  onPreview={handlePreview}
                  onChange={handleUploadChange}
                  beforeUpload={() => false} // Prevent auto upload
                  multiple
                >
                  {variantFileList.length >= 8 ? null : uploadButton}
                </Upload>
              </Form.Item>
            </Col>
          )}
        </Row>

        {!useSamePrice && (
          <Form.Item label="Variant Images">
            <div style={{ overflow: "auto" }}>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "8px" }}
              >
                <Upload
                  listType="picture-card"
                  fileList={variantFileList}
                  onPreview={handlePreview}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  multiple
                  itemRender={(originNode, file, currFileList) => {
                    return (
                      <div style={{ display: "inline-block", marginRight: 0 }}>
                        {originNode}
                      </div>
                    );
                  }}
                >
                  {variantFileList.length >= 8 ? null : uploadButton}
                </Upload>
              </div>
            </div>
          </Form.Item>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {editingVariant && <Button onClick={resetVariantForm}>Cancel</Button>}
          <Button type="primary" onClick={handleAddVariant}>
            {editingVariant ? "Update Variant" : "Add Variant"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default VariantForm;
