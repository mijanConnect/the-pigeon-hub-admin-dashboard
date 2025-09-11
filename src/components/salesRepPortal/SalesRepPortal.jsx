import React, { useState } from "react";
import { Table, Modal, Tooltip } from "antd";
import Swal from "sweetalert2";
import NewCampaign from "../promotionManagement/components/NewCampaing.jsx";
import { CopyOutlined } from "@ant-design/icons";

const components = {
  header: {
    row: (props) => (
      <tr
        {...props}
        style={{
          backgroundColor: "#f0f5f9",
          height: "50px",
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
          fontWeight: "bold",
          fontSize: "18px",
          textAlign: "center",
          padding: "12px",
        }}
      />
    ),
  },
};

const SalesRepPortal = () => {
  const [data, setData] = useState([
    {
      id: 1,
      customerName: "John Doe",
      phoneNumber: "123-456-7890",
      email: "example@mail.com",
      paymentStatus: "Paid",
      actionStatus: "Inactive",
      status: "Active",
      statusProgress: 0, // 0 = only Acknowledge, 1 = Activate, 2 = Generate Token
    },
  ]);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isNewCampaignModalVisible, setIsNewCampaignModalVisible] =
    useState(false);
  const [isCashTokenModalVisible, setIsCashTokenModalVisible] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [referralID, setReferralID] = useState("ANDREW856 D");

  // Show Acknowledge Cash Payment modal
  const showViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);

    // Step progress to 1 (Activate User enabled)
    setData((prevData) =>
      prevData.map((item) =>
        item.id === record.id ? { ...item, statusProgress: 1 } : item
      )
    );
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedRecord(null);
  };

  const handleAddCampaign = (newCampaign) => {
    setData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        status: "Active",
        statusProgress: 0,
        ...newCampaign,
      },
    ]);
    setIsNewCampaignModalVisible(false);
    Swal.fire({
      icon: "success",
      title: "Campaign Added!",
      text: "Your new campaign has been added successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Generate Cash Token
  const handleGenerateToken = () => {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedToken(token);
    setIsCashTokenModalVisible(true);
  };

  // Then, update handleConfirmToken:
  const handleConfirmToken = () => {
    setReferralID(generatedToken); // set token as referral ID
    Swal.fire({
      icon: "success",
      title: "Token Generated!",
      text: `Your cash token: ${generatedToken}`,
    });
    setIsCashTokenModalVisible(false);
  };

  // Toggle user active/inactive
  const handleToggleUserStatus = (record) => {
    const isCurrentlyActive = record.actionStatus === "Active";

    Swal.fire({
      title: isCurrentlyActive
        ? "Deactivate this user?"
        : "Activate this user?",
      text: `This will set the user status to ${
        isCurrentlyActive ? "Inactive" : "Active"
      }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isCurrentlyActive
        ? "Yes, deactivate"
        : "Yes, activate",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === record.id
              ? {
                  ...item,
                  actionStatus: isCurrentlyActive ? "Inactive" : "Active",
                  statusProgress: 2, // Generate Token enabled
                }
              : item
          )
        );

        Swal.fire({
          title: isCurrentlyActive ? "Deactivated!" : "Activated!",
          text: `User has been set to ${
            isCurrentlyActive ? "Inactive" : "Active"
          }.`,
          icon: "success",
        });
      }
    });
  };

  const columns = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      align: "center",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
    },
    {
      title: "Action Status",
      dataIndex: "actionStatus",
      key: "actionStatus",
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <div className="border border-primary rounded-md px-2 py-2 flex gap-2">
            <Tooltip title="Acknowledge cash payment">
              <button
                onClick={() => showViewModal(record)}
                disabled={record.statusProgress > 0}
                className={`text-secondary border border-primary rounded-md px-2 py-1 bg-[#D7F4DE] ${
                  record.statusProgress > 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Acknowledge cash payment
              </button>
            </Tooltip>

            <Tooltip
              title={
                record.actionStatus === "Active"
                  ? "Deactivate User"
                  : "Activate User"
              }
            >
              <button
                onClick={() => handleToggleUserStatus(record)}
                disabled={record.statusProgress < 1}
                className={`text-secondary border border-primary rounded-md px-2 py-1 bg-[#D7F4DE] ${
                  record.statusProgress < 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {record.actionStatus === "Active"
                  ? "Deactivate User"
                  : "Activate User"}
              </button>
            </Tooltip>

            <Tooltip title="Generate a cash token">
              <button
                onClick={handleGenerateToken}
                disabled={record.statusProgress < 2}
                className={`text-secondary border border-primary rounded-md px-2 py-1 bg-[#D7F4DE] ${
                  record.statusProgress < 2
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Generate a cash token
              </button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ];

  const handleCopyReferralID = () => {
    if (!referralID) return;
    navigator.clipboard
      .writeText(referralID)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Copied!",
          text: `Referral ID "${referralID}" has been copied.`,
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to copy referral ID.",
        });
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
        <div>
          <h1 className="text-[24px] font-bold">Customers Referred</h1>
          <p className="text-[16px] font-normal mt-2">
            Track and manage customers you've referred effortlessly.
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 border border-secondary rounded-md px-12 py-2">
          <p>Your Referral ID</p>
          <div className="flex items-center gap-2">
            <p className="font-bold text-[16px]">{referralID}</p>
            <button onClick={handleCopyReferralID}>
              <CopyOutlined />
            </button>
          </div>
        </div>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }}
        bordered={false}
        size="small"
        rowClassName="custom-row"
        components={components}
        className="custom-table"
        rowKey="id"
      />

      {/* New Campaign Modal */}
      <Modal
        open={isNewCampaignModalVisible}
        onCancel={() => setIsNewCampaignModalVisible(false)}
        footer={null}
        width={1000}
      >
        <NewCampaign
          onSave={handleAddCampaign}
          onCancel={() => setIsNewCampaignModalVisible(false)}
        />
      </Modal>

      {/* Cash Token Modal */}
      <Modal
        open={isCashTokenModalVisible}
        onOk={handleConfirmToken}
        onCancel={() => setIsCashTokenModalVisible(false)}
        okText="Yes"
        cancelText="No"
      >
        <div className="flex flex-col items-center my-16 border border-secondary rounded-md p-8">
          <p className="text-[16px] font-normal">
            Cash token generated for John Doe
          </p>
          <p className="text-[16px] font-bold mt-2">{generatedToken}</p>
        </div>
      </Modal>
    </div>
  );
};

export default SalesRepPortal;
