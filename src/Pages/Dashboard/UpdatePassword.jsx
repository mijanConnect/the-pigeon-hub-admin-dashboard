import { useState } from "react";

const Events = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Change Password
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Current Password *
          </label>
          <div className="relative">
            <input
              type={showPassword.current ? "text" : "password"}
              placeholder="Enter Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword("current")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              👁
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            New Password *
          </label>
          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              placeholder="Enter new Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />

            <button
              type="button"
              onClick={() => toggleShowPassword("new")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              👁
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Confirm New Password *
          </label>
          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword("confirm")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              👁
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-100">
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#3FC7EE] text-white rounded ">
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;
