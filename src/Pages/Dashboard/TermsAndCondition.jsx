import React, { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import GradientButton from "../../components/common/GradiantButton";
import { Button, message, Modal } from "antd";
import {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} from "../../redux/apiSlices/termsAndConditionSlice";

const TermsAndCondition = () => {
  const editor = useRef(null);
  const { data, isLoading } = useGetTermsAndConditionsQuery();
  const [updateTerms] = useUpdateTermsAndConditionsMutation();

  const [termsContent, setTermsContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set content when data is loaded
  useEffect(() => {
    if (data?.content) {
      setTermsContent(data.content);
    }
  }, [data]);

  const showModal = () => setIsModalOpen(true);

  const handleOk = async () => {
    try {
      await updateTerms(termsContent).unwrap();
      message.success("Terms & Conditions updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      message.error("Failed to update Terms & Conditions");
    }
  };

  const handleCancel = () => setIsModalOpen(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Terms & Conditions</h2>
        <Button
          onClick={showModal}
          className="bg-primary hover:!bg-primary/90 text-white hover:!text-white py-5 px-7 font-semibold text-[16px]"
        >
          Update Terms & Conditions
        </Button>
      </div>

      <div className="saved-content mt-6 border p-6 rounded-lg bg-white">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: termsContent }}
            className="prose max-w-none"
          />
        )}
      </div>

      <Modal
        title="Update Terms & Conditions"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width="65%"
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="bg-[#C33739] border border-[#C33739] hover:!border-[#C33739] text-white hover:!text-[#C33739]"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleOk}
            className="bg-primary border border-primary text-white"
          >
            Update Terms & Conditions
          </Button>,
        ]}
      >
        {isModalOpen && (
          <div className="mb-6">
            <JoditEditor
              ref={editor}
              value={termsContent}
              onChange={(newContent) => setTermsContent(newContent)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TermsAndCondition;
