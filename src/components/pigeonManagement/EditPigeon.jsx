// src/components/pigeon/EditPigeon.jsx
import React from "react";
import { Modal, Form, Row, Col, Input, Select, Button } from "antd";

const { Option } = Select;

const EditPigeon = ({ visible, pigeon, onCancel, onSave }) => {
  if (!pigeon) return null;

  return (
    <Modal
      title="View & Update Pigeon"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <Form
        layout="vertical"
        initialValues={{
          ...pigeon,
          country: pigeon.country || "",
          gender: pigeon.gender,
          status: pigeon.status,
          iconic: pigeon.iconic,
          iconicScore: pigeon.iconicScore,
          father: pigeon.father,
          mother: pigeon.mother,
          color: pigeon.color,
          pigeonId: pigeon.pigeonId,
          ringNumber: pigeon.ringNumber,
          name: pigeon.name,
          verified: pigeon.verified ? "Yes" : "No",
          birthYear: pigeon.birthYear,
        }}
        onFinish={onSave}
        className="mb-6"
      >
        <Row gutter={[30, 20]}>
          {/* Name */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter name" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Pigeon ID */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Pigeon ID"
              name="pigeonId"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Pigeon ID"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Ring Number */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Ring Number"
              name="ringNumber"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Ring Number"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Birth Year */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Birth Year"
              name="birthYear"
              className="custom-form-item-ant"
            >
              <Input
                type="number"
                placeholder="Enter Birth Year"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Father */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Father"
              name="father"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Father's Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Mother */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mother"
              name="mother"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Mother's Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Gender */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Gender"
              name="gender"
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

          {/* Status */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Status"
              name="status"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Status"
                className="custom-select-ant-modal"
              >
                <Option value="breeding">Breeding</Option>
                <Option value="racing">Racing</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Country */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Country"
              name="country"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Country"
                className="custom-select-ant-modal"
              >
                <Option value="USA">USA</Option>
                <Option value="UK">UK</Option>
                <Option value="Canada">Canada</Option>
                <Option value="Bangladesh">Bangladesh</Option>
                <Option value="Germany">Germany</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Verified */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Verified"
              name="verified"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Verified Status"
                className="custom-select-ant-modal"
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Iconic */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Iconic"
              name="iconic"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Iconic Level"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Iconic Score */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Iconic Score"
              name="iconicScore"
              className="custom-form-item-ant"
            >
              <Input
                type="number"
                placeholder="Enter Iconic Score"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Color */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Color"
              name="color"
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Color"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer Buttons */}
        <div className="flex justify-end mt-4">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditPigeon;
