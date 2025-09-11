import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Tooltip, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import MarchantIcon from "../../assets/exclemetion.png";

const components = {
  header: {
    row: (props) => (
      <tr
        {...props}
        style={{
          backgroundColor: "#f0f5f9",
          height: "50px",
          color: "secondary",
          fontSize: "18px",
          textAlign: "center",
          padding: "12px",
        }}
      />
    ),
    cell: (props) => (
      <th
        {...props}
        style={{
          color: "secondary",
          fontWeight: "bold",
          fontSize: "18px",
          textAlign: "center",
          padding: "12px",
        }}
      />
    ),
  },
};

const AuditLogs = () => {
  const [data, setData] = useState([
    {
      id: 1,
      timeStamp: "2023-10-01 12:00:00",
      actionType: "Create",
      user: "Admin",
      details: "Created a new merchant account",
    },
    {
      id: 2,
      timeStamp: "2023-10-01 12:00:00",
      actionType: "Create",
      user: "Admin",
      details: "Created a new merchant account",
    },
    {
      id: 3,
      timeStamp: "2023-10-01 12:00:00",
      actionType: "Create",
      user: "Admin",
      details: "Created a new merchant account",
    },
  ]);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navigate = useNavigate();

  const showViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedRecord(null);
  };

  const columns = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Timestamp",
      dataIndex: "timeStamp",
      key: "timeStamp",
      align: "center",
    },
    {
      title: "Action Type",
      dataIndex: "actionType",
      key: "actionType",
      align: "center",
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      align: "center",
    },
    { title: "Details", dataIndex: "details", key: "details", align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="">
          <Tooltip title="View Details">
            <button
              onClick={() => showViewModal(record)}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              View Details
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
        <div>
          <h1 className="text-[24px] font-bold">Audit Logs</h1>
          <p className="text-[16px] font-normal mt-2">
            Track and review all actions with detailed audit logs.
          </p>
        </div>
      </div>

      <div className="">
        <Table
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered={false}
          size="small"
          rowClassName="custom-row"
          components={components}
          className="custom-table"
        />
      </div>

      {/* View Details Modal */}
      <Modal
        // title="Merchant Profile"
        visible={isViewModalVisible}
        onCancel={handleCloseViewModal}
        width={400}
        footer={
          [
            // <Button key="close" type="primary" onClick={handleCloseViewModal}>
            //   Close
            // </Button>,
          ]
        }
      >
        {selectedRecord && (
          <div className="flex flex-col items-center justify-between gap-3 mt-8 mb-8">
            <h1 className="text-[26px] font-bold text-primary mb-2">
              Log Details
            </h1>
            <img
              src={MarchantIcon}
              alt={selectedRecord.name}
              className="w-50 h-50 rounded-full"
            />
            <div className="flex flex-col gap-2 w-full p-4">
              <p className="text-[20px] font-bold text-secondary">
                Log Details
              </p>
              <p>
                <strong>Timestamp:</strong> {selectedRecord.timeStamp}
              </p>
              <p>
                <strong>Action:</strong> {selectedRecord.actionType}
              </p>
              <p>
                <strong>User:</strong> {selectedRecord.user}
              </p>
              <p>
                <strong>Details:</strong> {selectedRecord.details}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
