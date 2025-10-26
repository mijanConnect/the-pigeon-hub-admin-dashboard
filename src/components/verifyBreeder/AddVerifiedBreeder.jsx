import { Button, Checkbox, Col, Form, Input, Modal, Row, Select } from "antd";
import { getNames } from "country-list";
import { useEffect } from "react";

const { Option } = Select;

const AddVerifyBreeder = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();

  const countries = getNames();
  // Set form values when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        status: !!initialValues.status, // force boolean for checkbox
      });
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
        <Button
          key="cancel"
          onClick={onCancel}
          className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
        >
          Cancel
        </Button>,
        <Button
          key="save"
          className="bg-primary border border-primary text-white"
          onClick={handleSave}
        >
          {initialValues ? "Save Changes" : "Add Verified Breeder"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mb-6">
        <Row gutter={[30, 20]}>
          {/* Loft Name */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Loft Name"
              name="loftName"
              rules={[{ required: true, message: "Please enter Loft Name" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Loft Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Breeder Name */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Breeder Name"
              name="breederName"
              rules={[{ required: true, message: "Please enter Breeder Name" }]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Breeder Name"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Pigeon Score */}
          {/* <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Pigeon Score"
              name="pigeonScore"
              rules={[
                { required: true, message: "Please select pigeon score" },
              ]}
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Pigeon Score"
                className="custom-select-ant-modal"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <Select.Option key={i + 1} value={(i + 1) * 10}>
                    {(i + 1) * 10}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}

          {/* Country */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Country"
              name="country"
              className="custom-form-item-ant-select"
            >
              <Select
                placeholder="Select Country"
                className="custom-select-ant-modal"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {countries.map((country, index) => (
                  <Option key={index} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Email */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "Please enter a valid Email",
                },
              ]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Email"
                className="custom-input-ant-modal"
              />
            </Form.Item>
          </Col>

          {/* Phone Number */}
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const digits = String(value).replace(/\D/g, "").length;
                    // Allow 7 to 15 digits (E.164 max is 15)
                    return digits >= 7 && digits <= 15
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Please enter a valid Phone Number")
                        );
                  },
                },
              ]}
              className="custom-form-item-ant"
            >
              <Input
                placeholder="Enter Phone Number"
                className="custom-input-ant-modal"
                inputMode="tel"
                maxLength={20}
              />
            </Form.Item>
          </Col>

          {/* Gender */}
          {/* <Col xs={24} sm={12} md={12}>
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
          </Col> */}

          {/* Experience Level */}
          {/* <Col xs={24} sm={12} md={12}>
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
          </Col> */}

          {/* Verified Breeder (Lock Data) */}
          <Col xs={24} sm={12} md={12}>
            {/* <Form.Item
              name="status"
              valuePropName="checked"
              className="custom-form-item-ant"
            >
              <Checkbox>
                <span className="font-semibold text-[16px]">
                  Verified Breeder (Lock Data)
                </span>
              </Checkbox>
            </Form.Item>
            <p className="text-gray-400 text-sm ml-6">
              Check this box to verify the breeder and lock all data from
              editing.
            </p> */}
          </Col>
        </Row>

        <div className="mt-6">
          <Form.Item
            name="status"
            valuePropName="checked"
            className="custom-form-item-ant"
          >
            <Checkbox>
              <span className="font-semibold text-[16px]">
                Verify Breeder (Lock Data)
              </span>
            </Checkbox>
          </Form.Item>
          <p className="text-gray-400 text-sm ml-6">
            Check this box to verify the breeder and lock all data from editing.
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default AddVerifyBreeder;
