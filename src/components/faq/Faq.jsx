import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Collapse,
  message,
  Popconfirm,
  Tooltip,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";

const { Panel } = Collapse;

const FAQSection = () => {
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "What is React?",
      answer: "React is a JavaScript library for building user interfaces.",
    },
    {
      id: 2,
      question: "What is a component?",
      answer:
        "A component is a building block of React applications.React is a JavaScript library for building user interfaces.React is a JavaScript library for building user interfaces A component is a building block of React applications.React is a JavaScript library for building user interfaces.React is a JavaScript library for building user interfaces",
    },
    {
      id: 3,
      question: "What is JSX?",
      answer:
        "JSX is a syntax extension for JavaScript that looks similar to HTML.",
    },
  ]);
  const [visible, setVisible] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [form] = Form.useForm();

  // Open modal to add a new FAQ
  const handleAddFAQ = () => {
    setEditingFAQ(null);
    form.resetFields();
    setVisible(true);
  };

  // Open modal to edit an existing FAQ
  const handleEditFAQ = (faq, event) => {
    event.stopPropagation();
    setEditingFAQ(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
    });
    setVisible(true);
  };

  // Handle deleting a FAQ
  const handleDeleteFAQ = (id, event) => {
    event.stopPropagation();
    setFaqs(faqs.filter((faq) => faq.id !== id));
    message.success("FAQ deleted successfully");
  };

  // Handle form submission for adding or editing a FAQ
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingFAQ) {
        // Edit FAQ
        setFaqs(
          faqs.map((faq) =>
            faq.id === editingFAQ.id
              ? { ...faq, question: values.question, answer: values.answer }
              : faq
          )
        );
        message.success("FAQ updated successfully");
      } else {
        // Add new FAQ
        const newFAQ = {
          id: Date.now(), // Unique ID using timestamp
          question: values.question,
          answer: values.answer,
        };
        setFaqs([...faqs, newFAQ]);
        message.success("FAQ added successfully");
      }
      setVisible(false); // Close modal after submit
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const panelExtra = (faq) => (
    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
      <Tooltip title="Edit FAQ">
        <Button
          icon={<EditOutlined />}
          size="small"
          className="bg-primary px-3 text-white py-[18px] flex items-center hover:bg-red-600"
          onClick={(e) => handleEditFAQ(faq, e)}
        >
          Edit
        </Button>
      </Tooltip>
      <Tooltip title="Delete FAQ">
        <Popconfirm
          title="Are you sure you want to delete this FAQ?"
          onConfirm={(e) => handleDeleteFAQ(faq.id, e)}
          okText="Yes"
          cancelText="No"
          placement="left"
        >
          <Button
            icon={<DeleteOutlined className="text-2xl" />}
            // size="small"
            className="bg-red-500 text-white py-[18px] flex items-center hover:bg-red-600"
          >
            Delete
          </Button>
        </Popconfirm>
      </Tooltip>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500">Find answers to common questions</p>
        </div>
        <GradientButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddFAQ}
          className="flex items-center"
        >
          Add FAQ
        </GradientButton>
      </div>

      {/* FAQ Accordion */}
      {faqs.length > 0 ? (
        <Collapse
          bordered={false}
          className="bg-gray-50 rounded-lg"
          expandIcon={({ isActive }) => (
            <DownOutlined
              rotate={isActive ? 180 : 0}
              className="text-blue-500"
            />
          )}
        >
          {faqs.map((faq) => (
            <Panel
              key={faq.id}
              header={
                <div className="flex items-center">
                  <QuestionCircleOutlined className="text-blue-500 mr-2" />
                  <span className="font-medium">{faq.question}</span>
                </div>
              }
              extra={panelExtra(faq)}
              className="mb-3 border border-gray-200 rounded-md overflow-hidden"
            >
              <div className="p-2 bg-white rounded-md">{faq.answer}</div>
            </Panel>
          ))}
        </Collapse>
      ) : (
        <Empty description="No FAQs added yet" className="my-10" />
      )}

      {/* Add/Edit FAQ Modal */}
      <Modal
        title={
          <div className="flex items-center">
            {editingFAQ ? (
              <EditOutlined className="mr-2 text-blue-500" />
            ) : (
              <PlusOutlined className="mr-2 text-green-500" />
            )}
            <span>{editingFAQ ? "Edit FAQ" : "Add New FAQ"}</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <GradientButton key="submit" onClick={handleSubmit}>
            {editingFAQ ? "Update" : "Add FAQ"}
          </GradientButton>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="faqForm"
          initialValues={{
            question: "",
            answer: "",
          }}
          className="mt-4"
        >
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <Input placeholder="Enter question" className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Answer"
            rules={[{ required: true, message: "Please enter the answer" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter answer"
              className="rounded-md"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FAQSection;
