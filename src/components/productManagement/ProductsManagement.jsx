import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ProductsTable from "./ProductsTable";
import ProductFormModal from "./ProductFormModal";
import ProductDetailModal from "./ProductDetails";
import ProductInfoModal from "./ProductInfoModal";
import GradientButton from "../common/GradiantButton";

const dummyProducts = [
  {
    id: 1,
    name: "Smartphone X Pro",
    category: "Electronics",
    subCategory: "Mobile Phones",
    quality: "Premium",
    description:
      "The Smartphone X Pro is a revolutionary mobile device designed to meet the needs of users who demand the very best in performance, design, and innovation...",
    faq: [
      {
        id: 1,
        question: "What is the battery capacity?",
        answer:
          "The Smartphone X Pro has a 5000mAh battery that lasts all day.",
      },
      {
        id: 2,
        question: "Does it support 5G?",
        answer: "Yes, the Smartphone X Pro has full 5G connectivity.",
      },
    ],
    variants: [
      {
        id: 101,
        size: "Standard",
        color: "#000000",
        price: 45000,
        quantity: 25,
        images: [
          "https://picsum.photos/id/1/800/800",
          "https://picsum.photos/id/20/800/800",
        ],
      },
      {
        id: 102,
        size: "Standard",
        color: "#FFFFFF",
        price: 45000,
        quantity: 15,
        images: ["https://picsum.photos/id/1/800/800"],
      },
    ],
    createdAt: "2023-06-15T08:30:00Z",
    updatedAt: "2023-12-10T14:45:00Z",
  },
  {
    id: 2,
    name: "Leather Jacket",
    category: "Clothing",
    subCategory: "Outerwear",
    quality: "Premium",
    description: "Genuine leather jacket for men",
    faq: [],
    variants: [
      {
        id: 201,
        size: "S",
        color: "#000000",
        price: 7500,
        quantity: 5,
        images: ["https://picsum.photos/id/7/800/800"],
      },
      {
        id: 202,
        size: "M",
        color: "#000000",
        price: 7500,
        quantity: 7,
        images: ["https://picsum.photos/id/7/800/800"],
      },
      {
        id: 203,
        size: "L",
        color: "#000000",
        price: 7800,
        quantity: 3,
        images: ["https://picsum.photos/id/7/800/800"],
      },
    ],
    createdAt: "2023-07-20T10:15:00Z",
    updatedAt: "2023-07-20T10:15:00Z",
  },
  {
    id: 3,
    name: "Coffee Table",
    category: "Furniture",
    subCategory: "Living Room",
    quality: "Standard",
    description: null,
    faq: null,
    variants: [
      {
        id: 301,
        size: "Standard",
        color: "#6A3805",
        price: 3200,
        quantity: 8,
        images: ["https://picsum.photos/id/30/800/800"],
      },
    ],
    createdAt: "2023-08-05T15:20:00Z",
    updatedAt: "2023-11-12T09:30:00Z",
  },
  {
    id: 4,
    name: "Cotton T-shirt",
    category: "Clothing",
    subCategory: "Casual Wear",
    quality: "Standard",
    description: "Comfortable cotton t-shirt for daily wear",
    faq: [
      {
        id: 1,
        question: "Is this 100% cotton?",
        answer:
          "Yes, our t-shirts are made from 100% pure cotton for maximum comfort.",
      },
    ],
    variants: [
      {
        id: 401,
        size: "S",
        color: "#a72929",
        price: 650,
        quantity: 30,
        images: ["https://picsum.photos/id/11/800/800"],
      },
      {
        id: 402,
        size: "M",
        color: "#6e1414",
        price: 650,
        quantity: 40,
        images: ["https://picsum.photos/id/11/800/800"],
      },
      {
        id: 403,
        size: "L",
        color: "#FFFFFF",
        price: 700,
        quantity: 20,
        images: ["https://picsum.photos/id/11/800/800"],
      },
      {
        id: 404,
        size: "S",
        color: "#644444",
        price: 650,
        quantity: 25,
        images: ["https://picsum.photos/id/12/800/800"],
      },
      {
        id: 405,
        size: "M",
        color: "#000000",
        price: 650,
        quantity: 35,
        images: ["https://picsum.photos/id/12/800/800"],
      },
      {
        id: 406,
        size: "L",
        color: "#000000",
        price: 700,
        quantity: 15,
        images: ["https://picsum.photos/id/12/800/800"],
      },
    ],
    createdAt: "2023-11-05T09:25:00Z",
    updatedAt: "2023-11-05T09:25:00Z",
  },
];

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [infoTabKey, setInfoTabKey] = useState("description");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Dummy data load
      setProducts(dummyProducts);
    } catch (error) {
      message.error("Failed to fetch products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setModalVisible(true);
  };

  const handleEditProductInfo = (product, initialTab = "description") => {
    setCurrentProduct(product);
    setInfoTabKey(initialTab);
    setInfoModalVisible(true);
  };

  const handleAddProductInfo = (product) => {
    setCurrentProduct(product);
    setInfoTabKey("description");
    setInfoModalVisible(true);
  };

  const handleDelete = async (productId) => {
    try {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      message.success("Product deleted successfully");
    } catch (error) {
      message.error("Failed to delete product");
      console.error(error);
    }
  };

  const handleViewDetails = (product) => {
    setCurrentProduct(product);
    setDetailModalVisible(true);
  };

  const handleModalSave = async (formData) => {
    try {
      if (currentProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === currentProduct.id ? { ...formData, id: p.id } : p
          )
        );
        message.success("Product updated successfully");
      } else {
        const newProduct = {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts((prev) => [...prev, newProduct]);
        message.success("Product added successfully");
      }
      setModalVisible(false);
    } catch (error) {
      message.error("Failed to save product");
      console.error(error);
    }
  };

  const handleInfoModalSave = async (infoData) => {
    try {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id
            ? { ...p, ...infoData, updatedAt: new Date().toISOString() }
            : p
        )
      );
      message.success("Product information updated successfully");
      setInfoModalVisible(false);
    } catch (error) {
      message.error("Failed to save product information");
      console.error(error);
    }
  };

  return (
    <div className="product-management">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 className="text-2xl font-bold">Products Management</h1>
        <GradientButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
        >
          <PlusOutlined />
          Add New Product
        </GradientButton>
      </div>

      <ProductsTable
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onEditInfo={handleEditProductInfo}
        onAddInfo={handleAddProductInfo}
      />

      <ProductFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSave={handleModalSave}
        product={currentProduct}
      />

      <ProductDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        product={currentProduct}
      />

      <ProductInfoModal
        visible={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        onSave={handleInfoModalSave}
        product={currentProduct}
        defaultActiveKey={infoTabKey}
      />
    </div>
  );
};

export default ProductManagement;
