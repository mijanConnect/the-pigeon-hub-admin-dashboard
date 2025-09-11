import React, { useState } from "react";
import { Modal, Button, Select } from "antd";
import GradientButton from "../common/GradiantButton";

const StatusUpdateModal = ({ isVisible, onClose, orderData, onUpdateStatus }) => {
  const [status, setStatus] = useState(orderData?.status || "Pending");

  return (
    <Modal
    centered
      title={`Update Status - ${orderData?.orderId}`}
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>,
        <GradientButton key="update" onClick={() => onUpdateStatus(status)}>
          Update Status
        </GradientButton>,
      ]}
    >
      <Select
        value={status}
        onChange={setStatus}
        className="w-full mb-6"
        options={[
          { value: "Pending", label: "Pending" },
          { value: "Processing", label: "Processing" },
          { value: "Cancelling", label: "Cancelling" },
          { value: "Shipped", label: "Shipped" },
          { value: "Delivered", label: "Delivered" },
        ]}
      />
    </Modal>
  );
};

// ✅ Export the component
export default StatusUpdateModal;
