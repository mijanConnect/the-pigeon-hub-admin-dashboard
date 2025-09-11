import React, { useState, useEffect } from "react";
import { Table, Input, Select, Button, Space, Tooltip, Badge, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import debounce from "lodash/debounce";

const { Option } = Select;

const ProductsTable = ({
  products,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  onEditInfo,
  onAddInfo,
}) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    subCategory: "",
    sortBy: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categorySubMap, setCategorySubMap] = useState({});

  useEffect(() => {
    if (products.length) {
      // Create category list
      const uniqueCategories = [...new Set(products.map((p) => p.category))];
      setCategories(uniqueCategories);

      // Create mapping of category -> subcategories
      const map = {};
      products.forEach((p) => {
        if (!map[p.category]) {
          map[p.category] = new Set();
        }
        map[p.category].add(p.subCategory);
      });

      // Convert sets to arrays
      const formattedMap = {};
      for (let cat in map) {
        formattedMap[cat] = [...map[cat]];
      }
      setCategorySubMap(formattedMap);
    }

    applyFilters();
  }, [products]);

  useEffect(() => {
    // Update subCategory options whenever category changes
    if (filters.category && categorySubMap[filters.category]) {
      setSubCategories(categorySubMap[filters.category]);
    } else {
      setSubCategories([]);
    }

    applyFilters();
  }, [filters, searchText, products]);

  const generateSearchSuggestions = (value) => {
    if (!value) {
      setSearchSuggestions([]);
      return;
    }

    const inputLower = value.toLowerCase();
    const suggestions = products
      .filter((p) => p.name.toLowerCase().includes(inputLower))
      .map((p) => p.name)
      .slice(0, 5);

    setSearchSuggestions(suggestions);
  };

  const debouncedSuggestion = debounce((value) => {
    generateSearchSuggestions(value);
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSuggestion(value);
  };

  const calculateTotalQuantity = (variants) => {
    return variants.reduce((total, variant) => total + variant.quantity, 0);
  };

  const calculatePriceRange = (variants) => {
    if (!variants || variants.length === 0) return "N/A";

    const prices = variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${minPrice}`;
    }

    return `${minPrice} - ${maxPrice}`;
  };

  const applyFilters = () => {
    let result = [...products];

    if (searchText) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.subCategory) {
      result = result.filter((p) => p.subCategory === filters.subCategory);
    }

    // Apply combined sorting based on the selected option
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_lowToHigh":
          result.sort((a, b) => {
            const minPriceA = Math.min(...a.variants.map((v) => v.price));
            const minPriceB = Math.min(...b.variants.map((v) => v.price));
            return minPriceA - minPriceB;
          });
          break;
        case "price_highToLow":
          result.sort((a, b) => {
            const maxPriceA = Math.max(...a.variants.map((v) => v.price));
            const maxPriceB = Math.max(...b.variants.map((v) => v.price));
            return maxPriceB - maxPriceA;
          });
          break;
        case "date_newest":
          result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          break;
        case "date_oldest":
          result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateA - dateB;
          });
          break;
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }

    setFilteredProducts(result);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      subCategory: "",
      sortBy: "",
    });
    setSearchText("");
  };

  const hasProductInfo = (product) => {
    return (
      (product.description && product.description.length > 0) ||
      (product.faq && product.faq.length > 0)
    );
  };

  const columns = [
    {
      title: "Serial No.",
      key: "serial",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 80,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
    },
    {
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
      align: "center",
    },
    {
      title: "Quality",
      dataIndex: "quality",
      key: "quality",
      align: "center",
    },
    {
      title: "Variants",
      key: "variants",
      align: "center",
      render: (_, record) => (
        <span>{record.variants ? record.variants.length : 0}</span>
      ),
    },
    {
      title: "Price Range",
      key: "priceRange",
      align: "center",
      render: (_, record) => calculatePriceRange(record.variants),
    },
    {
      title: "Total Quantity",
      key: "totalQuantity",
      align: "center",
      render: (_, record) => {
        const totalQty = calculateTotalQuantity(record.variants);
        return (
          <span>
            {totalQty}
            {totalQty <= 10 && (
              <span style={{ color: "red", marginLeft: 4 }}>Low Stock</span>
            )}
          </span>
        );
      },
    },
    {
      title: "Product info",
      key: "actions",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Space size="small">
          {hasProductInfo(record) ? (
            <Tooltip title="Edit Info">
              <Button
                icon={<FileTextOutlined />}
                onClick={() => onEditInfo(record)}
                type="default"
                className="bg-primary text-white"
              >
                Edit Info
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Add Info">
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => onAddInfo(record)}
                type="default"
                className="bg-secondary text-white"
              >
                Add Info
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, record) => (
        <Space size="large">
          {" "}
          {/* You can change 'middle' to 'large' or 'small' depending on the desired gap */}
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(record)}
              type="default"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id)}
              type="danger"
              className="bg-red-500 text-white"
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Function to apply the red row style if any variant has low quantity
  const rowClassName = (record) => {
    const hasLowStock = record.variants.some((v) => v.quantity <= 5);
    return hasLowStock ? "red-row" : "";
  };

  return (
    <div className="product-table">
      <div className="filters-section">
        <div className="filter-controls mb-6">
          <Space wrap>
            <Input
              placeholder="Search products by name"
              value={searchText}
              onChange={handleInputChange}
              style={{ width: 300, height: 40 }}
            />

            <Select
              placeholder="Category"
              style={{ width: 200, height: 40 }}
              value={filters.category || undefined}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  category: value,
                  subCategory: "",
                })
              }
              allowClear
            >
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Sub Category"
              style={{ width: 200, height: 40 }}
              value={filters.subCategory || undefined}
              onChange={(value) =>
                setFilters({ ...filters, subCategory: value })
              }
              disabled={!filters.category} // disable if category is not selected
              allowClear
            >
              {subCategories.map((subCategory) => (
                <Option key={subCategory} value={subCategory}>
                  {subCategory}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Sort By"
              style={{ width: 200, height: 40 }}
              value={filters.sortBy || undefined}
              onChange={(value) => setFilters({ ...filters, sortBy: value })}
              allowClear
            >
              <Option value="price_lowToHigh">Price: Low to High</Option>
              <Option value="price_highToLow">Price: High to Low</Option>
              <Option value="date_newest">Date: Newest First</Option>
              <Option value="date_oldest">Date: Oldest First</Option>
              <Option value="name_asc">Name: A to Z</Option>
              <Option value="name_desc">Name: Z to A</Option>
            </Select>

            <Button onClick={resetFilters} style={{ width: 200, height: 40 }}>
              Reset Filters
            </Button>
          </Space>
        </div>
      </div>

      <div className="px-6 pt-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default ProductsTable;
