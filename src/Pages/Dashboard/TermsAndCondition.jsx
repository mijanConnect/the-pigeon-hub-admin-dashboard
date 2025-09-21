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
        <GradientButton
          onClick={showModal}
          className="w-60 bg-secondary text-white h-10"
        >
          Update Terms & Conditions
        </GradientButton>
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
            className="bg-red-500 text-white mr-2 py-5"
          >
            Cancel
          </Button>,
          <GradientButton
            key="submit"
            onClick={handleOk}
            className="bg-secondary text-white"
          >
            Update Terms & Conditions
          </GradientButton>,
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
