import {
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
  Tooltip,
  message,
} from "antd";
import { getCode, getNames } from "country-list";
import { useRef, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { PiDnaBold } from "react-icons/pi";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import AllIcon from "../../assets/all.png";
import {
  useDeletePigeonMutation,
  useGetMyPigeonsQuery,
} from "../../redux/apiSlices/mypigeonSlice";
import SyncHorizontalScroll from "../common/SyncHorizontalScroll";
import { getImageUrl } from "../common/imageUrl";
import "./myPigeon.responsive.css";

import BreedingIcon from "../../assets/Breeding.png";
import DeceasedIcon from "../../assets/Deceased.png";
import LostIcon from "../../assets/Lost.png";
import RacingIcon from "../../assets/Racing.png";
import RetiredIcon from "../../assets/Retired.png";
import SoldIcon from "../../assets/Sold.png";

const { Option } = Select;
const { TabPane } = Tabs;

const MyPigeon = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const { id } = useParams();

  const [tabKey, setTabKey] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    country: "all",
    gender: "all",
    color: "all",
    status: "all",
  });

  const handleView = (record) => {
    // navigate to the standalone view page
    navigate(`/view-pigeon/${record._id}`);
  };

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10000);
  const countries = getNames();

  const showEditModal = (record) => {
    navigate(`/add-pigeon/${record._id}`);
  };

  const showPdfExportModal = (record) => {
    console.log("[MyPigeon] navigating to export route for", record?._id);
    navigate(`/export-pdf/${record._id}`, { state: { from: "/my-pigeon" } });
  };

  const handleAddPigeon = () => {
    navigate("/add-pigeon");
  };

  const { data, isLoading } = useGetMyPigeonsQuery({
    page,
    limit: pageSize,
    searchTerm: filters.search || undefined,
    country: filters.country !== "all" ? filters.country : undefined,
    gender: filters.gender !== "all" ? filters.gender : undefined,
    color: filters.color !== "all" ? filters.color : undefined,
    verified:
      filters.status === "verified"
        ? true
        : filters.status === "notverified"
        ? false
        : undefined,
    status: tabKey !== "all" ? tabKey : undefined,
  });

  const pigeons = data?.pigeons || [];
  const total = data?.pagination?.total || 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const [deletePigeon] = useDeletePigeonMutation();

  const handleDelete = (record) => {
    Swal.fire({
      title: "Delete Pigeon?",
      text: `Are you sure you want to delete ${record.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#088395",
      cancelButtonColor: "#C33739",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePigeon(record._id).unwrap();
          message.success("Pigeon deleted successfully!");
        } catch (err) {
          message.error(err?.data?.message || "Failed to delete");
        }
      }
    });
  };

  const showPedigreeChart = (record) => {
    navigate(`/pigeon-management/${record._id}`);
  };

  // Helper to download a URL or create a JSON download
  const downloadUrl = async (url, filename) => {
    if (!url) {
      message.error("File not available for download");
      return;
    }

    // If url is an object URL or data URL, just use anchor
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // Try fetching the resource as a blob (better for cross-origin images when CORS allows)
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("Fetch failed");
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      return;
    } catch (err) {
      // Fallback to direct link (may open in new tab or be blocked by CORS)
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
  };

  // Helper to detect whether a stored value or resolved URL points to a PDF
  const isPdfFile = (storedValue, resolvedUrl) => {
    try {
      const v = storedValue ? String(storedValue).toLowerCase() : "";
      const u = resolvedUrl ? String(resolvedUrl).toLowerCase() : "";
      if (v.includes(".pdf")) return true;
      if (u.includes(".pdf")) return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleDownload = async (record, key) => {
    // pick the appropriate field or generate content
    switch (key) {
      case "pedigree":
        if (!record.pedigreePhoto) {
          return message.error("Pedigree photo not available for this pigeon");
        }
        {
          const url = getImageUrl(record.pedigreePhoto);
          const ext = isPdfFile(record.pedigreePhoto, url) ? "pdf" : "jpg";
          return await downloadUrl(
            url,
            `${record.ringNumber || record._id}-pedigree.${ext}`
          );
        }
      case "ownership":
        if (!record.ownershipPhoto) {
          return message.error("Ownership card not available for this pigeon");
        }
        {
          const url = getImageUrl(record.ownershipPhoto);
          const ext = isPdfFile(record.ownershipPhoto, url) ? "pdf" : "jpg";
          return await downloadUrl(
            url,
            `${record.ringNumber || record._id}-ownership.${ext}`
          );
        }
      case "dna":
        if (!record.DNAPhoto) {
          return message.error("DNA certificate not available for this pigeon");
        }
        {
          const url = getImageUrl(record.DNAPhoto);
          const ext = isPdfFile(record.DNAPhoto, url) ? "pdf" : "jpg";
          return await downloadUrl(
            url,
            `${record.ringNumber || record._id}-dna.${ext}`
          );
        }
      case "photo":
        if (!record.pigeonPhoto) {
          return message.error("Pigeon photo not available");
        }
        {
          const url = getImageUrl(record.pigeonPhoto);
          const ext = isPdfFile(record.pigeonPhoto, url) ? "pdf" : "jpg";
          return await downloadUrl(
            url,
            `${record.ringNumber || record._id}-photo.${ext}`
          );
        }
      case "details": {
        console.log("[MyPigeon] download details requested for", record?._id);
        showPdfExportModal(record);
        return;
      }
      default:
        return message.error("Unknown download option");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (src, record) => {
        const imageExists = src && src.trim() !== "";

        return imageExists ? (
          <img
            src={getImageUrl(src)}
            alt="pigeon"
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            {record?.name?.[0]?.toUpperCase()} {/* Show first letter of name */}
          </div>
        );
      },
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (country) => {
        // Check if country and country.name are valid strings
        const countryCode =
          typeof country === "object" && country?.name
            ? getCode(country.name) // If country is an object, use country.name
            : typeof country === "string"
            ? getCode(country) // If country is a string, use it directly
            : null;

        return countryCode ? (
          <div className="flex items-center gap-2">
            <img
              src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
              alt={country?.name || country}
              className="w-5 h-4 rounded-sm"
            />
            <p className="text-white">{countryCode}</p>
          </div>
        ) : (
          <span>N/A</span>
        );
      },
    },

    { title: "Breeder", dataIndex: "breeder", key: "breeder" },
    { title: "Ring Number", dataIndex: "ringNumber", key: "ringNumber" },
    { title: "Birth Year", dataIndex: "birthYear", key: "birthYear" },
    { title: "Father", dataIndex: "father", key: "father" },
    { title: "Mother", dataIndex: "mother", key: "mother" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: "Color & Pattern",
      dataIndex: "color",
      key: "color",
      render: (color) => (color && color !== "-" ? color : "N/A"),
    },
    // { title: "Status", dataIndex: "status", key: "status" },
    // { title: "Verified", dataIndex: "verified", key: "verified" },
    // {
    //   title: "Icon",
    //   dataIndex: "icon",
    //   key: "icon",
    //   width: 80,
    //   render: (src) =>
    //     src && src !== "-" ? (
    //       <img
    //         src={VerifyIcon}
    //         alt="verify"
    //         style={{ width: 24, height: 24, objectFit: "cover" }}
    //       />
    //     ) : (
    //       <span>-</span>
    //     ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div className="flex gap-5 border px-4 py-2 rounded">
            <Tooltip title="View Details">
              <FaEye
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => handleView(record)}
              />
            </Tooltip>
            <Tooltip title="View Pedigree">
              <PiDnaBold
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => showPedigreeChart(record)}
              />
            </Tooltip>
            <Tooltip title="Update Details">
              <FaEdit
                style={{ color: "#ffff", fontSize: 16, cursor: "pointer" }}
                onClick={() => showEditModal(record)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <FaTrash
                style={{ color: "#ff4d4f", fontSize: 16, cursor: "pointer" }}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
            {/* Download menu */}
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => {
                    // menu keys: pedigree, ownership, details, dna, photo
                    handleDownload(record, key);
                  }}
                >
                  {record.pedigreePhoto ? (
                    <Menu.Item key="pedigree">Original pedigree</Menu.Item>
                  ) : null}
                  {record.ownershipPhoto ? (
                    <Menu.Item key="ownership">Ownership card</Menu.Item>
                  ) : null}
                  {/* Always show details export option */}
                  <Menu.Item key="details">Pigeon details</Menu.Item>
                  {record.DNAPhoto ? (
                    <Menu.Item key="dna">DNA certificate</Menu.Item>
                  ) : null}
                  {record.pigeonPhoto ? (
                    <Menu.Item key="photo">Pigeon photo</Menu.Item>
                  ) : null}
                </Menu>
              }
              trigger={["click"]}
            >
              <Tooltip title="Download Options">
                <IoMdDownload
                  style={{
                    color: "#ffff",
                    fontSize: 16,
                    cursor: "pointer",
                    marginLeft: "-5px",
                  }}
                />
              </Tooltip>
            </Dropdown>
          </div>
        </div>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected row keys:", selectedRowKeys, selectedRows);
    },
  };

  // We use the reusable SyncHorizontalScroll component below to provide
  // drag-to-scroll and a mirrored bottom scrollbar. This keeps this
  // component focused on table data & layout only.
  console.log(pigeons);
  const handleExportPDF = () => {
    if (!pigeons?.length) {
      alert("No data available to export");
      return;
    }

    // Check if jspdf is available
    if (typeof window !== "undefined") {
      // Dynamic import for jspdf
      import("jspdf").then((jsPDFModule) => {
        const jsPDF = jsPDFModule.default;
        import("jspdf-autotable").then((autoTableModule) => {
          const autoTable = autoTableModule.default;
          try {
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(16);
            doc.text("Pigeon Data Export", 14, 22);
            doc.setFontSize(8);
            doc.setTextColor(100);

            // Get table data
            const tableColumn = [
              "Name",
              "Country",
              "Breeder",
              "Ring Number",
              "Birth Year",
              "Color",
              "Status",
              "Gender",
            ];

            const tableRows = [];

            const formatCountryForExport = (country) => {
              if (!country) return "-";
              if (typeof country === "object") {
                // some APIs return { name: 'Country Name' } or similar
                return (
                  country.name || country.country || JSON.stringify(country)
                );
              }
              return String(country);
            };

            pigeons.forEach((pigeon) => {
              tableRows.push([
                pigeon.name || "-",
                formatCountryForExport(pigeon.country),
                pigeon.breeder || "-",
                pigeon.ringNumber || "-",
                pigeon.birthYear || "-",
                pigeon.color || "-",
                pigeon.status || "-",
                pigeon.gender || "-",
              ]);
            });

            autoTable(doc, {
              head: [tableColumn],
              body: tableRows,
              startY: 30,
              theme: "striped",
              headStyles: {
                fillColor: [58, 178, 127],
                textColor: [255, 255, 255],
                fontSize: 8,
              },
              alternateRowStyles: {
                fillColor: [240, 240, 240],
              },
              styles: {
                fontSize: 7,
              },
            });

            // Add date
            const date = new Date();
            doc.setFontSize(8);
            doc.text(
              `Generated on ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
              14,
              doc.lastAutoTable.finalY + 10
            );

            doc.save(`pigeon-data-${date.toISOString().split("T")[0]}.pdf`);
          } catch (error) {
            console.error("Error generating PDF:", error);
            alert(
              "Error generating PDF. Please make sure jspdf and jspdf-autotable are installed."
            );
          }
        });
      });
    }
  };

  const handleExportExcel = () => {
    if (!pigeons.length) {
      alert("No data available to export");
      return;
    }

    // Check if xlsx is available
    if (typeof window !== "undefined") {
      // Dynamic import for xlsx
      import("xlsx")
        .then((XLSX) => {
          try {
            // Prepare the data
            const formatCountryForExport = (country) => {
              if (!country) return "-";
              if (typeof country === "object") {
                return (
                  country.name || country.country || JSON.stringify(country)
                );
              }
              return String(country);
            };

            const worksheet = XLSX.utils.json_to_sheet(
              pigeons.map((pigeon) => ({
                Name: pigeon.name || "-",
                Country: formatCountryForExport(pigeon.country),
                Breeder: pigeon.breeder || "-",
                "Ring Number": pigeon.ringNumber || "-",
                "Birth Year": pigeon.birthYear || "-",
                // "Racer Rating": pigeon.racerRating || "-",
                // "Racing Rating": pigeon.racingRating || "-",
                // Pattern: pigeon.pattern || "-",
                Status: pigeon.status || "-",
                Gender: pigeon.gender || "-",
                Color: pigeon.color || "-",
                Location: pigeon.location || "-",
              }))
            );

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Pigeons");

            // Generate Excel file
            const date = new Date().toISOString().split("T")[0];
            XLSX.writeFile(workbook, `pigeon-data-${date}.xlsx`);
          } catch (error) {
            console.error("Error generating Excel:", error);
            alert(
              "Error generating Excel file. Please make sure xlsx is installed."
            );
          }
        })
        .catch((error) => {
          console.error("Error loading xlsx:", error);
          alert("Please install xlsx by running: npm install xlsx");
        });
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end gap-2 mb-4 mt-4">
        <Button
          className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 px-7 font-semibold text-[16px]"
          onClick={handleAddPigeon}
        >
          Add New Pigeon
        </Button>
        <Button
          className="bg-[#088395] hover:!bg-[#088395]/80 text-white border-[#088395] hover:!border-cyan-300 hover:!text-white py-5 px-7 font-semibold text-[16px]"
          onClick={handleExportPDF}
        >
          Export to PDF
        </Button>
        <Button
          className="bg-[#088395] hover:!bg-[#088395]/80 text-white border-[#088395] hover:!border-cyan-300 hover:!text-white py-5 px-7 font-semibold text-[16px]"
          onClick={handleExportExcel}
        >
          Export to Excel
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-[#333D49] rounded-lg shadow-lg border border-[#B7BBA0] mb-2">
        <div className="pt-3 mb-6 px-4 rounded-t-lg bg-[#44505E]">
          <Tabs
            defaultActiveKey="all"
            tabBarGutter={50}
            className="custom-tabs text-[#B7BBA0]"
            onChange={(key) => {
              setTabKey(key);
              setPage(1); // reset pagination whenever tab changes
            }}
          >
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={AllIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  All
                </span>
              }
              key="all"
            />
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={RacingIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  Racing
                </span>
              }
              key="Racing"
            />
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={BreedingIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  Breeding
                </span>
              }
              key="Breeding"
            />
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={LostIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  Lost
                </span>
              }
              key="Lost"
            />
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={SoldIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  Sold
                </span>
              }
              key="Sold"
            />
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={RetiredIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  Retired
                </span>
              }
              key="Retired"
            />
            <TabPane
              tab={
                <span className="flex items-center gap-2 text-[#B7BBA0]">
                  <img
                    src={DeceasedIcon}
                    alt="verify"
                    style={{ objectFit: "cover" }}
                  />{" "}
                  Deceased
                </span>
              }
              key="Deceased"
            />
          </Tabs>
        </div>

        <Row gutter={[16, 16]} className="filters-row flex flex-wrap px-4 mb-4">
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Search</label>
              <Input
                placeholder="Search"
                className="custom-input-ant custom-input-ant-table"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Country</label>
              <Select
                placeholder="Select Country"
                className="custom-select-ant custom-select-ant-table custom-select-ant-table-select"
                style={{ width: "100%" }}
                value={filters?.country || "all"}
                onChange={(value) => handleFilterChange("country", value)}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {/* ✅ "All" option at the top */}
                <Option value="all">All</Option>

                {countries?.map((country, index) => (
                  <Option key={index} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Gender</label>
              <Select
                placeholder="Select Gender"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filters.gender}
                onChange={(value) => handleFilterChange("gender", value)}
              >
                <Option value="all">All</Option>
                <Option value="Cock">Cock</Option>
                <Option value="Hen">Hen</Option>
                <Option value="Unspecified">Unspecified</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-300">Verification</label>
              <Select
                placeholder="Select Status"
                className="custom-select-ant"
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
              >
                <Option value="all">All</Option>
                <Option value="verified">Verified</Option>
                <Option value="notverified">Not Verified</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      {/* Table wrapped with reusable SyncHorizontalScroll which provides
          drag-to-scroll and a mirrored bottom scrollbar when needed */}
      <SyncHorizontalScroll
        containerClassName="overflow-x-auto border rounded-lg shadow-md bg-gray-50 custom-scrollbar hide-scrollbar cursor-grab"
        watch={pigeons.length}
      >
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div
            style={{ minWidth: pigeons.length > 0 ? "max-content" : "100%" }}
            className="bg-[#333D49] rounded-lg"
          >
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                // rowSelection={rowSelection}
                columns={columns}
                dataSource={pigeons}
                rowClassName={() => "hover-row"}
                bordered={false}
                size="small"
                rowKey="_id"
                scroll={pigeons.length > 0 ? { x: "max-content" } : undefined}
                pagination={{
                  current: page,
                  pageSize,
                  total,
                  showSizeChanger: false,
                  onChange: (newPage) => setPage(newPage),
                }}
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
              />
            )}
          </div>
        </div>
      </SyncHorizontalScroll>

      {/* View now navigates to /view-pigeon/:id route — page handles its own data fetching */}
    </div>
  );
};

export default MyPigeon;
