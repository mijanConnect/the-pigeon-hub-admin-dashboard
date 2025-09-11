import React, { useState } from "react";
import { Table, Button, Modal, Input, Select, Form, ConfigProvider } from "antd";
import GradientButton from "../common/GradiantButton";

const { Option } = Select;

const LoyalityProgramTable = () => {
  const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
  const [isManageEligibilityModalOpen, setIsManageEligibilityModalOpen] =
    useState(false);
  const [form] = Form.useForm();

  
  const data = [
    {
      key: "1",
      rank: 1,
      retailer: "Retailer A",
      email: "retailerA@example.com",
      totalSales: "50,000",
      tier: "100",
      eligibility: "Yes",
    },
    {
      key: "2",
      rank: 2,
      retailer: "Retailer B",
      email: "retailerB@example.com",
      totalSales: "30,000",
      tier: "50",
      eligibility: "No",
    },
    {
      key: "3",
      rank: 3,
      retailer: "Retailer C",
      email: "retailerC@example.com",
      totalSales: "70,000",
      tier: "43",
      eligibility: "Yes",
    },
    {
      key: "4",
      rank: 4,
      retailer: "Retailer D",
      email: "retailerD@example.com",
      totalSales: "20,000",
      tier: "500",
      eligibility: "No",
    },
   
  ];

  const columns = [
    { title: "Rank", dataIndex: "rank", key: "rank", align: "center" },
    {
      title: "Retailer Name",
      dataIndex: "retailer",
      key: "retailer",
      align: "center",
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Total Purchased",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "center",
    },
    { title: "Total Points", dataIndex: "tier", key: "tier", align: "center" },
    
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold">LeaderBoard</h2>
        {/* <div>
          <GradientButton onClick={() => setIsAddTierModalOpen(true)}>
            Add Tier
          </GradientButton>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#0090B9",
                colorPrimaryHover: "#336C79",
              },
            }}
          >
            <GradientButton
              onClick={() => setIsManageEligibilityModalOpen(true)}
            >
              Manage Tier & Eligibility
            </GradientButton>
          </ConfigProvider>
        </div> */}
      </div>
      <div className="bg-gradient-to-r from-primary  to-secondary px-6 pt-6  rounded-xl">
        <Table
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered={false}
          size="middle"
          rowClassName="custom-row"
        />
      </div>

      {/* Add Tier Modal */}
      <Modal
        title="Add Tier"
        centered
        open={isAddTierModalOpen}
        onCancel={() => setIsAddTierModalOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{
          style: {
            background: "linear-gradient(to right, #4E9DAB, #336C79)",
            border: "none",
            color: "white",
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tier Name"
            name="tierName"
            rules={[{ required: true, message: "Enter Tier Name" }]}
          >
            <Input placeholder="Enter tier name" />
          </Form.Item>
          <Form.Item
            label="Tier Threshold ($)"
            name="tierThreshold"
            rules={[{ required: true, message: "Enter threshold amount" }]}
          >
            <Input placeholder="Enter threshold amount" type="number" />
          </Form.Item>
          <Form.Item
            label="Eligibility"
            name="eligibility"
            rules={[{ required: true, message: "Select eligibility" }]}
          >
            <Select>
              <Option value="Yes">Yes</Option>
              <Option value="No">No</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Eligibility Modal */}
      <Modal
        title="Manage Eligibility"
        centered
        open={isManageEligibilityModalOpen}
        onCancel={() => setIsManageEligibilityModalOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{
          style: {
            background: "linear-gradient(to right, #4E9DAB, #336C79)",
            border: "none",
            color: "white",
          },
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Bronze Tier Threshold ($)" name="bronzeThreshold">
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>
          <Form.Item label="Silver Tier Threshold ($)" name="silverThreshold">
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>
          <Form.Item label="Gold Tier Threshold ($)" name="goldThreshold">
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>
          <Form.Item
            label="Platinum Tier Threshold ($)"
            name="platinumThreshold"
          >
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>
          <Form.Item label="Eligibility Tiers" name="eligibilityTiers">
            <Select mode="multiple" placeholder="Select eligibility tiers">
              <Option value="Bronze">Bronze</Option>
              <Option value="Silver">Silver</Option>
              <Option value="Gold">Gold</Option>
              <Option value="Platinum">Platinum</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoyalityProgramTable;
