import React, { useState, useEffect } from "react";
import GradientButton from "./GradiantButton";

const UpdateModal = ({ isOpen, onClose, onSave, userData, editingId }) => {
  if (!isOpen) return null;

  const isEditMode = Boolean(editingId); // Check if editing mode is active

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    salesRep: "",
    status: "Active",
  });

  useEffect(() => {
    if (isEditMode && userData) {
      setFormData(userData);
    } else {
      setFormData({
        name: "",
        email: "",
        salesRep: "",
        status: "Active",
      });
    }
  }, [userData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? "Update Retailer" : "Add Retailer"}
        </h2>

        {/* Retailer Name */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Retailer Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter retailer name"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Assign Sales Rep - Dropdown */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Assign Sales Rep
          </label>
          <select
            name="salesRep"
            value={formData.salesRep}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Sales Rep</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Mark Johnson">Mark Johnson</option>
          </select>
        </div>

        {/* Email */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Status - Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
          <GradientButton
            onClick={handleSubmit}
          >
            {isEditMode ? "Update" : "Add"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
