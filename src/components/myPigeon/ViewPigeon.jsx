import React from "react";
import { Modal, Descriptions, Spin, Table } from "antd";
import { getImageUrl } from "../common/imageUrl";
import VerifyIcon from "../../assets/verify.png";

const safeValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    if (value?.name) return value.name;
    return JSON.stringify(value);
  }
  return String(value);
};

const ViewPigeon = ({ visible, onCancel, pigeonData, loading }) => {
  return (
    <Modal
      open={visible}
      title={`Pigeon Details`}
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : pigeonData ? (
        <>
          {/* Main Image */}
          <div className="flex justify-center mb-4">
            <img
              src={
                pigeonData?.photos?.[0]
                  ? getImageUrl(pigeonData.photos[0])
                  : "/placeholder.png"
              }
              alt={pigeonData?.name || "pigeon"}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
          <div className="flex gap-10 flex-col md:flex-row">
            <div className="flex-1">
              {/* Pigeon Info */}
              <h3 className="mt-6 mb-2 font-semibold">Pigeon Information</h3>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Name">
                  {safeValue(pigeonData.name)}
                </Descriptions.Item>
                <Descriptions.Item label="Ring Number">
                  {safeValue(pigeonData.ringNumber)}
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  {safeValue(pigeonData.country)}
                </Descriptions.Item>
                <Descriptions.Item label="Birth Year">
                  {safeValue(pigeonData.birthYear)}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {safeValue(pigeonData.gender)}
                </Descriptions.Item>
                <Descriptions.Item label="Color & Pattern">
                  {safeValue(pigeonData.color)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {safeValue(pigeonData.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {safeValue(pigeonData.location)}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {safeValue(pigeonData.notes)}
                </Descriptions.Item>
                <Descriptions.Item label="Verified">
                  {pigeonData.verified ? (
                    <img
                      src={VerifyIcon}
                      alt="verified"
                      style={{ width: 24, height: 24 }}
                    />
                  ) : (
                    "No"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="flex-1">
              {/* User Info */}
              {pigeonData.user && (
                <>
                  <h3 className="mt-6 mb-2 font-semibold">Owner Information</h3>
                  <Descriptions bordered column={1} size="small">
                    {/* <Descriptions.Item label="Name">
                      {safeValue(pigeonData.user.name)}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Username">
                      {safeValue(pigeonData.user.userName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {safeValue(pigeonData.user.email)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact">
                      {safeValue(pigeonData.user.contact)}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Role">
                      {safeValue(pigeonData.user.role)}
                    </Descriptions.Item> */}
                  </Descriptions>
                </>
              )}

              {/* Breeder Info */}
              {pigeonData.breeder && (
                <>
                  <h3 className="mt-6 mb-2 font-semibold">
                    Breeder Information
                  </h3>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Loft Name">
                      {safeValue(pigeonData.breeder.loftName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Breeder Name">
                      {safeValue(pigeonData.breeder.breederName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Country">
                      {safeValue(pigeonData.breeder.country)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {safeValue(pigeonData.breeder.email)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {safeValue(pigeonData.breeder.phone)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Experience">
                      {safeValue(pigeonData.breeder.experience)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Score">
                      {safeValue(pigeonData.breeder.score)}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </div>
          </div>
          {/* Race Results */}
          {pigeonData.results?.length > 0 && (
            <>
              <h3 className="mt-6 mb-2 font-semibold">Race Results</h3>
              <Table
                dataSource={pigeonData.results}
                rowKey="_id"
                pagination={false}
                size="small"
                bordered
                columns={[
                  {
                    title: "SL",
                    key: "index",
                    render: (_, __, index) => index + 1,
                    width: 60,
                  },
                  { title: "Name", dataIndex: "name", key: "name" },
                  {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    render: (d) => new Date(d).toLocaleDateString(),
                  },
                  { title: "Distance", dataIndex: "distance", key: "distance" },
                  { title: "Total", dataIndex: "total", key: "total" },
                  { title: "Place", dataIndex: "place", key: "place" },
                ]}
              />
            </>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400">No data found 🕊️</div>
      )}
    </Modal>
  );
};

export default ViewPigeon;
