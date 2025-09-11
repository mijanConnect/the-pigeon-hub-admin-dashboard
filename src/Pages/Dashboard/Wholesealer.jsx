import React, { useState } from "react";
import { AddWholesealerModal } from "./WholesealerModal";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdModeEditOutline,
} from "react-icons/md";
import Swal from "sweetalert2";
import UpdateModal from "../../components/common/UpdateModal";

const wholesealersData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Wholesealer ${i + 1}`,
  email: `wholesealer${i + 1}@gmail.com`,
  phone: `+23191633389${i + 1}`,
  address: `Address ${i + 1}, City`,
  image: `https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-around-his-neck_23-2148096439.jpg?semt=ais_hybrid/50?text=R${
    i + 1
  }`,
}));

const WholesealerTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wholesealers, setWholesealers] = useState(wholesealersData);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser(user); 
    setIsUpdateModalOpen(true); 
  };

  // Update Retailer Handler
  const handleUpdate = (updatedUserData) => {
    setWholesealers(
      wholesealers.map((wholesealer) =>
        wholesealer.id === updatedUserData.id ? updatedUserData : wholesealer
      )
    );
  };

  const handleDelete = (id) => {
    console.log(id);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setWholesealers(
          wholesealers.filter((wholesealer) => wholesealer.id !== id)
        );
        Swal.fire("Deleted!", "Wholesealer has been deleted.", "success");
      }
    });
  };

  const filteredWholesealers = wholesealers.filter(
    (wholesealer) =>
      wholesealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wholesealer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWholesealers.length / itemsPerPage);
  const displayedWholesealer = filteredWholesealers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="">
      <div className="flex justify-between items-center ">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="p-4">
          <div className="flex justify-between items-center ">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3FC7EE] text-white px-4 py-2 rounded"
            >
              + Add Wholesealer
            </button>
          </div>
          {isModalOpen && (
            <AddWholesealerModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="bg-gray-200 border-b border-gray-300">
            <th className="p-2">#</th>
            <th className="p-2">Retailer Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Address</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {displayedWholesealer.map((wholesealer, index) => (
            <tr key={wholesealer.id} className="border-b border-gray-300">
              <td className="p-2">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="flex items-center gap-2 p-2 justify-center">
                <img
                  src={wholesealer.image}
                  alt={wholesealer.name}
                  className="w-10 h-10 rounded-full"
                />
                <p>{wholesealer.name}</p>
              </td>
              <td className="p-2">{wholesealer.email}</td>
              <td className="p-2">{wholesealer.phone}</td>
              <td className="p-2">{wholesealer.address}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button className="bg-green-500 text-white px-2 py-1 rounded">
                  <MdModeEditOutline
                    onClick={() => handleEdit(wholesealer)}
                    className="text-xl"
                  />
                </button>
                <button
                  onClick={() => handleDelete(wholesealer.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  <MdDelete className="text-xl" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          <MdKeyboardArrowLeft className="text-3xl " />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-[#3FC7EE] text-white" : "bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          <MdKeyboardArrowRight className="text-3xl" />
        </button>
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && selectedUser && (
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={handleUpdate} // Handle the save operation after update
          userData={selectedUser} // Pass the selected user data to the modal
        />
      )}
    </div>
  );
};

export default WholesealerTable;
