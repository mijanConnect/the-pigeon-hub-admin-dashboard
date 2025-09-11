import React, { useState, useRef } from "react";
import JoditEditor from "jodit-react";
import GradientButton from "../../components/common/GradiantButton";
import { Button, message, Modal } from "antd";

const PrivacyPolicy = () => {
  const editor = useRef(null);

  // Using a single state for both content and saved content
  const [termsContent, setTermsContent] = useState(`
    <h1><strong>Privacy Policy</strong></h1>
    <p>Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use.</p> <br />
    <h3><strong><em>1. General Terms</em></strong></h3>
    <p>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</p><br />
    <h3><strong><em>2. Privacy Policy</em></strong></h3>
    <p>Your use of this website is also subject to our Privacy Policy, which is incorporated by reference.</p><br />
    <h3><strong><em>3. Disclaimer</em></strong></h3>
    <p>The information contained in this website is for general information purposes only. We endeavor to keep the information up to date and correct.</p>
`);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // When saving, just set the content to the saved state
    setIsModalOpen(false);
    message.success("Terms & Conditions updated successfully!");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Privacy Policy</h2>
        <GradientButton
          onClick={showModal}
          className="w-60 bg-secondary text-white h-10"
        >
          Update Privacy Policy
        </GradientButton>
      </div>

      <div className="saved-content mt-6 border p-6 rounded-lg bg-white">
        <div
          dangerouslySetInnerHTML={{ __html: termsContent }}
          className="prose max-w-none"
        />
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
            Update Privacy Policy
          </GradientButton>,
        ]}
      >
        {isModalOpen && (
          <div className="mb-6">
            <JoditEditor
              ref={editor}
              value={termsContent}
              onChange={(newContent) => {
                setTermsContent(newContent);
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PrivacyPolicy;
