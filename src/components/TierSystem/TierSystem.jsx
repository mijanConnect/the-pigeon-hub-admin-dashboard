import React, { useState } from "react";
import { Button, Modal, Input, Form } from "antd";

export default function TierSystem() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tiers, setTiers] = useState([
    {
      name: "Basic",
      threshold: 0,
      reward: "10% Off",
      lockoutDuration: 0,
      pointsSystemLockoutDuration: 0,
    },
    {
      name: "Gold",
      threshold: 10000,
      reward: "15% Off",
      lockoutDuration: 0,
      pointsSystemLockoutDuration: 0,
    },
    {
      name: "Premium",
      threshold: 20000,
      reward: "20% Off",
      lockoutDuration: 0,
      pointsSystemLockoutDuration: 0,
    },
  ]);

  // Open modal with tier details
  const showModal = (tier) => {
    setEditingTier(tier);
    setIsModalVisible(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTier(null);
  };

  // Save changes
  const handleSave = (values) => {
    setTiers((prevTiers) =>
      prevTiers.map((t) =>
        t.name === editingTier.name ? { ...t, ...values } : t
      )
    );
    setIsModalVisible(false);
    setEditingTier(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[24px] font-bold">Loyalty Program Management</h1>
          <p className="text-[16px] font-normal mt-2">
            Configure your tiers, rewards, and point accumulation rules.
          </p>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="px-8 py-8 flex flex-col gap-4 border border-gray-200 rounded-lg">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="px-6 py-4 rounded-lg border border-primary bg-white"
          >
            <div className="flex justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-bold text-[24px] text-secondary">
                  {tier.name}
                </h2>
                <p>
                  Tier ({tier.name}) Points Threshold: {tier.threshold}
                </p>
                <p>Tier Reward: {tier.reward}</p>
              </div>
              <Button
                className="bg-primary text-white hover:text-secondary font-bold"
                onClick={() => showModal(tier)}
              >
                Edit Tier
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Change Log */}
      <div className="px-8 py-8">
        <div className="px-6 py-4 rounded-lg border border-primary bg-white flex flex-col gap-2 mt-2">
          <h2 className="font-bold text-[24px] text-secondary">
            Tier System Change Log
          </h2>
          <p>Added Gold Tier with 10000 points threshold.</p>
          <p>admin@merchant.com - 2024-06-15 10:30 AM</p>
          <p>Updated Silver Tier point multiplier to 1.5x.</p>
          <p>admin@merchant.com - 2024-06-10 02:00 PM</p>
        </div>
      </div>

      {/* Ant Design Modal */}
      <Modal
        title={`Edit Tier - ${editingTier?.name || ""}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editingTier}
          onFinish={handleSave}
        >
          <Form.Item
            label="Tire Name"
            name="name"
            rules={[{ required: true, message: "Please enter tier name" }]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            label="Points Threshold"
            name="threshold"
            rules={[{ required: true, message: "Please enter threshold" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Reward"
            name="reward"
            rules={[{ required: true, message: "Please enter reward" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tier Lockout Duration (Month)"
            name="lockoutDuration"
            rules={[{ required: true, message: "Please enter threshold" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Points System Lockout Duration (Month)"
            name="pointsSystemLockoutDuration"
            rules={[{ required: true, message: "Please enter threshold" }]}
          >
            <Input type="number" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} className="border border-primary">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-primary text-white hover:text-secondary font-bold"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
