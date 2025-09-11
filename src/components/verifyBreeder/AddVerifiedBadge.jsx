import React from "react";
import { Modal, Form, Input, Select, Row, Col, Button } from "antd";

const { Option } = Select;

const AddVerifiedBadge = ({ visible, onCancel, onSave }) => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(values);
        form.resetFields();
      })
      .catch((info) => console.log("Validate Failed:", info));
  };

  return (
    <Modal
      title="Add Verified Breeder"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Add Verified Breeder
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mb-6">
        <Row gutter={[30, 20]}>
          {/* Breeder Name */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Breeder Name"
              name="breederName"
              rules={[{ required: true, message: "Please enter breeder name" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Breeder Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Pigeon Score */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Pigeon Score"
              name="pigeonScore"
              rules={[{ required: true, message: "Please enter pigeon score" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Pigeon Score"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Country */}
          <Col xs={24} sm={12} md={12}>
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
                <Option value="usa">USA</Option>
                <Option value="uk">UK</Option>
                <Option value="canada">Canada</Option>
                <Option value="germany">Germany</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Email */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="E-mail"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Enter a valid email" },
              ]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter E-mail"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Phone Number */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[{ required: true, message: "Please enter phone number" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Phone Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Gender */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select gender" }]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Gender"
                className="custom-select-ant-modal"
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Experience Level */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Experience Level"
              name="experienceLevel"
              rules={[
                { required: true, message: "Please select experience level" },
              ]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Experience Level"
                className="custom-select-ant-modal"
              >
                <Option value="beginner">Beginner</Option>
                <Option value="intermediate">Intermediate</Option>
                <Option value="expert">Expert</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Status */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Status"
                className="custom-select-ant-modal"
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddVerifiedBadge;
