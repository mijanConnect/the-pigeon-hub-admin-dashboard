import { Table, Spin } from "antd";
import { getCode } from "country-list";
import { useEffect, useRef, useState } from "react";
import VerifyIcon from "../../../src/assets/verify.png";
import { useGetRecentPigeonsQuery } from "../../redux/apiSlices/dashboardSlice";
import { attachDragToElement } from "../common/dragScroll";
import { getImageUrl } from "../common/imageUrl";
import SyncHorizontalScroll from "../common/SyncHorizontalScroll";

// const getImageUrlTable = (path) =>
//   path ? `${getImageUrl}${path}` : PigeonImage;

const getColumns = () => [
  {
    title: "Image",
    dataIndex: "image",
    key: "image",
    width: 100,
    render: (src, record) => {
      const imageExists = src && src.trim() !== ""; // Check if the image source is valid

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
            backgroundColor: "#f0f0f0", // Background color for placeholder
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px", // Adjust font size
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
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Verified", dataIndex: "verified", key: "verified" },
  {
    title: "Icon",
    dataIndex: "icon",
    key: "icon",
    width: 80,
    render: (src) =>
      src ? (
        <img
          src={VerifyIcon}
          alt="verify"
          style={{ width: 24, height: 24, objectFit: "cover" }}
        />
      ) : (
        "N/A"
      ),
  },
];

const PigeonTable = () => {
  const [page, setPage] = useState(1);
  const tableContainerRef = useRef(null);

  const { data, isLoading, isError } = useGetRecentPigeonsQuery({
    page,
    limit: 10000,
  });
  // console.log(data);

  const pigeons = data?.pigeons || [];
  // console.log(pigeons);
  const pagination = data?.pagination || {};

  const columns = getColumns();

  // attach drag-to-scroll behavior to the table container
  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const cleanup = attachDragToElement(el);
    return cleanup;
  }, [pigeons.length, page]);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected row keys:", selectedRowKeys, selectedRows);
    },
  };

  // if (isLoading) return <Spinner />;
  if (isError)
    return (
      <div className="text-center text-gray-500">
        <p>Oops! Something went wrong. Please try again later.</p>
      </div>
      // <p>Failed to load pigeons.</p>
    );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between mb-2 items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-lg sm:text-xl md:text-xl font-bold text-secondary mb-2">
          Recently Added Pigeons
        </h1>
      </div>

      {/* Table */}
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
                // pagination={{
                //   current: page,
                //   pageSize,
                //   total,
                //   showSizeChanger: false,
                //   onChange: (newPage) => setPage(newPage),
                // }}
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
    </div>
  );
};

export default PigeonTable;
