import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Upload,
  message,
  Menu,
  Dropdown,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import VerifyIcon from "../../../src/assets/verify.png";
import { useAddPigeonMutation } from "../../redux/apiSlices/mypigeonSlice";

const { Option } = Select;

const colorPatternMap = {
  Blue: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Black: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  White: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Ash_Red: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Brown: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Grizzle: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
  Mealy: ["Barless", "Bar", "Check", "T-Check", "White Flight"],
};

const AddNewPigeon = ({ visible, onCancel, onSave, pigeonData }) => {
  const [form] = Form.useForm();
  const [selected, setSelected] = useState({ color: null, pattern: null });
  const [addPigeon] = useAddPigeonMutation();

  useEffect(() => {
    if (pigeonData) {
      // Fill form with existing data
      form.setFieldsValue({
        ...pigeonData,
        colorPattern: {
          color: pigeonData.color || null,
          pattern: pigeonData.pattern || null,
        },
        photos: pigeonData.image
          ? [{ url: pigeonData.image, thumbUrl: pigeonData.image }]
          : [],
      });
      setSelected({ color: pigeonData.color, pattern: pigeonData.pattern });
    } else {
      form.resetFields();
      setSelected({ color: null, pattern: null });
    }
  }, [pigeonData, form]);

  const handleClick = (color, pattern) => {
    setSelected({ color, pattern });
    form.setFieldsValue({ colorPattern: { color, pattern } });
  };

  const menu = (
    <Menu>
      {Object.entries(colorPatternMap).map(([color, patterns]) => (
        <Menu.SubMenu key={color} title={color}>
          {patterns.map((pattern) => (
            <Menu.Item
              key={`${color}-${pattern}`}
              onClick={() => handleClick(color, pattern)}
            >
              {pattern}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ))}
    </Menu>
  );

  // const handleSave = () => {
  //   form
  //     .validateFields()
  //     .then((values) => {
  //       const photos = values.photos || [];
  //       const image =
  //         photos.length > 0 ? photos[0].thumbUrl || photos[0].url : null;

  //       const formattedValues = {
  //         image,
  //         name: values.name || "-",
  //         country: { name: values.country || "-", icon: null },
  //         breeder: values.breeder || "-",
  //         ringNumber: values.ringNumber || "-",
  //         birthYear: values.birthYear || "-",
  //         father: values.fatherRingNumber || "-",
  //         mother: values.motherRingNumber || "-",
  //         gender: values.gender || "-",
  //         color: values.colorPattern?.color || "-",
  //         pattern: values.colorPattern?.pattern || "-",
  //         status: values.status || "Inactive",
  //         verified: values.verification === "verified" ? "Yes" : "No",
  //         icon: values.verification === "verified" ? VerifyIcon : "-",
  //         additionalNotes: values.additionalNotes || "-",
  //       };

  //       onSave(formattedValues);
  //       form.resetFields();
  //     })
  //     .catch((info) => console.log("Validate Failed:", info));
  // };
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Grab first image
      const fileList = values.photos || [];
      const imageFile = fileList[0]?.originFileObj;

      const dataToSend = {
        ringNumber: values.ringNumber,
        name: values.name,
        racherRating: values.racerRating || 0,
        country: values.country,
        birthYear: values.birthYear,
        shortInfo: values.shortInfo || "",
        breeder: values.breeder,
        color: values.colorPattern?.color,
        pattern: values.colorPattern?.pattern,
        racingRating: values.racingRating,
        breederRating: values.breederRating,
        gender: values.gender,
        status: values.status,
        location: values.location,
        notes: values.notes || "",
        results: values.results || "",
        verified: values.verification === "verified",
        iconic: values.iconic === "yes",
        iconicScore: values.iconicScore || 0,
      };

      // Replace YOUR_TOKEN with actual token or get from store
      const token = localStorage.getItem("token");

      await addPigeon({ data: dataToSend, imageFile, token }).unwrap();
      message.success("Pigeon saved successfully!");
      form.resetFields();
      onCancel();
    } catch (err) {
      console.error(err);
      message.error(
        "Failed to save pigeon. " + (err?.data?.message || err.message)
      );
    }
  };

  return (
    <Modal
      title={pigeonData ? "Edit Pigeon" : "Add New Pigeon"}
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {pigeonData ? "Update Pigeon" : "Add New Pigeon"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mb-6">
        <Row gutter={[30, 20]}>
          {/* Ring Number */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Ring Number"
              name="ringNumber"
              rules={[{ required: true }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Name */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Country */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Please select country" }]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Country"
                className="custom-select-ant-modal"
              >
                <Option value="USA">USA</Option>
                <Option value="UK">UK</Option>
                <Option value="Canada">Canada</Option>
                <Option value="Germany">Germany</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Birth Year */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Birth Year"
              name="birthYear"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Birth Year"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Story */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Your Story"
              name="story"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Story"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Color */}
          {/* <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Color"
              name="color"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Color"
                className="custom-select-ant-modal"
              >
                <Option value="Red">Red</Option>
                <Option value="Blue">Blue</Option>
                <Option value="Green">Green</Option>
                <Option value="Yellow">Yellow</Option>
              </Select>
            </Form.Item>
          </Col> */}

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Color & Pattern"
              name="colorPattern"
              className="custom-form-item-ant-select"
            >
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button
                  className="custom-select-ant-modal flex items-center justify-start"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    color: selected.color && selected.pattern ? "#000" : "#999", // placeholder color
                  }}
                >
                  {selected.color && selected.pattern
                    ? `${selected.color} - ${selected.pattern}`
                    : "Select Color & Pattern"}
                </Button>
              </Dropdown>
            </Form.Item>
          </Col>

          {/* Pattern */}
          {/* <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Pattern"
              name="pattern"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Pattern"
                className="custom-select-ant-modal"
              >
                <Option value="solid">Solid</Option>
                <Option value="spotted">Spotted</Option>
              </Select>
            </Form.Item>
          </Col> */}

          {/* Gender */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Gender"
              name="gender"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Gender"
                className="custom-select-ant-modal"
              >
                <Option value="Cock">Cock</Option>
                <Option value="Hen">Hen</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Breeder */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Breeder"
              name="breeder"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Breeder"
                className="custom-select-ant-modal"
              >
                <Option value="Breeder A">Breeder A</Option>
                <Option value="Breeder B">Breeder B</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Breeder Rating */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Breeder Rating"
              name="breederRating"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Rating"
                className="custom-select-ant-modal"
              >
                <Option value="10">10</Option>
                <Option value="20">20</Option>
                <Option value="30">30</Option>
                <Option value="40">40</Option>
                <Option value="50">50</Option>
                {/* <Option value="Outstanding">Outstanding</Option>
                <Option value="Excellent">Excellent</Option>
                <Option value="Very good">Very good</Option>
                <Option value="Good">Good</Option>
                <Option value="Above Average">Above Average</Option> */}
              </Select>
            </Form.Item>
          </Col>

          {/* Status */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Status"
              name="status"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Status"
                className="custom-select-ant-modal"
              >
                <Option value="racing">Racing</Option>
                <Option value="breeding">Breeding</Option>
                <Option value="lost">Lost</Option>
                <Option value="sold">Sold</Option>
                <Option value="retired">Retired</Option>
                <Option value="deceased">Deceased</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Location */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Location"
              name="location"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Location"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Racing Rating */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Racing Rating"
              name="racingRating"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Rating"
                className="custom-select-ant-modal"
              >
                {/* <Option value="10">10</Option>
                <Option value="20">20</Option>
                <Option value="30">30</Option>
                <Option value="40">40</Option>
                <Option value="50">50</Option>
                <Option value="60">60</Option>
                <Option value="70">70</Option>
                <Option value="80">80</Option>
                <Option value="90">90</Option>
                <Option value="100">100</Option> */}
                <Option value="Outstanding">Outstanding</Option>
                <Option value="Excellent">Excellent</Option>
                <Option value="Very good">Very good</Option>
                <Option value="Good">Good</Option>
                <Option value="Above Average">Above Average</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Verification */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Verification"
              name="verification"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Verification"
                className="custom-select-ant-modal"
              >
                <Option value="verified">Verified</Option>
                <Option value="notverified">Not Verified</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Iconic */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Iconic"
              name="iconic"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Iconic"
                className="custom-select-ant-modal"
              >
                <Option value="yes">Yes</Option>
                <Option value="no">No</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Iconic Score */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Iconic Score"
              name="iconicScore"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Iconic Score"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Father */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Father Ring Number"
              name="fatherRingNumber"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Father Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Mother */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Mother Ring Number"
              name="motherRingNumber"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Mother Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Upload Photos */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Pigeon Photos"
              name="photos"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
            >
              <Upload
                name="files"
                listType="picture-card"
                multiple
                className="border rounded-lg p-3 border-[#071952]"
                maxCount={5}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
                beforeUpload={(file) => {
                  const isJpgOrPng =
                    file.type === "image/jpeg" || file.type === "image/png";
                  if (!isJpgOrPng) {
                    message.error("You can only upload JPG/PNG files!");
                  }
                  return false; // ✅ Prevent auto upload, just store locally
                }}
                accept=".jpg,.jpeg,.png"
              >
                <div
                  style={{
                    width: 150,
                    height: 150,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>

          {/* Notes */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item label="Pigeon Result" name="additionalNotes">
              <Input.TextArea
                placeholder="Enter any additional notes"
                autoSize={{ minRows: 5, maxRows: 8 }}
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddNewPigeon;

// import React, { useState } from "react";
// import {
//   Modal,
//   Form,
//   Input,
//   Select,
//   Row,
//   Col,
//   Button,
//   Upload,
//   message,
//   Menu,
//   Dropdown,
// } from "antd";
// import { PlusOutlined } from "@ant-design/icons";
// import VerifyIcon from "../../../src/assets/verify.png";

// const { Option } = Select;

// const colorPatternMap = {
//   Red: ["Solid", "Spotted", "Striped"],
//   Blue: ["Solid", "Spotted"],
//   Green: ["Solid", "Spotted", "Checkered"],
//   Yellow: ["Solid", "Spotted"],
// };

// const AddNewPigeon = ({ visible, onCancel, onSave }) => {
//   const [form] = Form.useForm();

//   const [selected, setSelected] = useState({ color: null, pattern: null });

//   const handleClick = (color, pattern) => {
//     setSelected({ color, pattern });
//     // Update form value
//     form.setFieldsValue({ colorPattern: { color, pattern } });
//   };

//   const menu = (
//     <Menu>
//       {Object.entries(colorPatternMap).map(([color, patterns]) => (
//         <Menu.SubMenu key={color} title={color}>
//           {patterns.map((pattern) => (
//             <Menu.Item
//               key={`${color}-${pattern}`}
//               onClick={() => handleClick(color, pattern)}
//             >
//               {pattern}
//             </Menu.Item>
//           ))}
//         </Menu.SubMenu>
//       ))}
//     </Menu>
//   );

//   const handleSave = () => {
//     form
//       .validateFields()
//       .then((values) => {
//         const photos = values.photos || [];
//         const image =
//           photos.length > 0 ? photos[0].thumbUrl || photos[0].url : null;

//         const formattedValues = {
//           image, // ✅ pass image to table
//           name: values.name || "-",
//           country: { name: values.country, icon: null },
//           breeder: values.breeder || "-",
//           ringNumber: values.ringNumber || "-",
//           birthYear: values.birthYear || "-",
//           father: values.fatherRingNumber || "-",
//           mother: values.motherRingNumber || "-",
//           gender: values.gender || "-",
//           color: values.color || "-",
//           status: values.status || "Inactive",
//           verified: values.verification === "verified" ? "Yes" : "No",
//           icon: values.verification === "verified" ? VerifyIcon : "-", // show icon only if verified
//           additionalNotes: values.additionalNotes || "-",
//         };

//         onSave(formattedValues);
//         form.resetFields();
//       })
//       .catch((info) => console.log("Validate Failed:", info));
//   };

//   return (
//     <Modal
//       title="Add New Pigeon"
//       open={visible}
//       onCancel={onCancel}
//       width={1200}
//       footer={[
//         <Button key="cancel" onClick={onCancel}>
//           Cancel
//         </Button>,
//         <Button key="save" type="primary" onClick={handleSave}>
//           Add New Pigeon
//         </Button>,
//       ]}
//     >
//       <Form form={form} layout="vertical" className="mb-6">
//         <Row gutter={[30, 20]}>
//           {/* Ring Number */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Ring Number"
//               name="ringNumber"
//               rules={[{ required: true }]}
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Ring Number"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Name */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Name"
//               name="name"
//               rules={[{ required: true }]}
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Name"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Country */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Country"
//               name="country"
//               rules={[{ required: true, message: "Please select country" }]}
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Country"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="USA">USA</Option>
//                 <Option value="UK">UK</Option>
//                 <Option value="Canada">Canada</Option>
//                 <Option value="Germany">Germany</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Birth Year */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Birth Year"
//               name="birthYear"
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Birth Year"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Story */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Your Story"
//               name="story"
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Story"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Color */}
//           {/* <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Color"
//               name="color"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Color"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="Red">Red</Option>
//                 <Option value="Blue">Blue</Option>
//                 <Option value="Green">Green</Option>
//                 <Option value="Yellow">Yellow</Option>
//               </Select>
//             </Form.Item>
//           </Col> */}

//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Color & Pattern"
//               name="colorPattern"
//               className="custom-form-item-ant-select"
//             >
//               <Dropdown overlay={menu} trigger={["click"]}>
//                 <Button
//                   className="custom-select-ant-modal flex items-center justify-start"
//                   style={{
//                     width: "100%",
//                     textAlign: "left",
//                     color: selected.color && selected.pattern ? "#000" : "#999", // placeholder color
//                   }}
//                 >
//                   {selected.color && selected.pattern
//                     ? `${selected.color} - ${selected.pattern}`
//                     : "Select Color & Pattern"}
//                 </Button>
//               </Dropdown>
//             </Form.Item>
//           </Col>

//           {/* Pattern */}
//           {/* <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Pattern"
//               name="pattern"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Pattern"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="solid">Solid</Option>
//                 <Option value="spotted">Spotted</Option>
//               </Select>
//             </Form.Item>
//           </Col> */}

//           {/* Gender */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Gender"
//               name="gender"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Gender"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="Male">Male</Option>
//                 <Option value="Female">Female</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Breeder */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Breeder"
//               name="breeder"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Breeder"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="Breeder A">Breeder A</Option>
//                 <Option value="Breeder B">Breeder B</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Breeder Rating */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Breeder Rating"
//               name="breederRating"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Rating"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="1">1</Option>
//                 <Option value="2">2</Option>
//                 <Option value="3">3</Option>
//                 <Option value="4">4</Option>
//                 <Option value="5">5</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Status */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Status"
//               name="status"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Status"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="racing">Racing</Option>
//                 <Option value="breeding">Breeding</Option>
//                 <Option value="lost">Lost</Option>
//                 <Option value="sold">Sold</Option>
//                 <Option value="retired">Retired</Option>
//                 <Option value="deceased">Deceased</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Location */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Location"
//               name="location"
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Location"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Racing Rating */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Racing Rating"
//               name="racingRating"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Rating"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="10">10</Option>
//                 <Option value="20">20</Option>
//                 <Option value="30">30</Option>
//                 <Option value="40">40</Option>
//                 <Option value="50">50</Option>
//                 <Option value="60">60</Option>
//                 <Option value="70">70</Option>
//                 <Option value="80">80</Option>
//                 <Option value="90">90</Option>
//                 <Option value="100">100</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Verification */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Verification"
//               name="verification"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Verification"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="verified">Verified</Option>
//                 <Option value="notverified">Not Verified</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Iconic */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Iconic"
//               name="iconic"
//               className="custom-form-item-ant-select"
//             >
//               <Select
//                 placeholder="Select Iconic"
//                 className="custom-select-ant-modal"
//               >
//                 <Option value="yes">Yes</Option>
//                 <Option value="no">No</Option>
//               </Select>
//             </Form.Item>
//           </Col>

//           {/* Iconic Score */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Iconic Score"
//               name="iconicScore"
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Iconic Score"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Father */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Father Ring Number"
//               name="fatherRingNumber"
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Father Ring Number"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Mother */}
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item
//               label="Mother Ring Number"
//               name="motherRingNumber"
//               className="custom-form-item-ant"
//             >
//               <Input
//                 placeholder="Enter Mother Ring Number"
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>

//           {/* Upload Photos */}
//           <Col xs={24} sm={12} md={12}>
//             <Form.Item
//               label="Pigeon Photos"
//               name="photos"
//               valuePropName="fileList"
//               getValueFromEvent={(e) =>
//                 Array.isArray(e) ? e : e && e.fileList
//               }
//             >
//               <Upload
//                 name="files"
//                 listType="picture-card"
//                 multiple
//                 className="border rounded-lg p-3 border-[#071952]"
//                 maxCount={5}
//                 showUploadList={{
//                   showPreviewIcon: true,
//                   showRemoveIcon: true,
//                 }}
//                 beforeUpload={(file) => {
//                   const isJpgOrPng =
//                     file.type === "image/jpeg" || file.type === "image/png";
//                   if (!isJpgOrPng) {
//                     message.error("You can only upload JPG/PNG files!");
//                   }
//                   return false; // ✅ Prevent auto upload, just store locally
//                 }}
//                 accept=".jpg,.jpeg,.png"
//               >
//                 <div
//                   style={{
//                     width: 150,
//                     height: 150,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <PlusOutlined />
//                   <div style={{ marginTop: 8 }}>Upload</div>
//                 </div>
//               </Upload>
//             </Form.Item>
//           </Col>

//           {/* Notes */}
//           <Col xs={24} sm={12} md={12}>
//             <Form.Item label="Pigeon Result" name="additionalNotes">
//               <Input.TextArea
//                 placeholder="Enter any additional notes"
//                 autoSize={{ minRows: 5, maxRows: 8 }}
//                 className="custom-input-ant-modal"
//               />
//             </Form.Item>
//           </Col>
//         </Row>
//       </Form>
//     </Modal>
//   );
// };

// export default AddNewPigeon;
