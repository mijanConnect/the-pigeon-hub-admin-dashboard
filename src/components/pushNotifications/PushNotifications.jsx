import React, { useRef, useState } from "react";
import JoditEditor from "jodit-react";
import GradientButton from "../../components/common/GradiantButton";
import { Button, Input, message } from "antd";

const PushNotifications = () => {
  const editor = useRef(null);

  // States
  const [title, setTitle] = useState("");
  const [bodyContent, setBodyContent] = useState("");

  const handleSend = () => {
    if (!title.trim() || !bodyContent.trim()) {
      message.error("Please fill in both title and body before sending.");
      return;
    }
    message.success("Push Notification sent successfully!");
    console.log("Notification Data:", { title, bodyContent });

    // Reset fields after sending
    setTitle("");
    setBodyContent("");
  };

  const handleCancel = () => {
    setTitle("");
    setBodyContent("");
    message.info("Notification draft cleared.");
  };

  return (
    <div className="border rounded-lg px-12 py-8">
      <div className="flex justify-between items-center mb-[50px]">
        <h2 className="text-xl font-bold">Send Push Notifications</h2>
      </div>

      {/* Title Field */}
      <div className="mb-6 flex gap-6 items-center">
        {/* Label - 10% */}
        <div className="basis-[5%]">
          <label className="font-bold text-[18px]">Title</label>
        </div>

        {/* Input - 90% */}
        <div className="basis-[95%]">
          <Input
            placeholder="Enter notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Body Editor */}
      <div className="mb-6 flex gap-6 items-start">
        {/* Label - 10% */}
        <div className="basis-[5%]">
          <label className="font-bold text-[18px]">Body</label>
        </div>

        {/* Editor - 90% */}
        <div className="basis-[95%]">
          <JoditEditor
            ref={editor}
            value={bodyContent}
            onChange={(newContent) => setBodyContent(newContent)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleCancel}
          className="px-12 py-5"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          className="bg-primary text-white px-12 py-5"
        >
          Send
        </Button>
      </div>

      {/* Preview */}
      {(title || bodyContent) && (
        <div className="saved-content mt-6 border p-6 rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          {title && <h4 className="text-md font-bold mb-2">{title}</h4>}
          {bodyContent && (
            <div
              dangerouslySetInnerHTML={{ __html: bodyContent }}
              className="prose max-w-none"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PushNotifications;
