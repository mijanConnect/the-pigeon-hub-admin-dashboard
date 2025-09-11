import React, { useState } from "react";
import { Table } from "antd";
import VerifyIcon from "../../../src/assets/verify.png";
import { getImageUrl } from "../common/imageUrl";
import PigeonImage from "../../../src/assets/pigeon-image.png";
import { useGetRecentPigeonsQuery } from "../../redux/apiSlices/dashboardSlice";

// const getImageUrlTable = (path) =>
//   path ? `${getImageUrl}${path}` : PigeonImage;

const getColumns = () => [
  {
    title: "Image",
    dataIndex: "image",
    key: "image",
    width: 100,
    render: (src) => (
      <img
        // src={src || "/assets/pigeon-image.png"}
        // src={getImageUrl(item.image)}
        src={getImageUrl(src)}
        alt="pigeon"
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    ),
  },
  { title: "Name", dataIndex: "name", key: "name" },
  {
    title: "Country",
    dataIndex: "country",
    key: "country",
    render: (country) => <span>{country?.name || "-"}</span>,
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
        "-"
      ),
  },
];

const PigeonTable = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetRecentPigeonsQuery({
    page,
    limit: 10,
  });
  // console.log(data);

  const pigeons = data?.pigeons || [];
  // console.log(pigeons);
  const pagination = data?.pagination || {};

  const columns = getColumns();

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected row keys:", selectedRowKeys, selectedRows);
    },
  };

  if (isLoading) return <p>Loading pigeons...</p>;
  if (isError) return <p>Failed to load pigeons.</p>;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between mb-2 items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-lg sm:text-xl md:text-xl font-bold text-secondary mb-2">
          Recently Added Pigeons
        </h1>
      </div>
      <div className="overflow-x-auto border rounded-lg shadow-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="border rounded-lg shadow-md bg-gray-50">
          <div
            style={{ minWidth: "max-content" }}
            className="bg-[#333D49] rounded-lg"
          >
            <Table
              // rowSelection={rowSelection}
              columns={columns}
              dataSource={pigeons}
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
              bordered={false}
              // pagination={{
              //   current: pagination.page,
              //   pageSize: pagination.limit,
              //   total: pagination.total,
              //   onChange: (page) => setPage(page),
              // }}
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
              rowKey="key"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PigeonTable;
