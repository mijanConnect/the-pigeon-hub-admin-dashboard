"use client";
import React, { useState } from "react";
import { Table, Button, Switch, Form, Input, Tooltip } from "antd";
import { FaEdit } from "react-icons/fa";
import { IoEyeSharp, IoArrowBack } from "react-icons/io5";
import Swal from "sweetalert2";
import MarchantIcon from "../../assets/marchant.png";
import NewCampaign from "../promotionManagement/components/NewCampaing.jsx";

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

const PromotionManagement = () => {
  const [data, setData] = useState([
    {
      id: 1,
      promotionName: "Spring Sale",
      promotionType: "Discount",
      customerReach: 1000,
      customerSegment: "New Customers",
      discountPercentage: 20,
      startDate: "2023-11-21",
      endDate: "2023-12-31",
      status: "Active",
    },
    {
      id: 2,
      promotionName: "Summer Offer",
      promotionType: "Cashback",
      customerReach: 500,
      customerSegment: "Returning Customers",
      discountPercentage: 15,
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      status: "Inactive",
    },
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isNewCampaignModalVisible, setIsNewCampaignModalVisible] =
    useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleAddCampaign = (newCampaign) => {
    setData((prev) => [
      ...prev,
      { id: prev.length + 1, status: "Active", ...newCampaign },
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

  const handleEditSave = (values) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRecord.id ? { ...item, ...values } : item
      )
    );
    setIsEditModalVisible(false);
    setSelectedRecord(null); // <-- reset selectedRecord
    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Your campaign has been updated successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setSelectedRecord(null); // <-- reset selectedRecord
  };

  const columns = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Promotion Name",
      dataIndex: "promotionName",
      key: "promotionName",
      align: "center",
    },
    {
      title: "Promotion Type",
      dataIndex: "promotionType",
      key: "promotionType",
      align: "center",
    },
    {
      title: "Customer Reach",
      dataIndex: "customerReach",
      key: "customerReach",
      align: "center",
    },
    {
      title: "Customer Segment",
      dataIndex: "customerSegment",
      key: "customerSegment",
      align: "center",
    },
    {
      title: "Discount Percentage",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      align: "center",
    },
    {
      title: "Date",
      key: "dateRange",
      align: "center",
      render: (_, record) => {
        const start = record.startDate
          ? new Date(record.startDate).toLocaleDateString()
          : "-";
        const end = record.endDate
          ? new Date(record.endDate).toLocaleDateString()
          : "-";
        return (
          <div className="flex flex-col items-start justify-center gap-1">
            <p>
              <span className="font-bold">Start Date: </span>
              <span className="border border-primary px-[5px] py-[1px] rounded-sm">
                {start}
              </span>
            </p>
            <p>
              <span className="font-bold">End Date: </span>
              <span className="border border-primary px-[5px] py-[1px] rounded-sm">
                {end}
              </span>
            </p>
          </div>
        );
      },
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="py-[10px] px-[10px] border border-primary rounded-md">
          <div
            className="flex gap-2 justify-between align-middle"
            style={{ alignItems: "center" }}
          >
            <Tooltip title="View Details">
              <button
                onClick={() => setSelectedRecord(record)}
                className="text-primary hover:text-green-700 text-xl"
              >
                <IoEyeSharp />
              </button>
            </Tooltip>
            <Tooltip title="Edit">
              <button
                onClick={() => {
                  setSelectedRecord(record); // Important: set record before opening modal
                  setIsEditModalVisible(true);
                }}
                className="text-primary hover:text-green-700 text-[17px]"
              >
                <FaEdit />
              </button>
            </Tooltip>
            <Switch
              size="small"
              checked={record.status === "Active"}
              style={{
                backgroundColor:
                  record.status === "Active" ? "#3fae6a" : "gray",
              }}
              onChange={(checked) => {
                Swal.fire({
                  title: "Are you sure?",
                  text: `You are about to change status to ${
                    checked ? "Active" : "Inactive"
                  }.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, change it!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setData((prev) =>
                      prev.map((item) =>
                        item.id === record.id
                          ? { ...item, status: checked ? "Active" : "Inactive" }
                          : item
                      )
                    );
                    Swal.fire({
                      title: "Updated!",
                      text: `Status has been changed to ${
                        checked ? "Active" : "Inactive"
                      }.`,
                      icon: "success",
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  }
                });
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  const columns2 = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Promotion Name",
      dataIndex: "promotionName",
      key: "promotionName",
      align: "center",
    },
    {
      title: "Promotion Type",
      dataIndex: "promotionType",
      key: "promotionType",
      align: "center",
    },
    {
      title: "Customer Reach",
      dataIndex: "customerReach",
      key: "customerReach",
      align: "center",
    },
    {
      title: "Customer Segment",
      dataIndex: "customerSegment",
      key: "customerSegment",
      align: "center",
    },
    {
      title: "Discount Percentage",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      align: "center",
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
  ];

  // Full-page view
  if (selectedRecord && !isEditModalVisible) {
    return (
      <div className="">
        <div className="flex justify-between items-center">
          <div className="flex items-center mb-4 gap-6">
            <Button
              icon={<IoArrowBack />}
              onClick={() => setSelectedRecord(null)}
              className="mb-4"
            ></Button>
            <div>
              <h1 className="text-[24px] font-bold">Campaign Details</h1>
              <p className="text-[16px] font-normal mt-2">
                View and manage all the details of your active campaigns.
              </p>
            </div>
          </div>
          <Button
            // icon={<IoArrowBack />}
            onClick={() => setSelectedRecord(null)}
            type="primary"
            className="bg-primary !text-white hover:!text-secondary hover:!bg-white hover:!border-primary px-[30px] py-[25px] rounded-full text-[18px] font-bold"
          >
            Export
          </Button>
        </div>

        <Table
          dataSource={data}
          columns={columns2}
          pagination={{ pageSize: 10 }}
          bordered={false}
          size="small"
          rowClassName="custom-row"
          components={components}
          className="custom-table"
        />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-[24px] font-bold">Campaigns List</h1>
          <p className="text-[16px] font-normal mt-2">
            View and manage all your active campaigns in one place.
          </p>
        </div>
        <Button
          type="primary"
          className="bg-primary !text-white hover:!text-secondary hover:!bg-white hover:!border-primary px-[30px] py-[25px] rounded-full text-[18px] font-bold"
          onClick={() => setIsNewCampaignModalVisible(true)}
        >
          New Campaign
        </Button>
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
      />

      {/* Edit Campaign Modal */}
      {isEditModalVisible && selectedRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-[600px]">
            <Form
              layout="vertical"
              initialValues={selectedRecord}
              onFinish={handleEditSave}
            >
              <Form.Item
                name="promotionName"
                label="Promotion Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="promotionType" label="Promotion Type">
                <Input />
              </Form.Item>
              <Form.Item name="customerReach" label="Customer Reach">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="customerSegment" label="Customer Segment">
                <Input />
              </Form.Item>
              <Form.Item name="discountPercentage" label="Discount Percentage">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="startDate" label="Start Date">
                <Input type="date" />
              </Form.Item>
              <Form.Item name="endDate" label="End Date">
                <Input type="date" />
              </Form.Item>
              <div className="flex gap-2 mt-4">
                <Button
                  type="default"
                  className="flex-1"
                  onClick={handleEditCancel} // <-- use the new handler
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {isNewCampaignModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-[1000px]">
            <NewCampaign
              onSave={handleAddCampaign}
              onCancel={() => setIsNewCampaignModalVisible(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
