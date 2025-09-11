import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Tooltip, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import MarchantIcon from "../../assets/marchant.png";

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

const SalesRepsManagementTable = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      image: "https://i.ibb.co/8gh3mqPR/Ellipse-48-1.jpg",
      email: "example@email.com",
      retailer: 5,
      sales: "$300",
      status: "Active",
      phone: "+1234567890",
      location: "New York",
      businessName: "Alice's Store",
    },
    {
      id: 2,
      name: "John Doe",
      image: "https://i.ibb.co/8gh3mqPR/Ellipse-48-1.jpg",
      email: "john@email.com",
      retailer: 3,
      sales: "$500",
      status: "Inactive",
      phone: "+9876543210",
      location: "California",
      businessName: "John's Shop",
    },
    {
      id: 3,
      name: "John Doe",
      image: "https://i.ibb.co/8gh3mqPR/Ellipse-48-1.jpg",
      email: "john@email.com",
      retailer: 3,
      sales: "$500",
      status: "Active",
      phone: "+9876543210",
      location: "California",
      businessName: "John's Shop",
    },
  ]);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navigate = useNavigate();

  const showViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedRecord(null);
  };

  const columns = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    { title: "Owner Name", dataIndex: "name", key: "name", align: "center" },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
      align: "center",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    { title: "Sales Rep", dataIndex: "name", key: "salesRep", align: "center" },
    { title: "Total Sales", dataIndex: "sales", key: "sales", align: "center" },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        // <div className="flex items-center justify-center">
        //   <div className="flex gap-2 border border-primary rounded-md p-1">
        //     <Button
        //       className="bg-primary !text-white hover:!text-black"
        //       onClick={() => {
        //         Swal.fire({
        //           title: "Are you sure?",
        //           text: "Do you want to accept this sales rep?",
        //           icon: "question",
        //           showCancelButton: true,
        //           confirmButtonColor: "#3085d6",
        //           cancelButtonColor: "#d33",
        //           confirmButtonText: "Yes, accept",
        //         }).then((result) => {
        //           if (result.isConfirmed) {
        //             Swal.fire({
        //               title: "Accepted!",
        //               text: "The sales rep has been accepted.",
        //               icon: "success",
        //               timer: 1500,
        //               showConfirmButton: false,
        //             });
        //             // TODO: Add your actual accept logic here
        //           }
        //         });
        //       }}
        //     >
        //       Accept
        //     </Button>

        //     <Button
        //       className="bg-red-600 !text-white hover:!text-black"
        //       onClick={() => {
        //         Swal.fire({
        //           title: "Are you sure?",
        //           text: "Do you want to reject this sales rep?",
        //           icon: "warning",
        //           showCancelButton: true,
        //           confirmButtonColor: "#3085d6",
        //           cancelButtonColor: "#d33",
        //           confirmButtonText: "Yes, reject",
        //         }).then((result) => {
        //           if (result.isConfirmed) {
        //             Swal.fire({
        //               title: "Rejected!",
        //               text: "The sales rep has been rejected.",
        //               icon: "success",
        //               timer: 1500,
        //               showConfirmButton: false,
        //             });
        //             // TODO: Add your actual reject logic here
        //           }
        //         });
        //       }}
        //     >
        //       Reject
        //     </Button>
        //   </div>
        // </div>

        <div
          className="flex gap-0 justify-between align-middle py-[7px] px-[15px] border border-primary rounded-md"
          style={{ alignItems: "center" }}
        >
          <Tooltip title="View Details">
            <button
              onClick={() => showViewModal(record)}
              className="text-primary hover:text-green-700 text-xl"
            >
              <IoEyeSharp />
            </button>
          </Tooltip>

          <Tooltip title="Delete">
            <button
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, delete it!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setData(data.filter((item) => item.id !== record.id));
                    Swal.fire({
                      title: "Deleted!",
                      text: "Your record has been deleted.",
                      icon: "success",
                    });
                  }
                });
              }}
              className="text-red-500 hover:text-red-700 text-md"
            >
              <FaTrash />
            </button>
          </Tooltip>

          <Switch
            size="small"
            checked={record.status === "Active"}
            style={{
              backgroundColor: record.status === "Active" ? "#3fae6a" : "gray",
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
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
        <div>
          <h1 className="text-[24px] font-bold">Merchant Management</h1>
          <p className="text-[16px] font-normal mt-2">
            Effortlessly manage your merchants and track performance.
          </p>
        </div>
      </div>

      <div className="">
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
      </div>

      {/* View Details Modal */}
      <Modal
        // title="Merchant Profile"
        visible={isViewModalVisible}
        onCancel={handleCloseViewModal}
        width={700}
        footer={
          [
            // <Button key="close" type="primary" onClick={handleCloseViewModal}>
            //   Close
            // </Button>,
          ]
        }
      >
        {selectedRecord && (
          <div className="flex flex-row items-center justify-between gap-3 mt-8 mb-8">
            <img
              src={MarchantIcon}
              alt={selectedRecord.name}
              className="w-214 h-214 rounded-full"
            />
            <div className="flex flex-col gap-2 w-full border border-primary rounded-md p-4">
              <p className="text-[22px] font-bold text-primary">
                Marchant Profile
              </p>
              <p>
                <strong>Name:</strong> {selectedRecord.name}
              </p>
              <p>
                <strong>Business Name:</strong> {selectedRecord.businessName}
              </p>
              <p>
                <strong>Email:</strong> {selectedRecord.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedRecord.phone}
              </p>
              <p>
                <strong>Location:</strong> {selectedRecord.location}
              </p>
              <p>
                <strong>Total Sales:</strong> {selectedRecord.sales}
              </p>
              <p>
                <strong>Status:</strong> {selectedRecord.status}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesRepsManagementTable;
