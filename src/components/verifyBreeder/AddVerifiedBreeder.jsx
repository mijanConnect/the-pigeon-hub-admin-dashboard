import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Row, Col, Button, Checkbox } from "antd";

const { Option } = Select;

const AddVerifyBreeder = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();

  // Set form values when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

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
      title={initialValues ? "Edit Verified Breeder" : "Add Verified Breeder"}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {initialValues ? "Save Changes" : "Add Verified Breeder"}
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

          {/* Loft Name */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Loft Name"
              name="loftName"
              rules={[{ required: true, message: "Please enter loft name" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Loft Name"
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
                <Option value="USA">USA</Option>
                <Option value="UK">UK</Option>
                <Option value="Canada">Canada</Option>
                <Option value="Germany">Germany</Option>
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
                <Option value="Hen">Hen</Option>
                <Option value="Cock">Cock</Option>
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
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Expert">Expert</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Verified Breeder (Lock Data) */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              name="status"
              valuePropName="checked"
              className="custom-form-item-ant"
            >
              <Checkbox className="custom-checkbox-ant-modal">
                Verified Breeder (Lock Data)
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddVerifyBreeder;
