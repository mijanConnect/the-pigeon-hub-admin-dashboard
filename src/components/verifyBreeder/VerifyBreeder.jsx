import { Button, Col, Input, Row, Select, Table, Tooltip } from "antd";
import { getCode, getNames } from "country-list";
import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useAddBreederMutation,
  useDeleteBreederMutation,
  useGetBreedersQuery,
  useUpdateBreederMutation,
} from "../../redux/apiSlices/breederSlice";
import AddVerifyBreeder from "./AddVerifiedBreeder";

const { Option } = Select;

const VerifyBreeder = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    country: "all",
    gender: "all",
    color: "all",
    status: "all",
  });
  const countries = getNames();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // RTK Query
  const { data: apiData, isLoading } = useGetBreedersQuery({
    page,
    limit,
    // search: searchText || undefined,
    searchTerm: searchText || undefined,
    country: filterCountry !== "all" ? filterCountry : undefined,
    gender: filterGender !== "all" ? filterGender : undefined,
    status:
      filterStatus === "Verified"
        ? true
        : filterStatus === "NotVerified"
        ? false
        : undefined,
    experience: filterExperience !== "all" ? filterExperience : undefined,
  });

  const [addBreeder] = useAddBreederMutation();
  const [updateBreeder] = useUpdateBreederMutation();
  const [deleteBreeder] = useDeleteBreederMutation();

  // Load breeders when API updates
  useEffect(() => {
    if (apiData?.breeders) {
      setData(apiData.breeders);
    }
  }, [apiData]);

  const openAddModal = () => {
    setEditingData(null);
    setIsModalVisible(true);
  };

  const openEditModal = (record) => {
    const formattedRecord = {
      ...record,
      status: !!record.status, // ensure true/false for checkbox
    };
    setEditingData(formattedRecord);
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      const payload = {
        loftName: values.loftName,
        breederName: values.breederName,
        country: values.country,
        email: values.email,
        phone: values.phoneNumber,
        status: !!values.status, // ✅ always boolean
        // score: Number(values.pigeonScore),
        experience: values.experienceLevel,
        gender: values.gender,
      };

      if (editingData) {
        await updateBreeder({
          id: editingData._id,
          data: payload,
          token: "your-auth-token",
        }).unwrap();
        Swal.fire("Updated!", "Breeder updated successfully!", "success");
      } else {
        const res = await addBreeder({
          data: payload,
          token: "your-auth-token",
        }).unwrap();
        if (res.success) {
          Swal.fire("Added!", "Breeder added successfully!", "success");
        } else {
          Swal.fire("Error", "Something went wrong!", "error");
        }
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const handleDelete = (record) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBreeder(record._id).unwrap();
          Swal.fire("Deleted!", "Breeder has been deleted.", "success");
        } catch (error) {
          console.error(error);
          Swal.fire("Error", "Failed to delete breeder!", "error");
        }
      }
    });
  };

  const getColumns = () => [
    { title: "Breeder Name", dataIndex: "breederName", key: "breederName" },
    { title: "Loft Name", dataIndex: "loftName", key: "loftName" },
    // { title: "Pigeon Score", dataIndex: "pigeonScore", key: "pigeonScore" },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (country) => {
        const countryCode = country ? getCode(country.name || country) : null;
        return countryCode ? (
          <div className="flex items-center gap-2">
            <img
              src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
              alt={country.name || country}
              className="w-5 h-4 rounded-sm"
            />
            <p className="text-white">{countryCode}</p>
          </div>
        ) : (
          <span>N/A</span>
        );
      },
    },
    {
      title: "E-mail",
      dataIndex: "email",
      key: "email",
      render: (text) => {
        return text ? <p href={`mailto:${text}`}>{text}</p> : "N/A";
      },
    },

    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => {
        return text ? <p href={`mailto:${text}`}>{text}</p> : "N/A";
      },
    },
    // { title: "Gender", dataIndex: "gender", key: "gender" },
    // {
    //   title: "Experience Level",
    //   dataIndex: "experienceLevel",
    //   key: "experienceLevel",
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (value ? "Verified" : "Not Verified"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div className="flex gap-5 border px-4 py-2 rounded">
            <Tooltip title="View & Update Details">
              <FaEdit
                style={{ color: "#ffff", fontSize: "16px", cursor: "pointer" }}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <FaTrash
                style={{
                  color: "#ff4d4f",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        </div>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const experienceMatch =
        filterExperience === "all" ||
        item.experienceLevel.toLowerCase() === filterExperience.toLowerCase();
      return experienceMatch;
    });
  }, [data, filterExperience]);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 mt-4">
        <Button
          type="primary"
          className="py-5 px-7 font-semibold text-[16px]"
          onClick={openAddModal}
        >
          Add Verified Breeder
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#333D49] rounded-lg shadow-lg border border-gray-200 mb-2">
        <Row gutter={[16, 16]} className="flex flex-wrap px-4 mb-4 mt-4">
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Search</label>
              <Input
                placeholder="Search..."
                className="custom-input-ant"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Country</label>
              <Select
                placeholder="Select Country"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filterCountry}
                onChange={(value) => {
                  // keep individual filter state and the combined filters in sync
                  setFilterCountry(value);
                  setFilters((prev) => ({ ...prev, country: value }));
                  setPage(1);
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {/* ✅ "All" option at the top */}
                <Option value="all">All</Option>

                {countries.map((country, index) => (
                  <Option key={index} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          {/* <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Gender</label>
              <Select
                placeholder="Select Gender"
                className="custom-select-ant"
                value={filterGender}
                onChange={(value) => {
                  setFilterGender(value);
                  setPage(1);
                }}
              >
                <Option value="all">All</Option>
                <Option value="Hen">Hen</Option>
                <Option value="Cock">Cock</Option>
              </Select>
            </div>
          </Col> */}

          {/* <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Experience Level</label>
              <Select
                placeholder="Select Level"
                className="custom-select-ant"
                value={filterExperience}
                onChange={(value) => {
                  setFilterExperience(value);
                  setPage(1);
                }}
              >
                <Option value="all">All</Option>
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Expert">Expert</Option>
              </Select>
            </div>
          </Col> */}

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Status</label>
              <Select
                placeholder="Select Status"
                className="custom-select-ant"
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  setPage(1);
                }}
              >
                <Option value="all">All</Option>
                <Option value="Verified">Verified</Option>
                <Option value="NotVerified">Not Verified</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div
          style={{ minWidth: "max-content" }}
          className="bg-[#333D49] rounded-lg"
        >
          <Table
            columns={getColumns()}
            dataSource={filteredData}
            loading={isLoading}
            rowClassName={() => "hover-row"}
            components={{
              header: {
                cell: (props) => (
                  <th
                    {...props}
                    style={{
                      height: 70,
                      lineHeight: "70px",
                      background: "#333D49",
                      color: "#ffffff",
                      fontWeight: 600,
                      padding: "0 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {props.children}
                  </th>
                ),
              },
              body: {
                cell: (props) => (
                  <td
                    {...props}
                    style={{
                      background: "#212B35",
                      padding: "12px 16px",
                      color: "#ffffff",
                      borderBottom: "none",
                    }}
                  >
                    {props.children}
                  </td>
                ),
              },
            }}
            locale={{
              emptyText: (
                <div className="py-10 text-gray-400 text-center">
                  No pigeons found 🕊️
                </div>
              ),
            }}
            bordered={false}
            pagination={{
              current: page,
              pageSize: limit,
              total: apiData?.pagination?.total || 0,
              onChange: (p, l) => {
                setPage(p);
                setLimit(l);
              },
            }}
            size="small"
            rowKey="_id"
          />
        </div>
      </div>

      <AddVerifyBreeder
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        initialValues={editingData}
      />
    </div>
  );
};

export default VerifyBreeder;
