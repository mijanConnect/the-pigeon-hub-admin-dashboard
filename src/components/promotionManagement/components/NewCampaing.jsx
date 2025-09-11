import React, { useState } from "react"; // ✅ Change: Added useState
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Upload,
  Select,
} from "antd"; // ✅ Change: Added Select
import { UploadOutlined } from "@ant-design/icons"; // ✅ Change: Added icon

const { RangePicker } = DatePicker;
const { Option } = Select; // ✅ Change: Select option

const NewCampaign = ({ onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [thumbnail, setThumbnail] = useState(""); // ✅ Change: Store uploaded thumbnail

  const handleThumbnailChange = ({ file }) => {
    if (file.status === "done" || file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbnail(e.target.result);
      reader.readAsDataURL(file.originFileObj);
    }
  };

  const handleSubmit = (values) => {
    const [startDate, endDate] = values.dateRange || [];
    onSave({
      promotionName: values.promotionName,
      promotionType: values.promotionType,
      customerReach: values.customerReach,
      customerSegment: values.customerSegment,
      discountPercentage: values.discountPercentage,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : null,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : null,
      thumbnail, // ✅ Change: Include thumbnail in submitted data
    });
    form.resetFields();
    setThumbnail(""); // ✅ Change: Reset thumbnail after submit
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Add New Campaign</h2>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <div className="flex flex-row justify-between gap-4">
          <div className="w-full">
            <Form.Item
              label="Promotion Name"
              name="promotionName"
              rules={[{ required: true }]}
            >
              <Input className="px-3" placeholder="Enter Promotion Name" />
            </Form.Item>

            {/* ✅ Change: Use Select for Promotion Type */}
            <Form.Item
              label="Promotion Type"
              name="promotionType"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select Promotion Type">
                <Option value="Seasonal">Seasonal</Option>
                <Option value="Referral">Referral</Option>
                <Option value="Flash Sale">Flash Sale</Option>
                <Option value="Loyalty">Loyalty</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="w-full">
            <Form.Item
              label="Customer Reach"
              name="customerReach"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                className="px-3"
                placeholder="Enter Customer Reach"
              />
            </Form.Item>
            <Form.Item
              label="Customer Segment"
              name="customerSegment"
              rules={[{ required: true }]}
            >
              <Input
                className="px-3"
                placeholder="Enter Customer Segment"
              />
            </Form.Item>
          </div>

          <div className="w-full">
            <Form.Item
              label="Discount Percentage"
              name="discountPercentage"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                max={100}
                style={{ width: "100%" }}
                className="px-3"
                placeholder="Enter Discount Percentage"
              />
            </Form.Item>
            <Form.Item
              label="Date Range"
              name="dateRange"
              rules={[{ required: true }]}
            >
              <RangePicker style={{ width: "100%" }} className="px-3" />
            </Form.Item>
          </div>
        </div>

        {/* ✅ Change: Add thumbnail upload */}
        <Form.Item label="Thumbnail">
          <Upload
            listType="picture"
            beforeUpload={() => false} // prevent auto upload
            onChange={handleThumbnailChange}
          >
            <Button icon={<UploadOutlined />} className="px-3 py-3">
              Click to Upload
            </Button>
          </Upload>
          {thumbnail && (
            <img
              src={thumbnail}
              alt="Thumbnail Preview"
              className="mt-2 w-32 h-32 object-cover rounded-md"
            />
          )}
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" className="bg-primary">
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewCampaign;
