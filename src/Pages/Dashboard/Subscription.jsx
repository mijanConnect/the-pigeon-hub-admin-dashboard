import { CheckCircleFilled, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  message,
  Modal,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import FeaturedInput from "../../components/common/PackageFeatureInput";
import Spinner from "../../components/common/Spinner";
import {
  useAddPackageMutation,
  useDeletePackageMutation,
  useGetPackagesQuery,
  useUpdatePackageMutation,
} from "../../redux/apiSlices/packageSlice";

const PackagesPlans = () => {
  // Local state (no hardcoded Freebie)
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [form] = Form.useForm();

  // RTK Query hooks
  const { data: apiPackages, isLoading, isError } = useGetPackagesQuery();
  const [addPackage] = useAddPackageMutation();
  const [updatePackage] = useUpdatePackageMutation();
  const [deletePackage] = useDeletePackageMutation();

  // Load API packages only
  useEffect(() => {
    if (apiPackages) {
      setPackages([...apiPackages]);
    }
  }, [apiPackages]);

  // Toggle package active status
  const togglePackageStatus = async (pkg) => {
    try {
      const updatedPkg = { ...pkg, status: pkg.active ? "Inactive" : "Active" };
      await updatePackage({ id: pkg.id, formData: updatedPkg });
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, active: !p.active } : p))
      );
      message.success("Package status updated");
    } catch (err) {
      message.error("Failed to update package status");
    }
  };

  // Show modal for add/edit
  const showModal = (pkg = null) => {
    setIsEditing(!!pkg);
    setCurrentPackage(pkg);
    setIsModalOpen(true);

    if (pkg) {
      form.setFieldsValue({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        features: pkg.features || [],
      });
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Delete package
  const handleDelete = async (pkg) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this package!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#023F86",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePackage(pkg.id);
          setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
          Swal.fire({
            title: "Deleted!",
            text: "The package has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (err) {
          message.error("Failed to delete package");
        }
      }
    });
  };

  // Add/Update package
  const handleSubmit = async (values) => {
    const formattedData = {
      title: values.title,
      description: values.description,
      price: Number(values.price),
      duration: values.duration,
      features: values.features.filter((f) => f.trim() !== ""),
      active: true,
    };

    try {
      if (isEditing && currentPackage) {
        await updatePackage({ id: currentPackage.id, formData: formattedData });
        setPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === currentPackage.id ? { ...pkg, ...formattedData } : pkg
          )
        );
        message.success("Package updated successfully");
      } else {
        const newPkg = await addPackage(formattedData).unwrap();
        setPackages((prev) => [...prev, newPkg]);
        message.success("Package added successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error("Failed to save package");
    }
  };

  const getCardStyle = (pkg) => {
    // Previously only "Freebie" used a light card. With Freebie removed, keep others as primary.
    return "shadow-lg rounded-lg bg-primary hover:shadow-xl transition-all transform hover:-translate-y-1";
  };

  const getTitleStyle = (pkg) =>
    pkg.popular
      ? "text-[#071952] text-[22px] font-semibold"
      : "text-white text-[22px] font-semibold";

  const getPriceStyle = (pkg) =>
    pkg.popular
      ? "text-[#071952] text-[56px] font-semibold"
      : "text-white text-[56px] font-semibold";

  const getDurationStyle = (pkg) =>
    pkg.popular
      ? "text-[#071952] text-[16px] font-regular"
      : "text-white text-[16px] font-regular";

  const getDescriptionStyle = (pkg) =>
    pkg.popular
      ? "text-[#071952] text-[16px] font-thin"
      : "text-white text-[16px] font-thin";

  const getFeatureStyle = (pkg) =>
    pkg.popular
      ? "text-[#071952] text-[16px] font-thin"
      : "text-white text-[16px] font-thin";

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  if (isError)
    return (
      <div className="text-center text-gray-500">
        <p>Oops! Something went wrong. Please try again later.</p>
      </div>
      // <p>Failed to load pigeons.</p>
      // <p className="text-center py-12 text-red-500">Failed to load packages</p>
    );

  return (
    <div className="flex flex-col !justify-center !items-center mt-10">
      {/* <div className="flex flex-col justify-center items-center mb-8">
        <p className="bg-primary px-[12px] py-[2px] text-white rounded-3xl mb-2">
          Pricing Plan
        </p>
        <h2 className="text-[28px] font-semibold text-secondary">
          Subscription Prices
        </h2>
        <p className="text-[15px] text-center font-normal mb-[10px]">
          Experience year-round comfort with our A-rated uPVC windows, designed
          to keep your <br /> home warm in winter, cool in summer, and stylish
          every day.
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className=" text-white px-5 h-auto rounded-lg shadow-lg hover:bg-[#012F60] transition-all flex items-center"
          onClick={() => showModal()}
        >
          Add Package
        </Button>
      </div> */}
      <div className="">
        {packages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No packages available.</p>
            <p>Click the "Add Package" button to create your first package.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                title={null}
                bordered={false}
                className={getCardStyle(pkg)}
              >
                <div className="flex justify-end mb-2">
                  <div className="flex gap-2">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => showModal(pkg)}
                      className="text-gray-800 border-gray-800 hover:text-primary hover:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-start items-start mb-4">
                  <h3 className={getTitleStyle(pkg)}>{pkg.title}</h3>
                  <div className="mb-2">
                    <span className={getPriceStyle(pkg)}>
                      ${pkg.price}
                      <span className={getDurationStyle(pkg)}>
                        /{pkg.paymentType}
                      </span>
                    </span>
                  </div>
                  <p className={getDescriptionStyle(pkg)}>{pkg.description}</p>
                </div>

                <div className="rounded-lg">
                  <List
                    size="small"
                    dataSource={pkg.features}
                    renderItem={(feature) => {
                      let icon = null;
                      let featureTextColor = "";

                      if (pkg.popular || pkg.title === "Professional") {
                        icon = (
                          <CheckCircleFilled className="text-white mr-2 text-[20px]" />
                        );
                        featureTextColor = "text-white";
                      } else {
                        icon = (
                          <CheckCircleFilled className="text-white mr-2 text-[20px]" />
                        );
                        featureTextColor = "text-white";
                      }

                      return (
                        <List.Item className="border-none !px-0 !py-2">
                          <div className="flex items-start">
                            {icon}
                            <span
                              className={`text-[16px] font-thin ${featureTextColor}`}
                            >
                              {feature}
                            </span>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </div>

                {/* <Button
                  className={`w-full mt-12 border ${
                    pkg.active
                      ? "border-white bg-primary text-white hover:!bg-white hover:!text-primary py-5 !border-lg"
                      : "border-primary bg-white text-primary hover:!bg-primary hover:!text-white !hover:border-white py-5 !border-lg"
                  }`}
                  onClick={() => togglePackageStatus(pkg)}
                >
                  {pkg.active ? "Turn Off" : "Turn On"}
                </Button> */}
              </Card>
            ))}
          </div>
        )}

        <Modal
          title={isEditing ? "Edit Package" : "Add Package"}
          open={isModalOpen}
          onCancel={handleCancel}
          width={800}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button key="save" type="primary" onClick={() => form.submit()}>
              {isEditing ? "Update Package" : "Add Package"}
            </Button>,
          ]}
          className="rounded-lg"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mb-6"
          >
            <Row gutter={[30, 20]}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="title"
                  label="Package Title"
                  rules={[{ required: true, message: "Title is required" }]}
                  className="custom-form-item-ant"
                >
                  <Select
                    placeholder="Select Package"
                    className="custom-select-ant-modal"
                  >
                    <Select.Option value="Free Trial -1 Month">
                      Free Trial -1 Month
                    </Select.Option>
                    <Select.Option value="Monthly Plan">
                      Monthly Plan
                    </Select.Option>
                    <Select.Option value="Yearly Plan (Best Value)">
                      Yearly Plan (Best Value)
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true, message: "Price is required" }]}
                  className="custom-form-item-ant"
                >
                  <Input
                    type="number"
                    prefix="$"
                    placeholder="29.99"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              {/* <Col xs={24} sm={12} md={12}>
                <Form.Item
                  name="duration"
                  label="Duration"
                  rules={[{ required: true, message: "Duration is required" }]}
                  className="custom-form-item-ant-select"
                >
                  <Select
                    placeholder="Select duration"
                    className="custom-select-ant-modal"
                  >
                    <Select.Option value="1 month">1 Month</Select.Option>
                    <Select.Option value="3 months">3 Months</Select.Option>
                    <Select.Option value="6 months">6 Months</Select.Option>
                    <Select.Option value="1 year">1 Year</Select.Option>
                  </Select>
                </Form.Item>
              </Col> */}

              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Description is required" },
                  ]}
                  className="custom-form-item-ant"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Short description of what this package offers"
                    className="custom-input-ant-modal"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="features"
                  label="Features"
                  rules={[
                    {
                      required: true,
                      message: "At least one feature is required",
                    },
                  ]}
                  className="custom-form-item-ant"
                >
                  <FeaturedInput />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PackagesPlans;

// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Button,
//   Modal,
//   Form,
//   Input,
//   List,
//   message,
//   Select,
//   Row,
//   Col,
// } from "antd";
// import {
//   EditOutlined,
//   PlusOutlined,
//   CheckCircleFilled,
// } from "@ant-design/icons";
// import Swal from "sweetalert2";
// import FeaturedInput from "../../components/common/PackageFeatureInput";
// import { CloseCircleFilled } from "@ant-design/icons";
// import {
//   useGetPackagesQuery,
//   useAddPackageMutation,
//   useUpdatePackageMutation,
//   useDeletePackageMutation,
// } from "../../redux/apiSlices/packageSlice";

// const PackagesPlans = () => {
//   // Hardcoded Freebie package
//   const freebiePackage = {
//     id: 1,
//     title: "Freebie",
//     description: "Ideal for individuals.",
//     price: 0,
//     duration: "1 month",
//     features: [
//       "50 of PNG & SVG Uploaded Pictures",
//       "Access to 3 Generation Details",
//       "Upload custom icons and fonts",
//       "Unlimited Sharing",
//       "Upload graphics & video in up to 4k",
//       "Unlimited Projects",
//       "Instant Access to our design system",
//       "Create teams to collaborate on designs",
//     ],
//     popular: false,
//     active: true,
//   };

//   // Local state
//   const [packages, setPackages] = useState([freebiePackage]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentPackage, setCurrentPackage] = useState(null);
//   const [form] = Form.useForm();

//   // RTK Query hooks
//   const { data: apiPackages, isLoading, isError } = useGetPackagesQuery();
//   const [addPackage] = useAddPackageMutation();
//   const [updatePackage] = useUpdatePackageMutation();
//   const [deletePackage] = useDeletePackageMutation();

//   // Merge Freebie + API packages
//   useEffect(() => {
//     if (apiPackages) {
//       setPackages([freebiePackage, ...apiPackages]);
//     }
//   }, [apiPackages]);

//   // Toggle package active status
//   const togglePackageStatus = async (pkg) => {
//     try {
//       const updatedPkg = { ...pkg, status: pkg.active ? "Inactive" : "Active" };
//       await updatePackage({ id: pkg.id, formData: updatedPkg });
//       setPackages((prev) =>
//         prev.map((p) => (p.id === pkg.id ? { ...p, active: !p.active } : p))
//       );
//       message.success("Package status updated");
//     } catch (err) {
//       message.error("Failed to update package status");
//     }
//   };

//   // Show modal for add/edit
//   const showModal = (pkg = null) => {
//     setIsEditing(!!pkg);
//     setCurrentPackage(pkg);
//     setIsModalOpen(true);

//     if (pkg) {
//       form.setFieldsValue({
//         title: pkg.title,
//         description: pkg.description,
//         price: pkg.price,
//         duration: pkg.duration,
//         features: pkg.features || [],
//       });
//     } else {
//       form.resetFields();
//     }
//   };

//   // Close modal
//   const handleCancel = () => {
//     setIsModalOpen(false);
//     form.resetFields();
//   };

//   // Delete package
//   const handleDelete = async (pkg) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "Once deleted, you will not be able to recover this package!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#023F86",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await deletePackage(pkg.id);
//           setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
//           Swal.fire({
//             title: "Deleted!",
//             text: "The package has been deleted.",
//             icon: "success",
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         } catch (err) {
//           message.error("Failed to delete package");
//         }
//       }
//     });
//   };

//   // Add/Update package
//   const handleSubmit = async (values) => {
//     const formattedData = {
//       title: values.title,
//       description: values.description,
//       price: Number(values.price),
//       duration: values.duration,
//       features: values.features.filter((f) => f.trim() !== ""),
//       active: true,
//     };

//     try {
//       if (isEditing && currentPackage) {
//         await updatePackage({ id: currentPackage.id, formData: formattedData });
//         setPackages((prev) =>
//           prev.map((pkg) =>
//             pkg.id === currentPackage.id ? { ...pkg, ...formattedData } : pkg
//           )
//         );
//         message.success("Package updated successfully");
//       } else {
//         const newPkg = await addPackage(formattedData).unwrap();
//         setPackages((prev) => [...prev, newPkg]);
//         message.success("Package added successfully");
//       }
//       setIsModalOpen(false);
//       form.resetFields();
//     } catch (err) {
//       message.error("Failed to save package");
//     }
//   };

//   const getCardStyle = (pkg) => {
//     if (pkg.title === "Freebie") {
//       return "shadow-sm rounded-lg border border-gray-300 bg-[#F9FAFB] hover:shadow-md transition-all transform hover:-translate-y-1";
//     } else {
//       return "shadow-lg rounded-lg bg-primary hover:shadow-xl transition-all transform hover:-translate-y-1";
//     }
//   };

//   const getTitleStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[22px] font-semibold"
//       : "text-white text-[22px] font-semibold";

//   const getPriceStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[56px] font-semibold"
//       : "text-white text-[56px] font-semibold";

//   const getDurationStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[16px] font-regular"
//       : "text-white text-[16px] font-regular";

//   const getDescriptionStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[16px] font-thin"
//       : "text-white text-[16px] font-thin";

//   const getFeatureStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[16px] font-thin"
//       : "text-white text-[16px] font-thin";

//   if (isLoading)
//     return <p className="text-center py-12">Loading packages...</p>;
//   if (isError)
//     return (
//       <p className="text-center py-12 text-red-500">Failed to load packages</p>
//     );

//   return (
//     <div className="flex flex-col !justify-center !items-center mt-10">
//       {/* <div className="flex flex-col justify-center items-center mb-8">
//         <p className="bg-primary px-[12px] py-[2px] text-white rounded-3xl mb-2">
//           Pricing Plan
//         </p>
//         <h2 className="text-[28px] font-semibold text-secondary">
//           Subscription Prices
//         </h2>
//         <p className="text-[15px] text-center font-normal mb-[10px]">
//           Experience year-round comfort with our A-rated uPVC windows, designed
//           to keep your <br /> home warm in winter, cool in summer, and stylish
//           every day.
//         </p>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           className=" text-white px-5 h-auto rounded-lg shadow-lg hover:bg-[#012F60] transition-all flex items-center"
//           onClick={() => showModal()}
//         >
//           Add Package
//         </Button>
//       </div> */}
//       <div className="">
//         {packages.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             <p className="text-lg">No packages available.</p>
//             <p>Click the "Add Package" button to create your first package.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
//             {packages.map((pkg) => (
//               <Card
//                 key={pkg.id}
//                 title={null}
//                 bordered={false}
//                 className={getCardStyle(pkg)}
//               >
//                 <div className="flex justify-end mb-2">
//                   <div className="flex gap-2">
//                     <Button
//                       icon={<EditOutlined />}
//                       onClick={
//                         pkg.title !== "Freebie"
//                           ? () => showModal(pkg)
//                           : undefined
//                       }
//                       className={`text-gray-800 border-gray-800 hover:text-primary hover:border-primary ${
//                         pkg.title === "Freebie" ? "invisible" : ""
//                       }`}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex flex-col justify-start items-start mb-4">
//                   <h3 className={getTitleStyle(pkg)}>{pkg.title}</h3>
//                   <div className="mb-2">
//                     <span className={getPriceStyle(pkg)}>
//                       ${pkg.price}
//                       <span className={getDurationStyle(pkg)}>/year</span>
//                     </span>
//                   </div>
//                   <p className={getDescriptionStyle(pkg)}>{pkg.description}</p>
//                 </div>

//                 <div className="rounded-lg">
//                   <List
//                     size="small"
//                     dataSource={pkg.features}
//                     renderItem={(feature, index) => {
//                       let icon = null;
//                       let iconColor = "";
//                       let featureTextColor = "";

//                       if (pkg.popular || pkg.title === "Professional") {
//                         icon = (
//                           <CheckCircleFilled className="text-white mr-2 text-[20px]" />
//                         );
//                         featureTextColor = "text-white";
//                       } else if (pkg.title === "Freebie") {
//                         if (index < 2) {
//                           icon = (
//                             <CheckCircleFilled className="text-[#071952] mr-2 text-[20px]" />
//                           );
//                           featureTextColor = "text-[#071952]";
//                         } else {
//                           icon = (
//                             <CloseCircleFilled className="text-[#B9B9B9] mr-2 text-[20px]" />
//                           );
//                           featureTextColor = "text-gray-400";
//                         }
//                       } else {
//                         icon = (
//                           <CheckCircleFilled className="text-white mr-2 text-[20px]" />
//                         );
//                         featureTextColor = "text-white";
//                       }

//                       return (
//                         <List.Item className="border-none !px-0 !py-2">
//                           <div className="flex items-start">
//                             {icon}
//                             <span
//                               className={`text-[16px] font-thin ${featureTextColor}`}
//                             >
//                               {feature}
//                             </span>
//                           </div>
//                         </List.Item>
//                       );
//                     }}
//                   />
//                 </div>

//                 {/* <Button
//                   className={`w-full mt-12 border ${
//                     pkg.active
//                       ? "border-white bg-primary text-white hover:!bg-white hover:!text-primary py-5 !border-lg"
//                       : "border-primary bg-white text-primary hover:!bg-primary hover:!text-white !hover:border-white py-5 !border-lg"
//                   }`}
//                   onClick={() => togglePackageStatus(pkg)}
//                 >
//                   {pkg.active ? "Turn Off" : "Turn On"}
//                 </Button> */}
//               </Card>
//             ))}
//           </div>
//         )}

//         <Modal
//           title={isEditing ? "Edit Package" : "Add Package"}
//           open={isModalOpen}
//           onCancel={handleCancel}
//           width={800}
//           footer={[
//             <Button key="cancel" onClick={handleCancel}>
//               Cancel
//             </Button>,
//             <Button key="save" type="primary" onClick={() => form.submit()}>
//               {isEditing ? "Update Package" : "Add Package"}
//             </Button>,
//           ]}
//           className="rounded-lg"
//         >
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleSubmit}
//             className="mb-6"
//           >
//             <Row gutter={[30, 20]}>
//               <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   name="title"
//                   label="Package Title"
//                   rules={[{ required: true, message: "Title is required" }]}
//                   className="custom-form-item-ant"
//                 >
//                   <Input
//                     placeholder="e.g. Basic Plan"
//                     className="custom-input-ant-modal"
//                     // disabled
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   name="price"
//                   label="Price"
//                   rules={[{ required: true, message: "Price is required" }]}
//                   className="custom-form-item-ant"
//                 >
//                   <Input
//                     type="number"
//                     prefix="$"
//                     placeholder="29.99"
//                     className="custom-input-ant-modal"
//                   />
//                 </Form.Item>
//               </Col>

//               {/* <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   name="duration"
//                   label="Duration"
//                   rules={[{ required: true, message: "Duration is required" }]}
//                   className="custom-form-item-ant-select"
//                 >
//                   <Select
//                     placeholder="Select duration"
//                     className="custom-select-ant-modal"
//                   >
//                     <Select.Option value="1 month">1 Month</Select.Option>
//                     <Select.Option value="3 months">3 Months</Select.Option>
//                     <Select.Option value="6 months">6 Months</Select.Option>
//                     <Select.Option value="1 year">1 Year</Select.Option>
//                   </Select>
//                 </Form.Item>
//               </Col> */}

//               <Col xs={24}>
//                 <Form.Item
//                   name="description"
//                   label="Description"
//                   rules={[
//                     { required: true, message: "Description is required" },
//                   ]}
//                   className="custom-form-item-ant"
//                 >
//                   <Input.TextArea
//                     rows={4}
//                     placeholder="Short description of what this package offers"
//                     className="custom-input-ant-modal"
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24}>
//                 <Form.Item
//                   name="features"
//                   label="Features"
//                   rules={[
//                     {
//                       required: true,
//                       message: "At least one feature is required",
//                     },
//                   ]}
//                   className="custom-form-item-ant"
//                 >
//                   <FeaturedInput />
//                 </Form.Item>
//               </Col>
//             </Row>
//           </Form>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default PackagesPlans;

// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Button,
//   Modal,
//   Form,
//   Input,
//   List,
//   message,
//   Select,
//   Row,
//   Col,
// } from "antd";
// import {
//   EditOutlined,
//   PlusOutlined,
//   CheckCircleFilled,
// } from "@ant-design/icons";
// import Swal from "sweetalert2";
// import FeaturedInput from "../../components/common/PackageFeatureInput";
// import { CloseCircleFilled } from "@ant-design/icons";
// import {
//   useGetPackagesQuery,
//   useAddPackageMutation,
//   useUpdatePackageMutation,
//   useDeletePackageMutation,
// } from "../../redux/apiSlices/packageSlice";

// const PackagesPlans = () => {
//   // Hardcoded Freebie package
//   const freebiePackage = {
//     id: 1,
//     title: "Freebie",
//     description: "Ideal for individuals.",
//     price: 0,
//     duration: "1 month",
//     features: [
//       "50 of PNG & SVG Uploaded Pictures",
//       "Access to 3 Generation Details",
//       "Upload custom icons and fonts",
//       "Unlimited Sharing",
//       "Upload graphics & video in up to 4k",
//       "Unlimited Projects",
//       "Instant Access to our design system",
//       "Create teams to collaborate on designs",
//     ],
//     popular: false,
//     active: true,
//   };

//   // Local state
//   const [packages, setPackages] = useState([freebiePackage]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentPackage, setCurrentPackage] = useState(null);
//   const [form] = Form.useForm();

//   // RTK Query hooks
//   const { data: apiPackages, isLoading, isError } = useGetPackagesQuery();
//   const [addPackage] = useAddPackageMutation();
//   const [updatePackage] = useUpdatePackageMutation();
//   const [deletePackage] = useDeletePackageMutation();

//   // Merge Freebie + API packages
//   useEffect(() => {
//     if (apiPackages) {
//       setPackages([freebiePackage, ...apiPackages]);
//     }
//   }, [apiPackages]);

//   // Toggle package active status
//   const togglePackageStatus = async (pkg) => {
//     try {
//       const updatedPkg = { ...pkg, status: pkg.active ? "Inactive" : "Active" };
//       await updatePackage({ id: pkg.id, formData: updatedPkg });
//       setPackages((prev) =>
//         prev.map((p) => (p.id === pkg.id ? { ...p, active: !p.active } : p))
//       );
//       message.success("Package status updated");
//     } catch (err) {
//       message.error("Failed to update package status");
//     }
//   };

//   // Show modal for add/edit
//   const showModal = (pkg = null) => {
//     setIsEditing(!!pkg);
//     setCurrentPackage(pkg);
//     setIsModalOpen(true);

//     if (pkg) {
//       form.setFieldsValue({
//         title: pkg.title,
//         description: pkg.description,
//         price: pkg.price,
//         duration: pkg.duration,
//         features: pkg.features || [],
//       });
//     } else {
//       form.resetFields();
//     }
//   };

//   // Close modal
//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setCurrentPackage(null);
//     form.resetFields();
//   };

//   // Delete package
//   const handleDelete = async (pkg) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "Once deleted, you will not be able to recover this package!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#023F86",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await deletePackage(pkg.id);
//           setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
//           Swal.fire({
//             title: "Deleted!",
//             text: "The package has been deleted.",
//             icon: "success",
//             showConfirmButton: false,
//             timer: 1500,
//           });
//         } catch (err) {
//           message.error("Failed to delete package");
//         }
//       }
//     });
//   };

//   // Add/Update package
//   // NOTE: We keep the existing UI, but include API-required fields with safe defaults:
//   // - paymentType: "Yearly"
//   // - credit: 0
//   // - loginLimit: 1
//   // - status: "Active"
//   const handleSubmit = async (values) => {
//     const formattedData = {
//       title: values.title,
//       description: values.description,
//       price: Number(values.price),
//       duration: values.duration || "1 year",
//       features: (values.features || []).filter((f) => f.trim() !== ""),
//       // API-required/existing fields with defaults (not shown in UI)
//       paymentType: currentPackage?.paymentType || "Yearly",
//       credit: currentPackage?.credit ?? 0,
//       loginLimit: currentPackage?.loginLimit ?? 1,
//       status: "Active",
//       active: true,
//     };

//     console.log(formattedData);

//     try {
//       if (isEditing && currentPackage) {
//         await updatePackage({ id: currentPackage.id, formData: formattedData });
//         setPackages((prev) =>
//           prev.map((pkg) =>
//             pkg.id === currentPackage.id ? { ...pkg, ...formattedData } : pkg
//           )
//         );
//         message.success("Package updated successfully");
//       } else {
//         const newPkg = await addPackage(formattedData).unwrap();
//         setPackages((prev) => [...prev, newPkg]);
//         message.success("Package added successfully");
//       }
//       setIsModalOpen(false);
//       setCurrentPackage(null);
//       form.resetFields();
//     } catch (err) {
//       message.error("Failed to save package");
//     }
//   };

//   const getCardStyle = (pkg) => {
//     if (pkg.title === "Freebie") {
//       return "shadow-sm rounded-lg border border-gray-300 bg-[#F9FAFB] hover:shadow-md transition-all transform hover:-translate-y-1";
//     } else {
//       return "shadow-lg rounded-lg bg-primary hover:shadow-xl transition-all transform hover:-translate-y-1";
//     }
//   };

//   const getTitleStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[22px] font-semibold"
//       : "text-white text-[22px] font-semibold";

//   const getPriceStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[56px] font-semibold"
//       : "text-white text-[56px] font-semibold";

//   const getDurationStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[16px] font-regular"
//       : "text-white text-[16px] font-regular";

//   const getDescriptionStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[16px] font-thin"
//       : "text-white text-[16px] font-thin";

//   const getFeatureStyle = (pkg) =>
//     pkg.popular || pkg.title === "Freebie"
//       ? "text-[#071952] text-[16px] font-thin"
//       : "text-white text-[16px] font-thin";

//   if (isLoading)
//     return <p className="text-center py-12">Loading packages...</p>;
//   if (isError)
//     return (
//       <p className="text-center py-12 text-red-500">Failed to load packages</p>
//     );

//   return (
//     <div className="flex flex-col !justify-center !items-center mt-10">
//       <div className="flex flex-col justify-center items-center mb-8">
//         <p className="bg-primary px-[12px] py-[2px] text-white rounded-3xl mb-2">
//           Pricing Plan
//         </p>
//         <h2 className="text-[28px] font-semibold text-secondary">
//           Subscription Prices
//         </h2>
//         <p className="text-[15px] text-center font-normal mb-[10px]">
//           Experience year-round comfort with our A-rated uPVC windows, designed
//           to keep your <br /> home warm in winter, cool in summer, and stylish
//           every day.
//         </p>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           className=" text-white px-5 h-auto rounded-lg shadow-lg hover:bg-[#012F60] transition-all flex items-center"
//           onClick={() => showModal()}
//         >
//           Add Package
//         </Button>
//       </div>
//       <div className="max-w-[1000px]">
//         {packages.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             <p className="text-lg">No packages available.</p>
//             <p>Click the "Add Package" button to create your first package.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
//             {packages.map((pkg) => (
//               <Card
//                 key={pkg.id}
//                 title={null}
//                 bordered={false}
//                 className={getCardStyle(pkg)}
//               >
//                 <div className="flex justify-end mb-2">
//                   <div className="flex gap-2">
//                     <Button
//                       icon={<EditOutlined />}
//                       onClick={
//                         pkg.title !== "Freebie"
//                           ? () => showModal(pkg)
//                           : undefined
//                       }
//                       className={`text-gray-800 border-gray-800 hover:text-primary hover:border-primary ${
//                         pkg.title === "Freebie" ? "invisible" : ""
//                       }`}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex flex-col justify-start items-start mb-4">
//                   <h3 className={getTitleStyle(pkg)}>{pkg.title}</h3>
//                   <div className="mb-2">
//                     <span className={getPriceStyle(pkg)}>
//                       ${pkg.price}
//                       <span className={getDurationStyle(pkg)}>/year</span>
//                     </span>
//                   </div>
//                   <p className={getDescriptionStyle(pkg)}>{pkg.description}</p>
//                 </div>

//                 <div className="p-4 rounded-lg">
//                   <List
//                     size="small"
//                     dataSource={pkg.features}
//                     renderItem={(feature, index) => {
//                       let icon = null;
//                       let featureTextColor = "";

//                       if (pkg.popular || pkg.title === "Professional") {
//                         icon = (
//                           <CheckCircleFilled className="text-white mr-2 text-[20px]" />
//                         );
//                         featureTextColor = "text-white";
//                       } else if (pkg.title === "Freebie") {
//                         if (index < 2) {
//                           icon = (
//                             <CheckCircleFilled className="text-[#071952] mr-2 text-[20px]" />
//                           );
//                           featureTextColor = "text-[#071952]";
//                         } else {
//                           icon = (
//                             <CloseCircleFilled className="text-[#B9B9B9] mr-2 text-[20px]" />
//                           );
//                           featureTextColor = "text-gray-400";
//                         }
//                       } else {
//                         icon = (
//                           <CheckCircleFilled className="text-white mr-2 text-[20px]" />
//                         );
//                         featureTextColor = "text-white";
//                       }

//                       return (
//                         <List.Item className="border-none py-1">
//                           <div className="flex items-start">
//                             {icon}
//                             <span
//                               className={`text-[16px] font-thin ${featureTextColor}`}
//                             >
//                               {feature}
//                             </span>
//                           </div>
//                         </List.Item>
//                       );
//                     }}
//                   />
//                 </div>

//                 {/* Keeping your original design: toggle button block is left commented out */}
//                 {/* <Button
//                   className={`w-full mt-12 border ${
//                     pkg.active
//                       ? "border-white bg-primary text-white hover:!bg-white hover:!text-primary py-5 !border-lg"
//                       : "border-primary bg-white text-primary hover:!bg-primary hover:!text-white !hover:border-white py-5 !border-lg"
//                   }`}
//                   onClick={() => togglePackageStatus(pkg)}
//                 >
//                   {pkg.active ? "Turn Off" : "Turn On"}
//                 </Button> */}
//               </Card>
//             ))}
//           </div>
//         )}

//         <Modal
//           title={isEditing ? "Edit Package" : "Add Package"}
//           open={isModalOpen}
//           onCancel={handleCancel}
//           width={800}
//           footer={[
//             <Button key="cancel" onClick={handleCancel}>
//               Cancel
//             </Button>,
//             <Button key="save" type="primary" onClick={() => form.submit()}>
//               {isEditing ? "Update Package" : "Add Package"}
//             </Button>,
//           ]}
//           className="rounded-lg"
//         >
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleSubmit}
//             className="mb-6"
//           >
//             <Row gutter={[30, 20]}>
//               <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   name="title"
//                   label="Package Title"
//                   rules={[{ required: true, message: "Title is required" }]}
//                   className="custom-form-item-ant"
//                 >
//                   <Input
//                     placeholder="e.g. Basic Plan"
//                     className="custom-input-ant-modal"
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   name="price"
//                   label="Price"
//                   rules={[{ required: true, message: "Price is required" }]}
//                   className="custom-form-item-ant"
//                 >
//                   <Input
//                     type="number"
//                     prefix="$"
//                     placeholder="29.99"
//                     className="custom-input-ant-modal"
//                   />
//                 </Form.Item>
//               </Col>

//               {/* Keeping your original design: duration select stays commented out */}
//               {/* <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   name="duration"
//                   label="Duration"
//                   rules={[{ required: true, message: "Duration is required" }]}
//                   className="custom-form-item-ant-select"
//                 >
//                   <Select
//                     placeholder="Select duration"
//                     className="custom-select-ant-modal"
//                   >
//                     <Select.Option value="1 month">1 Month</Select.Option>
//                     <Select.Option value="3 months">3 Months</Select.Option>
//                     <Select.Option value="6 months">6 Months</Select.Option>
//                     <Select.Option value="1 year">1 Year</Select.Option>
//                   </Select>
//                 </Form.Item>
//               </Col> */}

//               <Col xs={24}>
//                 <Form.Item
//                   name="description"
//                   label="Description"
//                   rules={[
//                     { required: true, message: "Description is required" },
//                   ]}
//                   className="custom-form-item-ant"
//                 >
//                   <Input.TextArea
//                     rows={4}
//                     placeholder="Short description of what this package offers"
//                     className="custom-input-ant-modal"
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24}>
//                 <Form.Item
//                   name="features"
//                   label="Features"
//                   rules={[
//                     {
//                       required: true,
//                       message: "At least one feature is required",
//                     },
//                   ]}
//                   className="custom-form-item-ant"
//                 >
//                   <FeaturedInput />
//                 </Form.Item>
//               </Col>
//             </Row>
//           </Form>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default PackagesPlans;
