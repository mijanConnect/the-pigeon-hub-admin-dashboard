import React, { useState } from "react";
import { Modal, Form, Input, Button, Flex, message } from "antd";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { PiMapPinAreaLight } from "react-icons/pi";
import { CiMail } from "react-icons/ci";
import GradientButton from "../../components/common/GradiantButton";

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: "(+62) 8896-2220 | (021) 111 444 90",
    email: "demo@gmail.com",
    location: "Jl. Merdeka Raya No.73B, Kuta, Badung, Bali",
  });
  const [form] = Form.useForm();

  const showModal = () => {
    form.setFieldsValue(contactInfo);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = (values) => {
    setContactInfo(values);
    setIsModalOpen(false);
    message.success("Contact information updated successfully!");
  };

  const contactFields = [
    { key: "phone", label: "Phone Number", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "location", label: "Location", type: "text" },
  ];

  return (
    <div className="p-6 rounded-lg bg-gradient-to-r from-primary to-secondary">
      <h1 className="text-3xl font-bold text-white mb-10 text-center">
        Contact
      </h1>
      <Flex vertical justify="center" gap={30} className="w-full">
        <div className="flex items-center justify-normal bg-white p-12 w-4/5 mx-auto gap-4 rounded-xl">
          {[
            {
              icon: <LiaPhoneVolumeSolid size={50} />,
              title: "Phone",
              details: contactInfo.phone,
            },
            {
              icon: <CiMail size={50} />,
              title: "Email",
              details: contactInfo.email,
            },
            {
              icon: <PiMapPinAreaLight size={50} />,
              title: "Location",
              details: contactInfo.location,
            },
          ].map((item, index) => (
            <Flex
              vertical
              key={index}
              gap={20}
              align="center"
              className="flex-auto"
            >
              <div className="bg-white rounded-xl shadow-[0px_0px_15px_4px_rgba(0,_0,_0,_0.1)] p-4 hover:bg-smart text-smart hover:text-black">
                {item.icon}
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-gray-600">{item.details}</p>
              </div>
            </Flex>
          ))}
        </div>
        <button
          onClick={showModal}
          className="w-3/6 h-12 mx-auto rounded-lg text-white border bg-primary border-1 border-smart text-smart font-bold tracking-wider hover:bg-secondary hover:text-white hover:transition-all duration-500"
        >
          Edit Info
        </button>
      </Flex>

      {/* Edit Contact Modal */}
      <Modal
        title="Edit Contact"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <div className="py-5">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            initialValues={contactInfo}
          >
            {contactFields.map((field, i) => (
              <Form.Item
                key={i}
                label={field.label}
                name={field.key}
                rules={[
                  {
                    required: true,
                    message: `Please enter the ${field.label.toLowerCase()}`,
                  },
                  field.key === "email" && {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message:
                      "Please enter a valid email address (e.g. test@example.com)",
                  },
                ].filter(Boolean)}
              >
                <Input
                  type={field.type}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  className="h-12 rounded-xl"
                />
              </Form.Item>
            ))}

            <div className="flex justify-end gap-4">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Contact;
