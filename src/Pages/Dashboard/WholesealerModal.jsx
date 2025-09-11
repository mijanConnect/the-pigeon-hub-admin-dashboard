import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiUploadCloud } from "react-icons/fi";

export const AddWholesealerModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);

  if (!isOpen) return null;

  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file);
      setImage(URL.createObjectURL(file));
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-3/4 md:w-1/2  relative">
        <h2 className="text-xl font-semibold mb-4">Add Add Wholesealer</h2>
        <hr />
        <div className=" flex flex-col md:flex-row gap-6 mt-2">
          <div className="w-full md:w-3/5">
            <form className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="Enter Company name"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter Store name"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Email *
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <PhoneInput
                  country={"us"}
                  value={phone}
                  onChange={(phone) => setPhone(phone)}
                  inputClass="w-full !w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Address
                </label>
                <textarea
                  placeholder="Enter Address"
                  className="w-full border p-2 rounded"
                  rows="4"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="w-full border p-2 rounded"
                />
              </div>
            </form>
          </div>

          <div className="w-full md:w-1/3 flex flex-col ">
            <p className="text-[#242424] font-medium mb-4">Image</p>
            <div className="border border-dashed p-4 h-48 flex flex-col items-center justify-center text-[#434447]">
              <div className="w-16 h-16 flex items-center justify-center rounded-full border border-gray-300 mb-2">
                {image ? (
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <FiUploadCloud size={24} />
                )}
              </div>
              <p className="text-center">
                Drop your image here or{" "}
                <label className="text-blue-500 cursor-pointer">
                  Click to upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </p>
            </div>
            <div className="flex gap-2 mt-4 justify-between">
              <button
                type="button"
                onClick={onClose}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#3FC7EE] text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-500 text-lg"
          >
            ✖
          </button>
        </div>
      </div>
    </div>
  );
};
