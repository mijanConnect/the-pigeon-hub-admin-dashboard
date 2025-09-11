import React, { useState } from "react";
import { Modal, Button, Input, Select } from "antd";

const { Option } = Select;

const NotificationModal = ({ isOpen, onClose }) => {
  const [communicationType, setCommunicationType] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    console.log("Sent Data:", {
      communicationType,
      title,
      message,
    });
    onClose(); // Modal বন্ধ করার জন্য
  };

  return (
    <Modal
      title="Send Message / Push Notification"
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      {/* Communication Type */}
      <label className="block text-gray-700 mb-2">
        Choose Communication Type
      </label>
      <Select
        className="w-full mb-4"
        value={communicationType}
        onChange={(value) => setCommunicationType(value)}
        placeholder="Select Communication Type"
      >
        <Option value="Push Notification">Push Notification</Option>
        <Option value="Sms">Sms</Option>
        <Option value="Email">Email</Option>
      </Select>

      {/* Title Input */}
      <label className="block text-gray-700 mb-2">Title</label>
      <Input
        className="w-full mb-4"
        placeholder="Enter notification title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Message Input */}
      <label className="block text-gray-700 mb-2">Message Details</label>
      <Input.TextArea
        className="w-full"
        rows={4}
        placeholder="Enter notification details"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Send Button */}
      <Button
        type="primary"
        className="mt-4 w-full bg-[#3FC7EE] text-white"
        onClick={handleSend}
      >
        Send
      </Button>
    </Modal>
  );
};

export default NotificationModal;
