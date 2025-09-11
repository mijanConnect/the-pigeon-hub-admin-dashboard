import React, { useState, useEffect } from "react";
import {
  Modal,
  Tabs,
  Button,
  Form,
  Input,
  Space,
  List,
  Typography,
  message,
  Card,
  Divider,
  Collapse,
  Empty,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
// Assuming we'll use JoditEditor for rich text editing
// In a real app, you would need to install this via:
// npm install jodit-react
import JoditEditor from "jodit-react";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ProductInfoModal = ({ visible, onCancel, onSave, product }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [description, setDescription] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);
  const [faqForm] = Form.useForm();

  // Editor configuration
  const editorConfig = {
    readonly: false,
    height: 400,
    toolbarButtonSize: "medium",
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "paragraph",
      "fontsize",
      "brush",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "fullsize",
    ],
  };

  useEffect(() => {
    if (visible && product) {
      // Initialize with product data if it exists
      setDescription(product.description || "");
      setFaqs(product.faq || []);
    }
  }, [visible, product]);

  const handleSave = () => {
    const productInfo = {
      id: product.id,
      description: description,
      faq: faqs,
      hasDescription: description && description.trim() !== "",
      hasFaq: faqs && faqs.length > 0,
    };

    onSave(productInfo);
  };

  const handleAddFaq = async () => {
    try {
      const values = await faqForm.validateFields();

      if (editingFaqIndex !== null) {
        // Update existing FAQ
        const updatedFaqs = [...faqs];
        updatedFaqs[editingFaqIndex] = values;
        setFaqs(updatedFaqs);
        message.success("FAQ updated successfully");
      } else {
        // Add new FAQ
        setFaqs([...faqs, values]);
        message.success("FAQ added successfully");
      }

      // Reset form and state
      faqForm.resetFields();
      setEditingFaqIndex(null);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleEditFaq = (index) => {
    setEditingFaqIndex(index);
    faqForm.setFieldsValue(faqs[index]);
  };

  const handleDeleteFaq = (index) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
    message.success("FAQ deleted successfully");

    // Reset editing state if the FAQ was being edited
    if (editingFaqIndex === index) {
      faqForm.resetFields();
      setEditingFaqIndex(null);
    }
  };

  const resetFaqForm = () => {
    faqForm.resetFields();
    setEditingFaqIndex(null);
  };

  return (
    <Modal
      title="Product Information"
      open={visible}
      onCancel={onCancel}
      width={1000}
      height={500} // Set modal height to 500px
      style={{ top: 20 }} // Optional: Adjust the modal's position
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save Changes
        </Button>,
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "description",
            label: "Description",
            children: (
              <div
                style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
              >
                <Card title="Product Description" className="mb-4">
                  <JoditEditor
                    value={description}
                    // config={editorConfig}
                    onChange={(newContent) => setDescription(newContent)}
                  />

                  {/* Preview section */}
                  {description && (
                    <>
                      <Divider>Preview</Divider>
                      <div
                        className="description-preview"
                        style={{
                          padding: "16px",
                          border: "1px solid #d9d9d9",
                          borderRadius: "4px",
                        }}
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    </>
                  )}
                </Card>
              </div>
            ),
          },
          {
            key: "faq",
            label: "FAQs",
            children: (
              <div
                style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
              >
                <Card title="Add/Edit FAQ" className="mb-4">
                  <Form form={faqForm} layout="vertical">
                    <Form.Item
                      name="question"
                      label="Question"
                      rules={[
                        { required: true, message: "Please enter a question" },
                      ]}
                    >
                      <Input placeholder="Enter FAQ question" />
                    </Form.Item>

                    <Form.Item
                      name="answer"
                      label="Answer"
                      rules={[
                        { required: true, message: "Please enter an answer" },
                      ]}
                    >
                      <Input.TextArea rows={4} placeholder="Enter FAQ answer" />
                    </Form.Item>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                      }}
                    >
                      {editingFaqIndex !== null && (
                        <Button onClick={resetFaqForm}>Cancel</Button>
                      )}
                      <Button type="primary" onClick={handleAddFaq}>
                        {editingFaqIndex !== null ? "Update FAQ" : "Add FAQ"}
                      </Button>
                    </div>
                  </Form>
                </Card>

                <Card title="FAQ List">
                  {faqs.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={faqs}
                      renderItem={(faq, index) => (
                        <List.Item key={index}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            {/* <Text strong>{faq.question}</Text> */}
                            <div style={{ display: "flex" }}>
                              <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEditFaq(index)}
                                type="text"
                                style={{ float: "right" }} // Ensure right-side positioning
                              >
                                Edit
                              </Button>
                              <Popconfirm
                                title="Are you sure to delete this FAQ?"
                                onConfirm={() => handleDeleteFaq(index)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button
                                  icon={<DeleteOutlined />}
                                  type="text"
                                  danger
                                  style={{ float: "right" }} // Ensure right-side positioning
                                >
                                  Delete
                                </Button>
                              </Popconfirm>
                            </div>
                          </div>
                          <Collapse>
                            <Panel
                              header={<Text strong>{faq.question}</Text>}
                              key={index}
                            >
                              {faq.answer}
                            </Panel>
                          </Collapse>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No FAQs added yet" />
                  )}
                </Card>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ProductInfoModal;
