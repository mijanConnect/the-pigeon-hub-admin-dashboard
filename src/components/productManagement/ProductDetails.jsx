import React, { useState } from "react";
import {
  Modal,
  Descriptions,
  Image,
  Divider,
  Typography,
  Tabs,
  Card,
  Tag,
  Empty,
  Table,
  Space,
  Badge,
  Collapse,
} from "antd";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const ProductDetailModal = ({ visible, onCancel, product }) => {
  const [activeVariant, setActiveVariant] = useState(null);

  if (!product) {
    return null;
  }

  // Set the first variant as active if none is selected
  if (product.variants && product.variants.length > 0 && !activeVariant) {
    setActiveVariant(product.variants[0]);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const variantColumns = [
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      align: "center",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      align: "center",
      render: (color) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: color,
              borderRadius: "50%",
              border: "1px solid #ddd",
              marginRight: "8px",
            }}
          />
          {color}
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => (
        <span style={{ color: "#f50", fontWeight: "bold" }}>
          $ {price?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (quantity) => (
        <span>
          {quantity}
          {quantity <= 5 && (
            <Badge
              count="Low Stock"
              style={{ backgroundColor: "#ff4d4f", marginLeft: "8px" }}
            />
          )}
        </span>
      ),
    },
    {
      title: "Images",
      dataIndex: "images",
      key: "images",
      align: "center",
      render: (images) => <span>{images ? images.length : 0} images</span>,
    },
  ];

  const handleVariantClick = (variant) => {
    setActiveVariant(variant);
  };



  return (
    <Modal
      title={<Title level={4}>{product.name}</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1100}
    >
      <div className="product-detail-content">
        <div className="flex flex-wrap">
          {/* Left side - Images */}
          <div style={{ width: "40%", paddingRight: "20px" }}>
            {activeVariant &&
            activeVariant.images &&
            activeVariant.images.length > 0 ? (
              <div className="product-images space-y-4 ">
                {/* Main image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <Image
                    src={activeVariant.images[0]}
                    alt={`${product.name} - Main Image`}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                    className="rounded-lg"
                  />
                </div>

                {/* Thumbnail images */}
                {activeVariant.images.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {activeVariant.images.slice(1).map((image, index) => (
                      <Image
                        key={index + 1}
                        src={image}
                        alt={`${product.name} - Image ${index + 2}`}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        className="rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Empty description="No images available" />
            )}
          </div>

          {/* Right side - Product Info */}
          <div style={{ width: "60%" }}>
            <Descriptions
              bordered
              column={1}
              size="small"
              layout="horizontal" 
              style={{ marginBottom: "16px", }}
            >
              <Descriptions.Item label="Category" >
                <Tag color="blue">{product.category}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Sub Category" >
                <Tag color="cyan">{product.subCategory}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Quality" >
                <Tag
                  color={
                    product.quality === "Premium"
                      ? "gold"
                      : product.quality === "Economy"
                      ? "green"
                      : "blue"
                  }
                >
                  {product.quality}
                </Tag>
              </Descriptions.Item>

              {/* {product.createdAt && (
                <Descriptions.Item label="Created Date" >
                  {formatDate(product.createdAt)}
                </Descriptions.Item>
              )} */}

              {product.updatedAt && (
                <Descriptions.Item label="Last Updated" >
                  {formatDate(product.updatedAt)}
                </Descriptions.Item>
              )}
            </Descriptions>

            {activeVariant && (
              <Card
                title={<Title level={5}>Selected Variant</Title>}
                style={{ marginBottom: "6px" }}
                className="bg-gray-50"
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="flex justify-between">
                    <Text strong>Size:</Text>
                    <Text>{activeVariant.size}</Text>
                  </div>

                  <div className="flex justify-between items-center">
                    <Text strong>Color:</Text>
                    <div>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: activeVariant.color,
                          borderRadius: "50%",
                          border: "1px solid #ddd",
                          display: "inline-block",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      />
                      <Text>{activeVariant.color}</Text>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Text strong>Price:</Text>
                    <Text
                      style={{
                        color: "#f50",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      $ {activeVariant.price?.toLocaleString()}
                    </Text>
                  </div>

                  <div className="flex justify-between">
                    <Text strong>Quantity:</Text>
                    <Text>
                      {activeVariant.quantity} in stock
                      {activeVariant.quantity <= 5 && (
                        <Tag color="red" style={{ marginLeft: "8px" }}>
                          Low Stock
                        </Tag>
                      )}
                    </Text>
                  </div>
                </Space>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs for variants, description, and FAQs */}
        <Tabs defaultActiveKey="variants" style={{ marginTop: "20px" }}>
          <TabPane tab="All Variants" key="variants">
            <Table
              rowKey="id"
              dataSource={product.variants}
              columns={variantColumns}
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => handleVariantClick(record),
                style: { cursor: "pointer" },
              })}
              rowClassName={(record) =>
                activeVariant && record.id === activeVariant.id
                  ? "bg-blue-50"
                  : ""
              }
            />
          </TabPane>

          <TabPane tab="Description" key="description">
            {product.description ? (
              <div
                className="product-description p-4 bg-white border rounded"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <Empty description="No description available" />
            )}
          </TabPane>

          <TabPane tab="FAQs" key="faqs">
            {product.faq && product.faq.length > 0 ? (
              <Collapse accordion className="mb-4">
                {product.faq.map((item) => (
                  <Panel header={item.question} key={item.id}>
                    <p>{item.answer}</p>
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <Empty description="No FAQs available" />
            )}
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
